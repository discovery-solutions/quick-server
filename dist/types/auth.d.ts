import { EntityPermission } from "./entity";
export interface OAuthStrategy {
    clientId: string;
    clientSecret: string;
    authUrl: string;
    tokenUrl: string;
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
    jwt?: {
        secret: string;
        expiresIn: string;
        refreshExpiresIn: string;
        entity: {
            name: string;
            identifiers: string[];
        };
    };
    oauth?: {
        google?: OAuthStrategy;
        facebook?: OAuthStrategy;
    };
}
export interface AuthConfigParams {
    strategies: AuthStrategies;
    permissions: {
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
