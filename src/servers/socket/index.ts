import type { Message, SocketContext, WebSocketHandler } from './types';
import { Database, DatabaseInterface } from '../../features/databases';
import type { ServerConfig } from '../../types';
import { parseResponse } from '../utils';
import { Middleware } from '../types';
import * as WebSocket from 'ws';
import { Logger } from '../../utils/logger';

export { SocketContext };
export class SocketServer {
  private routes: { [path: string]: WebSocketHandler } = {};
  private middlewares: ((ctx: SocketContext) => Promise<void>)[] = [];
  private logger: Logger;
  public database: DatabaseInterface;
  public config: ServerConfig;

  constructor(config: ServerConfig) {
    this.database = Database.get(config.database);
    this.config = config;
    this.logger = new Logger(this.config.name);
  }

  use(middleware: Middleware) {
    this.middlewares.push(middleware);
  }

  apply(callback: (instance: SocketServer) => any) {
    return callback(this);
  }

  on(path: string, handler: WebSocketHandler) {
    this.routes[path] = handler;
  }

  handleConnection(socket: WebSocket) {
    socket.on('message', async (raw: string) => {
      const message: Message = JSON.parse(raw);
      const ctx: SocketContext = {
        socket,
        message,
        session: {},
        getParams: () => message.params,
        getBody: () => message.body,
        getHeaders: () => socket.headers,
        getHeader: (key: string) => socket.headers[key],
        error: async (err) => socket.send({ error: err.message || 'Error' }),
        send: async (data) => socket.send(parseResponse(this.config.format, data)),
        status: function() { return this },
        getInfo: () => ({
          session: ctx.session,
          database: this.config.database,
          server: this.config.name,
          url: socket.url,
          params: message.params,
          basePath: `https://${socket.headers.host}${socket.url}`,
          message: message,
          headers: socket.headers,
          timestamp: new Date().toISOString(),
        }),
      };

      try {
        const route = this.routes[message.action];

        if (!route)
          return ctx.error(new Error('Route not found'));

        for (const mw of this.middlewares)
          await Promise.resolve().then(() => mw(ctx));

        return route(ctx);
      } catch (error) {
        return ctx.error(error);
      }
    });
  }

  start() {
    const wss = new WebSocket.Server({ port: this.config.port });

    wss.on('connection', (socket) => this.handleConnection(socket));

    this.logger.log(`WebSocket server running on port ${this.config.port}`);
  }
}


/*
**** EXAMPLE ****
// Criação do servidor WebSocket
const wsServer = new SocketServer({
  name: 'socket_server',
  port: 3500,
  type: 'socket',
  format: 'csv',
  database: 'mongo',
  request: { limit: 1000 },
});

// Middleware global
wsServer.use(async (ctx) => {
  log(`Message received: ${ctx.message}`);
});

// Registrando rotas WebSocket
wsServer.on('/ws', (ctx) => {
  ctx.send({ message: 'Hello from WebSocket' });
});

wsServer.start();
*/