import { configTemplates } from "../core/config/templates";
import { fileExists, writeFile } from "../core/utils/fileSystem";
import { isTypeScriptProject } from "../core/utils/project";

/**
 * Initializes the `expodoc.config.ts` or `.js` based on project language.
 */
export function initConfig(): void {
    const isTS = isTypeScriptProject();

    const fileName = `expodoc.config.${isTS ? "ts" : "js"}`;
    const content = isTS
        ? configTemplates.typescript
        : configTemplates.javascript;

    if (fileExists(fileName)) {
        console.log(`✅ Config already exists: ${fileName}`);
        return;
    }

    try {
        writeFile(fileName, content);
        console.log(`✅ Created ${fileName}`);
    } catch (err) {
        console.error("❌ Failed to generate config:", err);
    }
}
