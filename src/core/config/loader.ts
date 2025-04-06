import { existsSync } from "node:fs";
import { resolve } from "node:path";
import type { ExpressDocGenConfigType } from "../../types/config";
import { ExpressDocGenConfig } from "./defaults";
import { validateConfig } from "./validator";

export async function loadConfig(): Promise<ExpressDocGenConfigType> {
    const configPaths = [
        resolve("docgen.config.ts"),
        resolve("docgen.config.js"),
        resolve("expodoc.config.ts"),
        resolve("expodoc.config.js"),
    ];

    const configPromises = configPaths.map(async (path) => {
        if (existsSync(path)) {
            try {
                const configModule = await import(path);
                const userConfig = configModule.default || configModule;
                return validateConfig({
                    ...ExpressDocGenConfig,
                    ...userConfig,
                });
            } catch (error) {
                throw new Error(
                    `Error loading config file ${path}: ${error instanceof Error ? error.message : String(error)}`,
                );
            }
        }
        return null;
    });

    const configs = await Promise.all(configPromises);
    const validConfig = configs.find((config) => config !== null);

    if (validConfig) {
        return validConfig;
    }

    return ExpressDocGenConfig;
}
