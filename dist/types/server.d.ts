export interface ServerConfigParams {
    name: string;
    port: number;
    type: 'rest' | 'socket' | 'file';
    format?: 'json' | 'csv' | 'xml' | 'html' | 'yaml';
    database?: string;
    secure?: boolean;
    request?: {
        limit: number;
        timeout: number;
    };
}
export declare class ServerConfig implements ServerConfigParams {
    name: ServerConfigParams['name'];
    port: ServerConfigParams['port'];
    type: ServerConfigParams['type'];
    format?: ServerConfigParams['format'];
    database?: ServerConfigParams['database'];
    path?: string;
    secure?: ServerConfigParams['secure'];
    request: ServerConfigParams['request'];
    constructor(parameters: ServerConfigParams);
}
