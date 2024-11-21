import { DatabaseInterface } from './types';
import mysql from 'mysql2/promise';
export declare class MySqlDB implements DatabaseInterface {
    private connection;
    private logger;
    constructor(config: mysql.ConnectionOptions, logs?: boolean);
    private connect;
    insert<T>(table: string, data: T): Promise<string>;
    get<T>(table: string, query?: object): Promise<T[]>;
    update<T>(table: string, query: object, data: T): Promise<void>;
    delete(table: string, query: object): Promise<void>;
    bulkInsert<T>(table: string, data: T[]): Promise<void>;
    bulkUpdate<T>(table: string, data: T[]): Promise<void>;
    bulkDelete<T>(table: string, data: T[]): Promise<void>;
    search<T>(query: string): Promise<Record<string, T[]>>;
}
