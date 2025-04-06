import {
    existsSync,
    mkdirSync,
    readFileSync,
    readdirSync,
    writeFileSync,
} from "node:fs";
import { basename, join, resolve } from "node:path";
import { ExpressDocGenConfig } from "../../core/config/defaults";
import type { ExpressDocGenConfigType } from "../../types/config";
import type { Route } from "../../types/index";
import type {
    PostmanCollectionInfo,
    PostmanItem,
    PostmanRequest,
    PostmanUrl,
    PostmanVariable,
} from "../../types/postman";
import { normalizeToSentenceCase } from "../utils/stringUtils";

export class RouteParser {
    private projectPath: string;
    private routerBasePaths: { [key: string]: string };
    private routes: Route[];
    private config: Partial<ExpressDocGenConfigType>;

    constructor(projectPath = ".", config = ExpressDocGenConfig) {
        this.projectPath = resolve(projectPath);
        this.routerBasePaths = {};
        this.routes = [];
        this.config = config;
    }

    private loadConfigFromAppFile(): void {
        const appFilePath = join(
            this.projectPath,
            this.config.ROUTER_CONFIGURED_IN_APP_FILE!,
        );
        if (!existsSync(appFilePath)) return;

        const content = readFileSync(appFilePath, "utf-8");
        const pattern = /app\.use\((["'])(.*?)\1\s*,\s*([a-zA-Z0-9_]+)\)/g;
        let match: RegExpExecArray | null;

        match = pattern.exec(content);
        while (match !== null) {
            match = pattern.exec(content);
            if (match === null) break;
            const basePath = match[2];
            const routerVar = match[3];
            this.routerBasePaths[routerVar] = basePath;
        }
    }

    private findRouterFiles(): string[] {
        const routerFiles: string[] = [];

        for (const folderPattern of this.config.ROUTER_FOLDERS!) {
            const folderPath = join(this.projectPath, folderPattern);
            if (!existsSync(folderPath)) continue;

            for (const filePattern of this.config
                .ROUTER_FILE_NAMING_PATTERNS!) {
                const files = this.globFiles(folderPath, filePattern);
                for (const filePath of files) {
                    if (
                        this.config.IGNORED_FOLDERS?.some((ignored) =>
                            filePath.includes(ignored),
                        )
                    )
                        continue;
                    if (this.config.IGNORED_FILES?.includes(basename(filePath)))
                        continue;
                    routerFiles.push(filePath);
                }
            }
        }
        return routerFiles;
    }

    private globFiles(dir: string, pattern: string): string[] {
        const files: string[] = [];
        const entries = readdirSync(dir, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = join(dir, entry.name);
            if (entry.isDirectory()) {
                files.push(...this.globFiles(fullPath, pattern));
            } else if (this.matchPattern(entry.name, pattern)) {
                files.push(fullPath);
            }
        }
        return files;
    }

    private matchPattern(filename: string, pattern: string): boolean {
        const regex = new RegExp(`^${pattern.replace(/\*/g, ".*")}$`);
        return regex.test(filename);
    }

    parseRouterFile(filePath: string): void {
        const content = readFileSync(filePath, "utf-8");
        const routerVarMatch =
            /(?:const|let|var)\s+([a-zA-Z0-9_]+)\s*=\s*Router\(\)|default\s+Router\(\)/.exec(
                content,
            );
        if (!routerVarMatch) return;

        const routerVar =
            routerVarMatch[1] || basename(filePath).replace(".route", "Router");
        const basePath = this.routerBasePaths[routerVar] || "";
        this.processRouteDefinitions(content, basePath, routerVar);
    }

    private processRouteDefinitions(
        content: string,
        basePath: string,
        routerVar: string,
    ): void {
        // const cleanedContent = content
        //     .replace(/\/\/.*?\n|\/\*.*?\*\//gs, '')
        //     .replace(/\s+/g, ' ');
        const cleanedContent = content
            .replace(/\/\/.*?\n/g, "") // Remove single-line comments
            .replace(/\/\*[\s\S]*?\*\//g, "") // Remove multi-line comments
            .replace(/\s+/g, " "); // Replace multiple spaces with a single space

        const routePattern =
            /([a-zA-Z0-9_]+)\.(?:route\((["'])(.*?)\2\)|(get|post|put|delete|patch|options|head|all)\((["'])(.*?)\5)\s*\)?/g;
        let match: RegExpExecArray | null;

        match = routePattern.exec(cleanedContent);
        while (match !== null) {
            match = routePattern.exec(cleanedContent);
            if (match === null) break;
            const routerVarMatch = match[1];
            const routePath = match[3] || match[6];
            const httpMethod = match[4]?.toLowerCase();

            const chainStart = match.index;
            const chainEnd = this.findEndOfChain(cleanedContent, chainStart);
            const chainContent = cleanedContent.slice(chainStart, chainEnd);

            if (!httpMethod) {
                this.processRouteChain(
                    chainContent,
                    basePath,
                    routePath,
                    routerVarMatch,
                );
            } else {
                this.processSingleRoute(
                    chainContent,
                    basePath,
                    routePath,
                    httpMethod,
                    routerVarMatch,
                );
            }
        }
    }

    private findEndOfChain(content: string, startPos: number): number {
        let balance = 0;
        for (let i = startPos; i < content.length; i++) {
            if (content[i] === "(") balance++;
            else if (content[i] === ")") {
                balance--;
                if (balance === 0) {
                    for (let j = i; j < content.length; j++) {
                        if (content[j] === ";" || content[j] === "\n")
                            return j + 1;
                    }
                    return i + 1;
                }
            }
        }
        return content.length;
    }

    private tagControllerWithScope(
        controller: string,
        middlewares: string[],
    ): string {
        for (const [scope, scopeMiddlewares] of Object.entries(
            this.config.ROUTER_MIDDLEWARE_SCOPE_CONFIG!,
        )) {
            if (scopeMiddlewares.some((mw) => middlewares.includes(mw))) {
                return `${controller} (${scope})`;
            }
        }
        return controller;
    }

    private processRouteChain(
        chainContent: string,
        basePath: string,
        routePath: string,
        routerVar: string,
    ): void {
        const methodPattern =
            /\.(get|post|put|delete|patch|options|head|all)\(/g;
        let methodMatch: RegExpExecArray | null;

        methodMatch = methodPattern.exec(chainContent);
        while (methodMatch !== null) {
            methodMatch = methodPattern.exec(chainContent);
            if (methodMatch === null) break;
            const httpMethod = methodMatch[1].toLowerCase();
            let startPos = methodMatch.index + methodMatch[0].length;
            let balance = 1;
            let endPos = startPos;

            while (endPos < chainContent.length && balance > 0) {
                if (chainContent[endPos] === "(") balance++;
                else if (chainContent[endPos] === ")") balance--;
                endPos++;
            }

            const argsContent = chainContent.slice(startPos, endPos - 1);
            this.processRouteArgs(
                argsContent,
                basePath,
                routePath,
                httpMethod,
                routerVar,
            );
        }
    }

    private processSingleRoute(
        chainContent: string,
        basePath: string,
        routePath: string,
        httpMethod: string,
        routerVar: string,
    ): void {
        const argsStart = chainContent.indexOf("(") + 1;
        const argsEnd = chainContent.lastIndexOf(")");
        const argsContent = chainContent.slice(argsStart, argsEnd);
        this.processRouteArgs(
            argsContent,
            basePath,
            routePath,
            httpMethod,
            routerVar,
        );
    }

    private processRouteArgs(
        argsContent: string,
        basePath: string,
        routePath: string,
        httpMethod: string,
        routerVar: string,
    ): void {
        const args = this.splitArgsWithBalance(argsContent);
        if (!args.length) return;

        let controller: string | null = null;
        const middlewares: string[] = [];

        for (const arg of args) {
            const trimmedArg = arg.trim();
            if (!trimmedArg) continue;

            if (
                !controller &&
                (middlewares.length < args.length - 1 ||
                    trimmedArg.includes("("))
            ) {
                middlewares.push(trimmedArg);
            } else {
                controller = trimmedArg.replace(/,\s+$/, "");
            }
        }

        if (!controller) return;

        const fullPath = `${basePath}/${routePath}`
            .replace("//", "/")
            .replace(/\/$/, "");
        const fullUrl = `${this.config.SERVER_URL}${fullPath}`;

        controller = this.normalizeCaseToSentence(controller);
        controller = this.tagControllerWithScope(controller, middlewares);
        const normalizedRouterVar = this.normalizeCaseToSentence(
            routerVar.replace(/Router/g, "").trim(),
        );

        this.routes.push({
            router: normalizedRouterVar,
            method: httpMethod.toUpperCase(),
            url: fullUrl,
            controller,
            middlewares,
        });
    }

    private normalizeCaseToSentence(inputStr: string): string {
        if (!inputStr || typeof inputStr !== "string") return inputStr;

        let normalized = normalizeToSentenceCase(inputStr);

        if (normalized) {
            const words = normalized.split(" ");
            if (words[0]) {
                words[0] =
                    words[0][0].toUpperCase() + words[0].slice(1).toLowerCase();
            }
            for (let i = 1; i < words.length; i++) {
                if (words[i].length > 1 && words[i] === words[i].toUpperCase())
                    continue;
                words[i] = words[i].toLowerCase();
            }
            normalized = words.join(" ");
        }
        return normalized;
    }

    private splitArgsWithBalance(argsContent: string): string[] {
        const args: string[] = [];
        let currentArg = "";
        let parenBalance = 0;
        let bracketBalance = 0;
        let inString = false;
        let stringChar: string | null = null;

        for (const char of argsContent) {
            if ((char === '"' || char === "'") && !inString) {
                inString = true;
                stringChar = char;
            } else if (char === stringChar && inString) {
                inString = false;
                stringChar = null;
            }

            if (!inString) {
                if (
                    char === "," &&
                    parenBalance === 0 &&
                    bracketBalance === 0
                ) {
                    args.push(currentArg.trim());
                    currentArg = "";
                    continue;
                } else if (char === "(") parenBalance++;
                else if (char === ")") parenBalance--;
                else if (char === "{") bracketBalance++;
                else if (char === "}") bracketBalance--;
            }
            currentArg += char;
        }

        if (currentArg.trim()) args.push(currentArg.trim());
        return args;
    }

    private getPostmanCollectionServerUrl(): string {
        return this.config.POSTMAN_CONFIG?.SERVER_URL.VARIABLE
            ? `{{${this.config.POSTMAN_CONFIG.SERVER_URL.NAME}}}`
            : this.config.POSTMAN_CONFIG?.SERVER_URL.NAME!;
    }

    private generatePostmanCollection(
        baseUrlVar = this.getPostmanCollectionServerUrl(),
        outputDir = this.config.POSTMAN_CONFIG?.OUTPUT_DIR!,
        postmanFilename = this.config.POSTMAN_CONFIG?.POSTMAN_FILENAME!,
    ): string {
        if (!this.routes || !this.routes.length) {
            throw new Error("Routes are not available or are empty.");
        }

        const folders: { [key: string]: PostmanItem[] } = {};

        for (const route of this.routes) {
            const { router, method, url: fullUrl, controller } = route;
            // const parsedUrl = url.parse(fullUrl);
            const parsedUrl = new URL(fullUrl);
            const pathOnly = parsedUrl.pathname || "";

            const pathParts: string[] = [];
            const variables: PostmanVariable[] = [];

            for (const part of pathOnly.split("/").filter(Boolean)) {
                if (part.startsWith(":")) {
                    const key = part.slice(1);
                    const defaultVal =
                        key.toLowerCase().includes("id") ||
                        key.toLowerCase().includes("phone")
                            ? "1"
                            : "John";
                    pathParts.push(`:${key}`);
                    variables.push({ key, value: defaultVal });
                } else {
                    pathParts.push(part);
                }
            }

            const rawUrl = `${baseUrlVar}/${pathParts.join("/")}`;
            const urlObj: PostmanUrl = {
                raw: rawUrl,
                host: [baseUrlVar],
                path: pathParts,
            };
            if (variables.length) urlObj.variable = variables;

            const requestObj: PostmanRequest = {
                method,
                header: [],
                url: urlObj,
            };

            if (["POST", "PUT", "PATCH"].includes(method)) {
                requestObj.body = {
                    mode: "raw",
                    raw: '{\n  "example_key": "example_value"\n}',
                    options: { raw: { language: "json" } },
                };
            }

            folders[router] = folders[router] || [];
            folders[router].push({
                name: controller,
                request: requestObj,
                response: [],
            });
        }

        const postmanJson: {
            info: PostmanCollectionInfo;
            item: PostmanItem[] | any;
            variable: PostmanVariable[];
        } = {
            info: {
                _postman_id: "generated-id-1234",
                name: this.config.POSTMAN_CONFIG?.COLLECTION_NAME!,
                description:
                    this.config.POSTMAN_CONFIG?.COLLECTION_DESCRIPTION!,
                schema: this.config.POSTMAN_CONFIG?.SCHEMA!,
            },
            item: Object.entries(folders).map(([name, items]) => ({
                name,
                item: items,
            })),
            variable: [
                {
                    key: this.config.POSTMAN_CONFIG?.SERVER_URL.NAME!,
                    value: this.config.SERVER_URL!,
                    type: "string",
                },
            ],
        };

        mkdirSync(outputDir, { recursive: true });
        const postmanPath = join(outputDir, postmanFilename);
        writeFileSync(
            postmanPath,
            JSON.stringify(postmanJson, null, 4),
            "utf-8",
        );
        return postmanPath;
    }

    parseAllRoutes(): void {
        this.loadConfigFromAppFile();
        const routerFiles = this.findRouterFiles();
        for (const routerFile of routerFiles) {
            this.parseRouterFile(routerFile);
        }
        this.routes.sort((a, b) => a.url.localeCompare(b.url));
    }

    getRoutesJson(): string {
        return JSON.stringify(this.routes, null, 4);
    }

    createPostmanFile(): string {
        return this.generatePostmanCollection(undefined, "prompts");
    }
}
