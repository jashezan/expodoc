import type { ExpressDocGenConfigType } from "../../types/config";

export function validateConfig(config: any): ExpressDocGenConfigType {
    const requiredFields = [
        "SERVER_URL",
        "ROUTER_FOLDERS",
        "ROUTER_FILE_NAMING_PATTERNS",
        "POSTMAN_CONFIG",
    ];

    for (const field of requiredFields) {
        if (!config[field]) {
            throw new Error(`Missing required config field: ${field}`);
        }
    }

    if (!Array.isArray(config.ROUTER_FOLDERS)) {
        throw new Error("ROUTER_FOLDERS must be an array");
    }

    if (typeof config.SERVER_URL !== "string") {
        throw new Error("SERVER_URL must be a string");
    }

    return {
        ...config,
        IGNORED_FOLDERS: config.IGNORED_FOLDERS || [],
        IGNORED_FILES: config.IGNORED_FILES || [],
        ROUTER_MIDDLEWARE_SCOPE_CONFIG:
            config.ROUTER_MIDDLEWARE_SCOPE_CONFIG || {},
    };
}
