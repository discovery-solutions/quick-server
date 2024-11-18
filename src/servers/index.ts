import { SocketServer, SocketContext } from './socket';
import { HTTPServer, HTTPContext } from './http';
import { Config } from '../types';
import { Logger } from '../utils/logger';
import { CRUD } from '../features/crud';
import { Authentication } from '../features/auth/authentication';
import { Authorization } from '../features/auth/authorization';
import { Context, Middleware } from './types';

const logger = new Logger();

export * from './types';
export { SocketServer, HTTPServer, SocketContext, HTTPContext };

export class Server {
  private static instance: Server | null = null;
  private servers: Map<string, HTTPServer | SocketServer> = new Map();

  private constructor(servers: Config['servers']) {
    for (const server of servers) {
      switch (server.type) {
        case 'rest':
          this.servers.set(server.name, new HTTPServer(server));
          break;
        case 'socket':
          this.servers.set(server.name, new SocketServer(server));
          break;
        default:
          break;
      }
    }
  }

  public static initialize(servers: Config['servers']) {
    if (Server.instance) return;

    Server.instance = new Server(servers);
  }

  public static get(name: string): HTTPServer | SocketServer | undefined {
    if (!Server.instance)
      throw new Error(`Server ${name} not initialized. Call Server.initialize(servers) first.`);

    return Server.instance.servers.get(name);
  }

  public static start(middlewares?: Middleware[]) {
    if (!Server.instance)
      throw new Error('Server not initialized. Call Server.initialize(servers) first.');

    logger.log('Starting servers...');
    Server.instance.servers.forEach((server, key) => {
      server.use(Logger.middleware);
      server.use(Authentication.middleware);
      server.use(Authorization.middleware);

      if (middlewares)
        for (const middleware of middlewares)
          server.use(middleware);

      server.apply(Authentication.routes);
      server.apply(CRUD.middleware);

      if (server) server.start();
    });
  }
}
