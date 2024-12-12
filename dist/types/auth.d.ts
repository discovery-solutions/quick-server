import { EntityPermission } from "./entity";
export interface JWTStrategy {
    secret: string;
    refreshToken: {
        enabled: boolean;
        expiration: string;
    };
    entity: {
        name: string;
        identifiers?: string[];
        mapper?: Record<string, string>;
    };
}
export interface OAuthStrategy {
    clientId: string;
    clientSecret: string;
    authUrl: string;
    tokenUrl: string;
    userInfoUrl: string;
    scope?: string;
    entity: {
        name: string;
        identifier: string;
        mapper: Record<string, string>;
    };
    refreshToken?: {
        enabled: boolean;
        expiration: string;
    };
}
export interface AuthStrategies {
    jwt?: JWTStrategy;
    oauth?: {
        google?: OAuthStrategy;
        github?: OAuthStrategy;
        linkedin?: OAuthStrategy;
        facebook?: OAuthStrategy;
        firebase?: OAuthStrategy;
        [key: string]: OAuthStrategy;
    };
}
export interface AuthConfigParams {
    strategies: AuthStrategies;
    permissions: {
        whitelist: string[];
        default: EntityPermission;
        entities: {
            [entity: string]: {
                [role: string]: EntityPermission;
            };
        };
    };
}
export declare class AuthConfig implements AuthConfigParams {
    strategies: AuthConfigParams['strategies'];
    permissions: AuthConfigParams['permissions'];
    constructor(parameters?: Partial<AuthConfigParams>);
}
