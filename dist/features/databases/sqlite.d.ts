import { DatabaseInterface } from './types';
export declare class SqliteDB implements DatabaseInterface {
    private db;
    private logger;
    constructor(dbFile: string, logs?: boolean);
    private runQuery;
    private allQuery;
    insert<T>(table: string, data: T): Promise<number>;
    get<T>(table: string, query: object): Promise<T[]>;
    update<T>(table: string, query: object, data: T): Promise<void>;
    delete(table: string, query: object): Promise<void>;
    bulkInsert<T>(table: string, data: T[]): Promise<void>;
    bulkUpdate<T>(table: string, data: T[]): Promise<void>;
    bulkDelete<T>(table: string, data: T[]): Promise<void>;
    search<T>(query: string): Promise<Record<string, T[]>>;
    private getTables;
    private getColumns;
}
