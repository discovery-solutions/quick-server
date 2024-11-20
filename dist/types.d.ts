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
    refreshToken: {
        enabled: boolean;
        expiration: string;
    };
    entity: {
        name: string;
        identifier: string;
        mapper?: Record<string, string>;
    };
}
export interface AuthStrategies {
    jwt?: JWTStrategy;
    oauth?: {
        google?: OAuthStrategy;
        facebook?: OAuthStrategy;
    };
    refreshToken?: {
        enabled: boolean;
        expiration: string;
    };
}
export interface AuthConfig {
    strategies: AuthStrategies;
    permissions: {
        default: {
            [entity: string]: EntityPermission;
        };
        entities: {
            [entity: string]: {
                [role: string]: EntityPermission;
            };
        };
    };
}
export interface ServerConfigParams {
    name: string;
    port: number;
    type: 'rest' | 'socket' | 'file';
    format?: 'json' | 'csv' | 'xml' | 'html' | 'yaml';
    database?: string;
    request?: {
        limit: number;
        timeout: number;
    };
}
export declare class ServerConfig implements ServerConfigParams {
    name: string;
    port: number;
    type: ServerConfigParams['type'];
    format?: ServerConfigParams['format'];
    database?: string;
    path?: string;
    request: ServerConfigParams['request'];
    constructor(parameters: ServerConfigParams);
}
export interface DatabaseConfig {
    type: 'in-memory' | 'mongodb' | 'mysql' | 'postgresql' | 'sqlite' | 'custom';
    logs?: boolean;
    key: string;
    host?: string;
    user?: string;
    password?: string;
    database?: string;
    uri?: string;
    name?: string;
}
export interface EntityField {
    type: 'string' | 'number' | 'boolean' | 'file' | 'object' | 'array' | 'entity';
    required?: boolean;
    secure?: boolean;
    entity?: string;
}
export interface EntityPermission {
    insert: boolean;
    update: boolean;
    delete: boolean;
    list: boolean;
    get: boolean;
}
export interface EntityConfig {
    name: string;
    alias: string;
    fields: {
        [key: string]: EntityField | string;
    };
    auth?: {
        type: 'jwt';
        fields: string[];
        permissions: {
            [role: string]: EntityPermission;
        };
    };
}
export interface DeveloperConfig {
    logger?: {
        formatted?: boolean;
        verbose?: boolean;
    };
}
export interface Config {
    auth?: AuthConfig;
    servers: ServerConfig[];
    databases: DatabaseConfig[];
    entities: EntityConfig[];
    developer: DeveloperConfig;
}
