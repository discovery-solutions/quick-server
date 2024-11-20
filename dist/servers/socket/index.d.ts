import type { SocketContext, WebSocketHandler } from './types';
import { DatabaseInterface } from '../../features/databases';
import type { ServerConfig } from '../../types';
import { Middleware } from '../types';
import * as WebSocket from 'ws';
export { SocketContext };
export declare class SocketServer {
    private routes;
    private middlewares;
    private logger;
    database: DatabaseInterface;
    config: ServerConfig;
    constructor(config: ServerConfig);
    use(middleware: Middleware): void;
    apply(callback: (instance: SocketServer) => any): any;
    on(path: string, handler: WebSocketHandler): void;
    handleConnection(socket: WebSocket): void;
    start(): void;
}
