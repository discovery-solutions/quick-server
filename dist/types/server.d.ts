export interface ServerConfigParams {
    name: string;
    port: number;
    type: 'rest' | 'socket';
    format: 'json' | 'csv' | 'xml' | 'html' | 'yaml';
    database: string;
    request: {
        limit: number;
        timeout: number;
    };
}
export declare class ServerConfig implements ServerConfigParams {
    name: string;
    port: number;
    type: 'rest' | 'socket';
    format: 'json' | 'csv' | 'xml' | 'html' | 'yaml';
    database: string;
    request: {
        timeout: number;
        limit: number;
    };
    constructor(parameters: ServerConfigParams);
}
