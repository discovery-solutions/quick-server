import { DatabaseInterface } from './types';
export declare class InMemoryDB implements DatabaseInterface {
    private db;
    private logger;
    constructor(logs?: boolean);
    insert<T>(table: string, data: T): Promise<string>;
    get<T>(table: string, query: object): Promise<T[]>;
    update<T>(table: string, query: object, data: T): Promise<void>;
    delete(table: string, query: object): Promise<void>;
    bulkInsert<T>(table: string, raw: T[]): Promise<void>;
    bulkUpdate<T>(table: string, data: T[]): Promise<void>;
    bulkDelete<T>(table: string, data: T[]): Promise<void>;
    search<T>(query: string): Promise<Record<string, T[]>>;
}
