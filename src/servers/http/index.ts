import { IncomingMessage, ServerResponse } from 'http';
import { CRUDMiddleware } from '../../features/crud/http';
import { ServerConfig } from '../../types';
import { Logger } from '../../utils/logger';
import * as Utils from './utils';
import * as http from 'http';
import { parse } from 'url';

const logger = new Logger('http-server');

export interface Context {
  request: IncomingMessage & {
    body: any;
  };
  response: ServerResponse;
  json: (data: any) => any;
  error: (err: Error) => any;
  params: { [key: string]: string | string[] | undefined };
}

export type RouteHandler = (ctx: Context) => any;

export class HTTPServer {
  private routes: { [key: string]: { [method: string]: RouteHandler } } = {};
  private middlewares: ((ctx: Context, next: () => Promise<any>) => Promise<any>)[] = [];
  private config: ServerConfig;
  private basePath: string;

  constructor(config: ServerConfig) {
    this.config = config;
  }

  apply(callback: (instance: HTTPServer) => any) {
    return callback(this);
  }

  use(middleware: (ctx: Context, next: () => Promise<any>) => Promise<any>) {
    this.middlewares.push(middleware);
  }

  get(path: string, handler: RouteHandler) {
    this._register('get', path, handler);
  }

  post(path: string, handler: RouteHandler) {
    this._register('post', path, handler);
  }

  put(path: string, handler: RouteHandler) {
    this._register('put', path, handler);
  }

  patch(path: string, handler: RouteHandler) {
    this._register('patch', path, handler);
  }

  delete(path: string, handler: RouteHandler) {
    this._register('delete', path, handler);
  }

  group(prefix: string, callback: () => void) {
    this.basePath = prefix;

    callback();

    this.basePath = undefined;
  }

  private _register(method: string, suffix: string, handler: RouteHandler) {
    const path = (this.basePath ? `${this.basePath}${suffix}` : suffix).replace(/\/$/, '');
    
    if (!this.routes[path])
      this.routes[path] = {};

    this.routes[path][method] = handler;
  }

  handleRequest = async (req: Context['request'], res: Context['response']) => {
    const parsedUrl = parse(req.url || '', true);
    const { pathname, query } = parsedUrl;
    const method = req.method?.toLowerCase() || '';

    const params = this.extractParams(pathname || '');

    const ctx: Context = {
      request: req,
      response: res,
      params: { ...params, ...query },
      json: (data) => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(data));
      },
      error: (err) => {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message || 'Internal Server Error' }));
      },
    };
    
    const route = this.routes[pathname || ''] && this.routes[pathname || ''][method];
    
    for (const mw of this.middlewares)
      await mw(ctx, () => Promise.resolve());

    if (!route)
      return ctx.error(new Error('Not Found'));

    return await Promise.resolve(route(ctx));
  }

  extractParams(pathname: string): { [key: string]: string } {
    const params: { [key: string]: string } = {};
    const routeKeys = Object.keys(this.routes);

    for (const route of routeKeys) {
      const routeParts = route.split('/');
      const pathParts = pathname.split('/');

      if (routeParts.length !== pathParts.length) continue;

      let isMatch = true;
      for (let i = 0; i < routeParts.length; i++) {
        if (routeParts[i].startsWith(':')) {
          params[routeParts[i].slice(1)] = pathParts[i];
        } else if (routeParts[i] !== pathParts[i]) {
          isMatch = false;
          break;
        }
      }

      if (isMatch) return params;
    }

    return {};
  }

  start() {
    this.use(Utils.jsonParser);
    this.use(Utils.formParser);
    this.use(Utils.corsMiddleware);
    this.apply(CRUDMiddleware);

    const server = http.createServer((req, res) => this.handleRequest(req as any, res));

    server.listen(this.config.port, () => {
      logger.setOrigin(this.config.name);
      logger.log(`Rest server running on port ${this.config.port}`);
    });
  }
}

/*
**** EXAMPLE ****
// Criação do servidor
const server = new HTTPServer({
  name: 'json_server',
  port: 3501,
  type: 'rest',
  format: 'json',
  database: 'main',
  request: { limit: 10 },
});

// Middleware global
server.use(async (ctx, next) => {
  console.log(`Request made to ${ctx.request.url}`);
  await next();
});

// Agrupando rotas
server.group('/users', () => {
  server.get('/:id', (ctx) => {
    const { id } = ctx.params;
    ctx.json({ message: `User ID: ${id}` });
  });

  server.post('/', (ctx) => {
    ctx.json({ message: 'User created' });
  });
});

server.start();
*/