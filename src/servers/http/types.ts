import { IncomingHttpHeaders, IncomingMessage, ServerResponse } from 'http';

export type RequestParams = { [key: string]: string | string[] | undefined };

export interface HTTPContext {
  request: IncomingMessage & {
    body: any;
  };
  response: ServerResponse;
  getInfo: () => {
    method?: string;
    url: string;
    headers: IncomingHttpHeaders;
    params: Record<string, any>;
    timestamp: string;
  };
  getParams: () => RequestParams;
  getBody: () => any;
  params?: RequestParams;
  error: (err: Error) => any;
  send: (data: any) => any;
  status: (code: number) => any;
}

export type RouteHandler = (ctx: HTTPContext) => any;