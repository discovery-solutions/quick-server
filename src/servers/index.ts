import { SocketServer, SocketContext } from './socket';
import { HTTPServer, HTTPContext } from './http';
import { Middleware, ServerTypes } from './types';
import { Authentication } from '../features/system/auth/authentication';
import { Authorization } from '../features/system/auth/authorization';
import { FileServer } from './file';
import { Search } from '../features/system/search';
import { Config } from '../types';
import { Logger } from '../utils/logger';
import { CRUD } from '../features/crud';
import { Docs } from '../features/docs';

const logger = new Logger();

export * from './types';
export { SocketServer, HTTPServer, SocketContext, HTTPContext };

export class Server {
  private static instance: Server | null = null;
  static servers: Map<string, ServerTypes> = new Map();

  private constructor(servers: Config['servers']) {
    for (const server of servers) {
      switch (server.type) {
        case 'rest':
          Server.servers.set(server.name, new HTTPServer(server));
          break;
        case 'socket':
          Server.servers.set(server.name, new SocketServer(server));
          break;
        case 'file':
          Server.servers.set(server.name, new FileServer(server) as HTTPServer);
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

  public static get(name: string): ServerTypes | undefined {
    if (!Server.instance)
      throw new Error(`Server ${name} not initialized. Call Server.initialize(servers) first.`);

    return Server.servers.get(name);
  }

  public static start(middlewares?: Middleware[]) {
    if (!Server.instance)
      throw new Error('Server not initialized. Call Server.initialize(servers) first.');

    logger.log('Starting servers...');
    Server.servers.forEach((server: ServerTypes, key) => {
      server.use(Logger.middleware);
      server.use(Authentication.middleware);
      server.use(Authorization.middleware);

      if (middlewares)
        for (const middleware of middlewares)
          server.use(middleware);

      if (server.config.type !== 'file') {
        server.apply(Authentication.routes);
        server.apply(CRUD.middleware);
        server.apply(Search.routes);
        server.apply(Docs.routes);
      }

      if (server) server.start();
    });
  }
}
