
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

export class ServerConfig implements ServerConfigParams {
  name: ServerConfigParams['name'];
  port: ServerConfigParams['port'];
  type: ServerConfigParams['type'];
  format?: ServerConfigParams['format'];
  database?: ServerConfigParams['database'];
  path?: string;
  secure?: ServerConfigParams['secure'];
  request: ServerConfigParams['request'];
  
  constructor(parameters: ServerConfigParams) {
    for (const key in parameters)
      this[key] = parameters[key];

    if (typeof this.format === 'undefined') this.format = 'json';
    if (typeof this.type === 'undefined') this.type = 'rest';

    if (typeof this.request.limit === 'undefined') this.request.limit = 10;
    if (typeof this.request.timeout === 'undefined') this.request.timeout = 1000 * 60;
    else this.request.timeout *= 1000;
  }
}