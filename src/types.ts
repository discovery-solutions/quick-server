export interface ServerConfig {
  name: string;
  port: number;
  type: 'rest' | 'socket';
  format: 'json' | 'csv';
  database: string;
  request: {
    limit: number;
  };
}

export interface DatabaseConfig {
  type: 'in-memory' | 'mongodb' | 'mysql' | 'postgresql' | 'sqlite' | 'custom';
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

export interface Config {
  servers: ServerConfig[];
  databases: DatabaseConfig[];
  entities: EntityConfig[];
}
