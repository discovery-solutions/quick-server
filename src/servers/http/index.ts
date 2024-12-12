import { findRoute, NativeMiddlewares } from './utils';
import { capitalize, promisify, sleep } from '../../utils';
import { Database, DatabaseInterface } from '../../features/databases';
import { HTTPContext, RouteHandler } from './types';
import { Middleware, RequestParams } from '../types';
import { parseResponse } from '../utils';
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

export { HTTPContext };
export class HTTPServer {
  private routes: { [key: string]: { [method: string]: RouteHandler } } = {};
  private middlewares: ((ctx: HTTPContext) => Promise<any>)[] = [];
  private basePath: string;
  public database: DatabaseInterface;
  public config: ServerConfig;

  constructor(config: ServerConfig) {
    this.database = Database.get(config.database);
    this.config = new ServerConfig(config);
  }

  apply(callback: (instance: HTTPServer) => any) {
    return callback(this);
  }

  use(middleware: Middleware) {
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

    if (path.endsWith('/*')) {
      const basePath = path.slice(0, -2);

      if (!this.routes[basePath])
        this.routes[basePath] = {};

        this.routes[basePath][method] = (ctx) => {
          if ((ctx.request.url || '').startsWith(basePath)) return handler(ctx);
          return new Error('Not Found');
        };
    } else {
      if (!this.routes[path])
        this.routes[path] = {};
  
      this.routes[path][method] = handler;
    }
  }

  handleRequest = async (req: HTTPContext['request'], res: HTTPContext['response']) => {
    const parsedUrl = parse(req.url || '', true);
    const { pathname, query } = parsedUrl;
    const method = req.method?.toLowerCase() || '';
    const params = {
      ...this.extractParams(pathname || ''),
      query,
    };

    res.setHeader('Content-Type', ContentTypes[this.config.format]);

    const ctx: HTTPContext = {
      request: req,
      response: res,
      params: params,
      session: {},
      database: this.database,
      getParams: () => params,
      getBody: () => req.body,
      getHeaders: () => req.headers,
      getHeader: (key: string) => req.headers[key],
      getInfo: () => ({
        session: ctx.session,
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
      send: async (data: any) => {
        if (typeof data === 'undefined')
          throw new Error('ctx.send(data): data cannot be undefined');

        if (!res.statusCode) res.statusCode = 200;

        const payload = parseResponse(this.config.format, data);
        logger.info(`Response for Incoming Request ${req.method.toUpperCase()} ${req.url}`, { payload });
        
        if (!res.writableEnded)
          return res.end(payload);
      },
      error: async (error) => {
        const { message, ...rest } = (error || {});
        logger.error(`Error for Incoming Request ${req.url}`);
        logger.error(error);

        if (res.writableEnded) return;

        if (res.statusCode >= 200 && res.statusCode < 300) res.statusCode = 500;
        return res.end(JSON.stringify({ message: message || 'Internal Server Error', ...rest }));
      },
    };

    const timeoutPromise = new Promise(async (resolve, reject) => {
      await sleep(this.config.request.timeout);
      
      if (res.writableEnded) resolve(false);
      
      reject(
        new Error(`Request timeout exceeded (${this.config.request.timeout}ms)`)
      );
    });

    const routePromise = new Promise(async (resolve, reject) => {
      try {
        const route = findRoute(pathname, method, this.routes);
        
        for (const mw of this.middlewares) {
          if (res.writableEnded)
            return resolve(false);

          await promisify(mw(ctx));
        }
    
        if (res.writableEnded)
          return resolve(false);
        
        if (!route)
          return reject(new Error('Not Found'));
    
        await promisify(route(ctx));
      } catch (error) {
        if (res.writableEnded)
          return resolve(false);

        return reject(error);
      }
    });
    
    try {
      await Promise.race([timeoutPromise, routePromise]);
    } catch (error) {
      if (error.message && error.message.startsWith('Request timeout exceeded'))
        return ctx.status(408).error(error);
      
      return ctx.error(error);
    }
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
        if (routeParts[i] === '*') {
          params['wildcard'] = pathParts.slice(i).join('/');
          break;
        } else if (routeParts[i].startsWith(':')) {
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
        await NativeMiddlewares[key](req, res);
      
      return this.handleRequest(req as any, res);
    });

    server.listen(this.config.port, () => {
      logger.setOrigin(this.config.name);
      logger.log(`${capitalize(this.config.type)} server running on port ${this.config.port}`);
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
server.use(async (ctx) => {
  log(`Request made to ${ctx.request.url}`);
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