import type { ExpressDocGenConfigType } from "../../types/config";

export const ExpressDocGenConfig: ExpressDocGenConfigType = {
    SERVER_URL: "http://localhost:4000",
    ROUTER_FOLDERS: ["src/routes"],
    ROUTER_FILE_NAMING_PATTERNS: ["*.route.ts"],
    ROUTER_CONFIGURED_IN_APP_FILE: "src/app.ts",
    IGNORED_FOLDERS: [".git", "node_modules", "dist"],
    IGNORED_FILES: [],
    ROUTER_MIDDLEWARE_SCOPE_CONFIG: {
        Admin: ["AdminOnlyRoute"],
        User: ["UserOnlyRoute", "RefreshTokenRoute"],
        Protected: ["ProtectedRoute"],
    },
    POSTMAN_CONFIG: {
        SERVER_URL: {
            NAME: "BASE_URL",
            VARIABLE: true,
        },
        OUTPUT_DIR: "docs",
        POSTMAN_FILENAME: "api.postman_collection.json",
        COLLECTION_NAME: "API Collection",
        COLLECTION_DESCRIPTION: "Auto-generated API collection",
        SCHEMA: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
    },
};
