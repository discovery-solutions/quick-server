import { Middleware } from './servers';
import { Config } from './types';
export * from './types';
export declare class QuickServer {
    config: Config;
    private middlewares;
    static instance: QuickServer;
    constructor(filePath?: string);
    use(middleware: Middleware): void;
    start(): Promise<void>;
    get(name: string): import("./servers").HTTPServer | import("./servers").SocketServer;
}
