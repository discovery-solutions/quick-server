import * as WebSocket from 'ws';
import { ServerConfig } from '../../types';

export interface WebSocketContext {
  socket: WebSocket;
  message: any;
  send: (data: any) => void;
  error: (err: Error) => void;
}

export type WebSocketHandler = (ctx: WebSocketContext) => void;

export class SocketServer {
  private routes: { [path: string]: WebSocketHandler } = {};
  private middlewares: ((ctx: WebSocketContext, next: () => Promise<void>) => Promise<void>)[] = [];
  private config: ServerConfig;

  constructor(config: ServerConfig) {
    this.config = config;
  }

  use(middleware: (ctx: WebSocketContext, next: () => Promise<void>) => Promise<void>) {
    this.middlewares.push(middleware);
  }

  on(path: string, handler: WebSocketHandler) {
    this.routes[path] = handler;
  }

  handleConnection(socket: WebSocket) {
    socket.on('message', async (message) => {
      const ctx: WebSocketContext = {
        socket,
        message,
        send: (data) => socket.send(JSON.stringify(data)),
        error: (err) => socket.send(JSON.stringify({ error: err.message || 'Error' })),
      };

      const route = this.routes['/ws'];

      if (!route)
        return ctx.error(new Error('Route not found'));

      for (const mw of this.middlewares)
        await mw(ctx, () => Promise.resolve());

      return route(ctx);
    });
  }

  start() {
    const wss = new WebSocket.Server({ port: this.config.port });

    wss.on('connection', (socket) => this.handleConnection(socket));

    console.log(`[${this.config.name}]: WebSocket server running on port ${this.config.port}`);
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