
export interface ServerConfigParams {
  name: string;
  port: number;
  type: 'rest' | 'socket';
  format: 'json' | 'csv' | 'xml' | 'html' | 'yaml';
  database: string;
  request: {
    limit: number;
  };
}

export class ServerConfig implements ServerConfigParams {
  name: string;
  port: number;
  type: 'rest' | 'socket';
  format: 'json' | 'csv' | 'xml' | 'html' | 'yaml';
  database: string;
  request: {
    limit: number;
  };
  
  constructor(parameters: ServerConfigParams) {
    for (const key in parameters)
      this[key] = parameters[key];

    if (typeof this.format === 'undefined') this.format = 'json';
    if (typeof this.type === 'undefined') this.type = 'rest';
  }
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
  type: 'string' | 'number' | 'boolean' | 'file' | 'object' | 'array';
  required?: boolean;
  secure?: boolean;
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
  }
}

export interface Config {
  servers: ServerConfig[];
  databases: DatabaseConfig[];
  entities: EntityConfig[];
  developer: DeveloperConfig;
}
