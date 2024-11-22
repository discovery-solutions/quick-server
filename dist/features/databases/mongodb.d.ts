import { DatabaseInterface } from './types';
export declare class MongoDB implements DatabaseInterface {
    private db;
    private logger;
    constructor(uri: string, dbName: string, logs?: boolean);
    private parse;
    private addTimestamps;
    private transformResult;
    insert<T>(table: string, data: T): Promise<string>;
    get<T>(table: string, query?: Record<string, any>): Promise<T[]>;
    update<T>(table: string, query: Record<string, any>, data: T): Promise<void>;
    delete(table: string, query?: Record<string, any>): Promise<void>;
    bulkInsert<T>(table: string, data: T[]): Promise<void>;
    bulkUpdate<T>(table: string, data: T[]): Promise<void>;
    bulkDelete<T>(table: string, data: T[]): Promise<void>;
    search<T>(query: string): Promise<Record<string, T[]>>;
}
