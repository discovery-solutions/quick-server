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

export class ServerConfig implements ServerConfigParams {
  name: string;
  port: number;
  type: 'rest' | 'socket';
  format: 'json' | 'csv' | 'xml' | 'html' | 'yaml';
  database: string;
  request = {
    timeout: 1000 * 60, // default: 60 segundos
    limit: 10,
  };
  
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