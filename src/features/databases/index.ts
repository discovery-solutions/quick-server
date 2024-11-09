export interface Database {
  insert<T>(table: string, data: T): Promise<void>;
  get<T>(table: string, query: object): Promise<T[]>;
  update<T>(table: string, query: object, data: T): Promise<void>;
  delete(table: string, query: object): Promise<void>;
  bulkInsert<T>(table: string, data: T[]): Promise<void>;
}

export * from './in-memory';
export * from './mongodb';
export * from './mysql';
export * from './postgresql';
export * from './sqlite';