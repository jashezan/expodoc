export interface PostmanCollection {
    info: PostmanCollectionInfo;
    item: PostmanItem[];
    variable?: PostmanVariable[];
}

export interface PostmanCollectionInfo {
    name: string;
    description: string;
    schema: string;
    _postman_id: string;
    variables?: PostmanVariable[];
}

export interface PostmanRequest {
    method: string;
    body?: PostmanRequestBody;
    header: PostmanRequestHeader[];
    description?: string;
    query?: PostmanRequestQuery[];
    path?: PostmanRequestQuery[];
    auth?: PostmanRequestAuth;
    url: PostmanUrl;
}

export interface PostmanRequestAuth {
    type: string;
    basic?: [];
    jwt?: PostmanRequestAuthCommonType[];
    oauth2?: PostmanRequestAuthCommonType[];
    bearer?: PostmanRequestAuthCommonType[];
    apikey?: PostmanRequestAuthCommonType[];
    [key: string]: PostmanRequestAuthCommonType[] | any;
}

export interface PostmanRequestAuthCommonType {
    type?: string;
    key?: string;
    value?: string;
}

export interface PostmanRequestQuery {
    key: string;
    value: string;
    description?: string;
    disabled?: boolean;
}
export interface PostmanUrl {
    raw: string;
    host: string[];
    path: string[];
    variable?: PostmanVariable[];
}

export interface PostmanVariable {
    key: string;
    value: string;
    description?: string;
    type?: string;
    disabled?: boolean;
}

export interface PostmanRequestHeader {
    key: string;
    value: string;
    description?: string;
    type?: string;
    disabled?: boolean;
}

export interface PostmanRequestBodyUrlencoded {
    key: string;
    value: string;
    description?: string;
    type?: string;
    disabled?: boolean;
}

export interface PostmanRequestBodyFormdata {
    key: string;
    value: string;
    description?: string;
    type?: "text" | "file" | string;
    disabled?: boolean;
    src?: string;
}

export interface PostmanRequestBody {
    mode: "raw" | "urlencoded" | "formdata" | "file" | "json" | string | any;
    urlencoded?: PostmanRequestBodyUrlencoded[];
    formdata?: PostmanRequestBodyFormdata[];
    file?: any[];
    json?: any;
    raw?: string;
    options?: {
        raw?: {
            language?: "json" | string;
        };
    };
}

export interface PostmanItemProtocolProfileBehavior {
    disableBodyPruning?: boolean;
    disablePostmanEcho?: boolean;
    disablePruning?: boolean;
    disableVisualizer?: boolean;
    disableTests?: boolean;
    disablePreRequestScript?: boolean;
    disableCookieJar?: boolean;
    disableInterceptor?: boolean;
    disableSSLVerification?: boolean;
    disableFollowRedirects?: boolean;
    disableSendCookies?: boolean;
    disableSendCookiesForRedirect?: boolean;
    disableSendCookiesForRedirects?: boolean;
    [key: string]: any;
}

export interface PostmanItem {
    name: string;
    request: PostmanRequest;
    protocolProfileBehavior?: PostmanItemProtocolProfileBehavior;
    description?: string;
    response: any[] | undefined | null | any;
}
