import { type Dirent, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

/**
 * Recursively checks if there's at least one `.ts` file in the given directory.
 */
function hasTSFiles(dir: string): boolean {
    try {
        const entries: Dirent[] = readdirSync(dir, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = join(dir, entry.name);
            if (entry.isDirectory()) {
                if (hasTSFiles(fullPath)) return true;
            } else if (
                entry.name.endsWith(".ts") &&
                !entry.name.endsWith(".d.ts")
            ) {
                return true;
            }
        }

        return false;
    } catch {
        return false;
    }
}

/**
 * Determines if the current project uses TypeScript.
 */
export function isTypeScriptProject(): boolean {
    return existsSync("tsconfig.json") || hasTSFiles("src");
}
