import { SocketServer, SocketContext } from './socket';
import { HTTPServer, HTTPContext } from './http';
import { Middleware, ServerTypes } from './types';
import { Config } from '../types';
export * from './types';
export { SocketServer, HTTPServer, SocketContext, HTTPContext };
export declare class Server {
    private static instance;
    static servers: Map<string, ServerTypes>;
    private constructor();
    static initialize(servers: Config['servers']): void;
    static get(name: string): ServerTypes | undefined;
    static start(middlewares?: Middleware[]): void;
}
