import { DatabaseInterface } from './types';
export declare class FirestoreDB implements DatabaseInterface {
    private firestore;
    private logger;
    constructor(projectId: string, logs?: boolean);
    insert<T>(collection: string, data: T): Promise<string>;
    get<T>(collection: string, query?: Partial<T>): Promise<T[]>;
    update<T>(collection: string, query: any, data: Partial<T>): Promise<void>;
    delete(collection: string, query: any): Promise<void>;
    bulkInsert<T>(collection: string, data: T[]): Promise<void>;
    bulkUpdate<T>(collection: string, data: any): Promise<void>;
    bulkDelete(collection: string, data: any): Promise<void>;
    search<T>(query: string): Promise<Record<string, T[]>>;
}
