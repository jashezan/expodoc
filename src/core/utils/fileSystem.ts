import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

export function ensureDirectoryExists(filePath: string): void {
    const dir = dirname(filePath);
    if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
    }
}

export function readFile(filePath: string): string {
    return readFileSync(resolve(filePath), "utf8");
}

export function writeFile(filePath: string, content: string): void {
    ensureDirectoryExists(filePath);
    writeFileSync(resolve(filePath), content, "utf8");
}

export function fileExists(filePath: string): boolean {
    return existsSync(resolve(filePath));
}
