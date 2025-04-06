import type { ExpressDocGenConfigType } from "./config";

export interface RouteParserOptions {
    /**
     * @description The path to the project root directory.
     * @example "."
     */
    projectPath?: string;
    config?: Partial<ExpressDocGenConfigType>;
}

export interface RouteChain {
    content: string;
    startPos: number;
    endPos: number;
}

export interface Route {
    router: string;
    method: string;
    url: string;
    controller: string;
    middlewares: string[];
}
