import type { Message, WebSocketContext, WebSocketHandler } from './types';
import { Database, DatabaseInterface } from '../../features/databases';
import { CRUDMiddlewareSocket } from '../../features/crud';
import type { ServerConfig } from '../../types';
import { parseResponse } from '../utils';
import * as WebSocket from 'ws';
import { Logger } from '../../utils/logger';

export class SocketServer {
  private routes: { [path: string]: WebSocketHandler } = {};
  private middlewares: ((ctx: WebSocketContext, next: () => Promise<void>) => Promise<void>)[] = [];
  private config: ServerConfig;
  private logger: Logger;
  public database: DatabaseInterface;

  constructor(config: ServerConfig) {
    this.database = Database.get(config.database);
    this.config = config;
    this.logger = new Logger(this.config.name);
  }

  use(middleware: (ctx: WebSocketContext, next: () => Promise<void>) => Promise<void>) {
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
      const ctx: WebSocketContext = {
        socket,
        message,
        getParams: () => message.params,
        getBody: () => message.body,
        error: (err) => socket.send({ error: err.message || 'Error' }),
        send: (data) => socket.send(parseResponse(this.config.format, data)),
        getInfo: () => ({
          url: socket.url,
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
          await mw(ctx, () => Promise.resolve());

        return route(ctx);
      } catch (error) {
        return ctx.error(error);
      }
    });
  }

  start() {
    this.apply(CRUDMiddlewareSocket);

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
wsServer.use(async (ctx, next) => {
  console.log(`Message received: ${ctx.message}`);
  await next();
});

// Registrando rotas WebSocket
wsServer.on('/ws', (ctx) => {
  ctx.send({ message: 'Hello from WebSocket' });
});

wsServer.start();
*/