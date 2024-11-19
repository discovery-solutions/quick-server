import { Context, RequestParams } from '../types';
export interface Message {
    body: any;
    params: RequestParams;
    action: string;
}
export interface SocketContext extends Context {
    socket: WebSocket;
    message: Message;
}
export type WebSocketHandler = (ctx: SocketContext) => void;
