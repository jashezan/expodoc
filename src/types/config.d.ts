export interface ExpressDocGenConfigType {
    /**
     * @description Base URL for the server, used in Postman collection.
     * @example "http://localhost:4000"
     */
    SERVER_URL: string;
    /**
     * @description Folders where router files are located.
     * @example ["src/routes"]
     */
    ROUTER_FOLDERS: string[];
    /**
     * @description Patterns for router file names.
     * @example ["*.route.ts"]
     */
    ROUTER_FILE_NAMING_PATTERNS: string[];
    /**
     * @description Path to the app file where routers are configured.
     * @example "src/app.ts"
     */
    ROUTER_CONFIGURED_IN_APP_FILE: string;
    /**
     * @description Folders to ignore while searching for router files.
     * @example [".git", "node_modules", "dist"]
     */
    IGNORED_FOLDERS: string[];
    /**
     * @description Files to ignore while searching for router files.
     * @example []
     */
    IGNORED_FILES: string[];
    /**
     * @description Middleware scope configuration for tagging controllers.
     * @example { "Admin": ["AdminOnlyRoute"], "User": ["UserOnlyRoute", "RefreshTokenRoute"] }
     */
    ROUTER_MIDDLEWARE_SCOPE_CONFIG: { [key: string]: string[] };
    /**
     * @description Configuration for Postman collection generation.
     */
    POSTMAN_CONFIG: {
        /**
         * @description Base URL for the server, used in Postman collection.
         * @example "http://localhost:4000"
         */
        SERVER_URL: {
            /**
             * @description Name of the variable in Postman.
             * @example "BASE_URL"
             */
            NAME: string;
            /**
             * @description Whether to use as a variable in Postman.
             * @example true
             */
            VARIABLE: boolean;
        };
        /**
         * @description Output directory for the Postman collection.
         * @example "docs"
         */
        OUTPUT_DIR: string;
        /**
         * @description Filename for the Postman collection.
         * @example "api-v2.postman_collection.json"
         */
        POSTMAN_FILENAME: string;
        /**
         * @description Name of the Postman collection.
         * @example "API v2 Collection"
         */
        COLLECTION_NAME: string;
        /**
         * @description Description of the Postman collection.
         * @example "Just a collection of API endpoints for testing purposes."
         */
        COLLECTION_DESCRIPTION: string;
        /**
         * @description Schema version for the Postman collection.
         * @example "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
         */
        SCHEMA: string;
    };
}
