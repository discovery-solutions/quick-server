import { SocketServer, SocketContext } from './socket';
import { HTTPServer, HTTPContext } from './http';
import { Middleware } from './types';
import { Config } from '../types';
export * from './types';
export { SocketServer, HTTPServer, SocketContext, HTTPContext };
export declare class Server {
    private static instance;
    private servers;
    private constructor();
    static initialize(servers: Config['servers']): void;
    static get(name: string): HTTPServer | SocketServer | undefined;
    static start(middlewares?: Middleware[]): void;
}
