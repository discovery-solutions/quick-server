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