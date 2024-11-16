import { IncomingHttpHeaders } from 'http';

export type RequestParams = { [key: string]: string | string[] | undefined };

export interface Message {
  body: any;
  params: RequestParams;
  action: string;
}
export interface WebSocketContext {
  socket: WebSocket;
  message: Message;
  getInfo: () => {
    method?: string;
    url: string;
    headers: IncomingHttpHeaders;
    params?: Record<string, any>;
    timestamp: string;
  };
  getParams: () => RequestParams;
  getBody: () => any;
  error: (err: Error) => any;
  send: (data: any) => any;
  status: (code: number) => any;
}

export type WebSocketHandler = (ctx: WebSocketContext) => void;