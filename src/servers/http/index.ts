import { IncomingMessage, ServerResponse } from 'http';
import { ServerConfig } from '../../types';
import * as http from 'http';
import { parse } from 'url';

export interface Context {
  request: IncomingMessage;
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

  constructor(config: ServerConfig) {
    this.config = config;
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

  private _register(method: string, path: string, handler: RouteHandler) {
    if (!this.routes[path]) {
      this.routes[path] = {};
    }
    this.routes[path][method] = handler;
  }

  handleRequest(req: IncomingMessage, res: ServerResponse) {
    const parsedUrl = parse(req.url || '', true);
    const { pathname, query } = parsedUrl;
    const method = req.method?.toLowerCase() || '';

    const params = this.extractParams(pathname || '');

    const ctx: Context = {
      request: req,
      response: res,
      json: (data) => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(data));
      },
      error: (err) => {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message || 'Internal Server Error' }));
      },
      params: { ...params, ...query },
    };

    const runMiddlewares = async () => {
      for (const mw of this.middlewares) {
        await mw(ctx, () => Promise.resolve());
      }
    };

    const route = this.routes[pathname || ''] && this.routes[pathname || ''][method];
    if (route) {
      runMiddlewares().then(() => route(ctx));
    } else {
      ctx.error(new Error('Not Found'));
    }
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
    const server = http.createServer((req, res) => this.handleRequest(req, res));
    server.listen(this.config.port, () => {
      console.log(`[${this.config.name}]: Rest server running on port ${this.config.port}`);
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

// Registrando rotas
server.get('/user/:id', (ctx) => {
  const { id } = ctx.params;
  const { name } = ctx.params;
  ctx.json({ message: `User ID: ${id}, Name: ${name}` });
});

server.post('/user', (ctx) => {
  ctx.json({ message: 'User created' });
});

server.start();
*/