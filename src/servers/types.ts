import { IncomingHttpHeaders } from 'http';
import { SocketServer } from './socket';
import { HTTPServer } from './http';
import { DatabaseInterface } from '../features/databases';

export type Middleware = (ctx: Context) => any;

export type RequestParams = { [key: string]: any };

export interface Session extends Record<string, any> {
  entity?: string;
  token?: string;
}

export type GetInfoResponse = {
  method?: string;
  url: string;
  basePath: string;
  headers: IncomingHttpHeaders;
  params: Record<string, any>;
  timestamp: string;
  server: string;
  database: string;
  session: Session;
};

export interface Context {
  getInfo: () => GetInfoResponse;
  getParams: () => RequestParams;
  getHeaders: () => IncomingHttpHeaders;
  getHeader: (key: string) => string | string[];
  getBody: () => any;
  params?: RequestParams;
  session: Session;
  database: DatabaseInterface;
  error: (err: Error) => any;
  send: (data: any) => any;
  status: (code: number) => any;
}

export type ServerTypes = HTTPServer | SocketServer;