import { RouteParser } from "../index";
import { helpCommand } from "./help";
import { initConfig } from "./init";
const packageJson = require("../../package.json");

function main(): void {
    if (process.argv.includes("--version")) {
        console.log(`✅ ExpressDocgen CLI v${packageJson.version}`);
        process.exit(0);
    } else if (process.argv.includes("--help") || process.argv.includes("-h")) {
        helpCommand();
        process.exit(0);
    } else if (process.argv.includes("--init")) {
        initConfig();
        process.exit(0);
    } else if (process.argv.includes("--postman")) {
        const projectPath = process.argv[3] || ".";
        const parser = new RouteParser(projectPath);
        parser.parseAllRoutes();
        const postmanPath = parser.createPostmanFile();
        console.log(`✅ Postman collection generated at: ${postmanPath}`);
    } else if (process.argv.includes("--print")) {
        const projectPath = process.argv[3] || ".";
        const parser = new RouteParser(projectPath);
        parser.parseAllRoutes();
        console.log("✅ Routes JSON:");
        console.log(parser.getRoutesJson());
    } else {
        console.log(
            "❌ Invalid command. Use --help to see available commands.",
        );
    }
}

try {
    main();
} catch (error) {
    console.error("❌ An error occurred while executing the command:", error);
    process.exit(1);
}
