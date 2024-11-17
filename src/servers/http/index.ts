import { findRoute, NativeMiddlewares } from './utils';
import { Database, DatabaseInterface } from '../../features/databases';
import { HTTPContext, RouteHandler } from './types';
import { parseResponse } from '../utils';
import { RequestParams } from '../types';
import { ServerConfig } from '../../types';
import { createServer } from 'http';
import { Logger } from '../../utils/logger';
import { parse } from 'url';

const logger = new Logger('http-server');
const ContentTypes = {
  yaml: 'application/x-yaml',
  json: 'application/json',
  html: 'text/html',
  xml: 'application/xml',
  csv: 'text/csv',
};
export class HTTPServer {
  private routes: { [key: string]: { [method: string]: RouteHandler } } = {};
  private middlewares: ((ctx: HTTPContext, next: () => Promise<any>) => Promise<any>)[] = [];
  private config: ServerConfig;
  private basePath: string;
  public database: DatabaseInterface;

  constructor(config: ServerConfig) {
    this.database = Database.get(config.database);
    this.config = new ServerConfig(config);
  }

  apply(callback: (instance: HTTPServer) => any) {
    return callback(this);
  }

  use(middleware: (ctx: HTTPContext, next: () => Promise<any>) => Promise<any>) {
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

  handleRequest = async (req: HTTPContext['request'], res: HTTPContext['response']) => {
    const parsedUrl = parse(req.url || '', true);
    const { pathname, query } = parsedUrl;
    const method = req.method?.toLowerCase() || '';
    const params = {
      ...this.extractParams(pathname || ''),
      ...query,
    };

    res.setHeader('Content-Type', ContentTypes[this.config.format]);

    const ctx: HTTPContext = {
      request: req,
      response: res,
      params: params,
      getParams: () => params,
      getBody: () => req.body,
      getHeaders: () => req.headers,
      getHeader: (key: string) => req.headers[key],
      getInfo: () => ({
        database: this.config.database,
        server: this.config.name,
        method: req.method,
        url: req.url,
        basePath: `https://${req.headers.host}${req.url}`,
        headers: req.headers,
        params: ctx.params,
        timestamp: new Date().toISOString(),
      }),
      status: function (code: number) {
        res.statusCode = code;
        return this;
      },
      send: (data: any) => {
        if (typeof data === 'undefined')
          throw new Error('ctx.send(data): data cannot be undefined');

        if (!res.statusCode) res.statusCode = 200;

        const payload = parseResponse(this.config.format, data);
        logger.info(`Response for Incoming Request ${req.url}`, { payload });
        return res.end(payload);
      },
      error: (error) => {
        const { message, ...rest } = (error || {});
        logger.error(`Error for Incoming Request ${req.url}`);
        logger.error(error);

        if (res.statusCode >= 200 || res.statusCode < 300) res.statusCode = 500;
        res.end(JSON.stringify({ message: message || 'Internal Server Error', ...rest }));
      },
    };

    let timer: NodeJS.Timeout;

    timer = setTimeout(() => {
      ctx.status(408).error(new Error(`Request timeout exceeded (${this.config.request.timeout}ms)`));
    }, this.config.request.timeout);

    await (async () => {
      try {
        console.log(this.routes)
        const route = findRoute(pathname, method, this.routes)
      
        for (const mw of this.middlewares)
          await mw(ctx, () => Promise.resolve());
  
        if (!route)
          throw new Error('Not Found');
  
        await Promise.resolve(route(ctx));
      } catch (error) {
        ctx.error(error);
      } finally {
        return clearTimeout(timer);
      }
    })();
  }

  extractParams(pathname: string): RequestParams {
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
    const server = createServer(async (req, res) => {
      for (const key in NativeMiddlewares)
        await NativeMiddlewares[key](req, res, () => Promise.resolve());
      
      return this.handleRequest(req as any, res);
    });

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
    ctx.send({ message: `User ID: ${id}` });
  });

  server.post('/', (ctx) => {
    ctx.send({ message: 'User created' });
  });
});

server.start();
*/