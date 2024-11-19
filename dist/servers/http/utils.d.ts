import { IncomingMessage, ServerResponse } from 'http';
import { RouteHandler } from './types';
declare function jsonParser(request: IncomingMessage, _: ServerResponse, __: () => Promise<any>): Promise<unknown>;
declare function formParser(request: IncomingMessage, _: ServerResponse, __: () => Promise<any>): Promise<unknown>;
declare function corsMiddleware(request: IncomingMessage, response: ServerResponse): Promise<void>;
export declare const NativeMiddlewares: {
    jsonParser: typeof jsonParser;
    formParser: typeof formParser;
    corsMiddleware: typeof corsMiddleware;
};
export declare function findRoute(pathname: string, method: string, routes: any): RouteHandler | undefined;
export {};
