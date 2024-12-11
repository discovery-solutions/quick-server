import { Middleware } from './servers';
import { EntityManager } from './features/entity';
import { Database } from './features/databases';
import { Config } from './types';
export * from './types';
export { Database, EntityManager };
export declare class QuickServer {
    config: Config;
    private middlewares;
    static instance: QuickServer;
    constructor(filePath?: string);
    use(middleware: Middleware): void;
    start(): Promise<void>;
    get(name: string): import("./servers").ServerTypes;
}
