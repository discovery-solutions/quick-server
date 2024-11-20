import { DatabaseInterface } from '../../features/databases';
import { HTTPContext, RouteHandler } from './types';
import { Middleware, RequestParams } from '../types';
import { ServerConfig } from '../../types';
export { HTTPContext };
export declare class HTTPServer {
    private routes;
    private middlewares;
    private basePath;
    database: DatabaseInterface;
    config: ServerConfig;
    constructor(config: ServerConfig);
    apply(callback: (instance: HTTPServer) => any): any;
    use(middleware: Middleware): void;
    get(path: string, handler: RouteHandler): void;
    post(path: string, handler: RouteHandler): void;
    put(path: string, handler: RouteHandler): void;
    patch(path: string, handler: RouteHandler): void;
    delete(path: string, handler: RouteHandler): void;
    group(prefix: string, callback: () => void): void;
    private _register;
    handleRequest: (req: HTTPContext["request"], res: HTTPContext["response"]) => Promise<any>;
    extractParams(pathname: string): RequestParams;
    start(): void;
}
