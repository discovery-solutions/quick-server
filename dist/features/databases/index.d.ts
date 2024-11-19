import { Config } from '../../types';
import { DatabaseInterface } from './types';
export * from './types';
export declare class Database {
    private static instance;
    private databases;
    private constructor();
    static initialize(config: Config['databases']): Database;
    static get(name: string): DatabaseInterface | undefined;
}
