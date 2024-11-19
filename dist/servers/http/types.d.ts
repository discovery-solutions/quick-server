import { IncomingMessage, ServerResponse } from 'http';
import { Context } from '../types';
export interface HTTPContext extends Context {
    request: IncomingMessage & {
        body: any;
    };
    response: ServerResponse;
}
export type RouteHandler = (ctx: HTTPContext) => any;
