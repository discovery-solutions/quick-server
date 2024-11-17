import { IncomingHttpHeaders } from 'http';

export type RequestParams = { [key: string]: string | string[] | undefined };

export type GetInfoResponse = {
  method?: string;
  url: string;
  basePath: string;
  headers: IncomingHttpHeaders;
  params: Record<string, any>;
  timestamp: string;
  server: string;
  database: string;
};

export interface Context {
  getInfo: () => GetInfoResponse;
  getParams: () => RequestParams;
  getHeaders: () => IncomingHttpHeaders;
  getHeader: (key: string) => string | string[];
  getBody: () => any;
  params?: RequestParams;
  error: (err: Error) => any;
  send: (data: any) => any;
  status: (code: number) => any;
}