import { SocketServer } from './socket';
import { HTTPServer } from './http';
import { Config } from '../types';

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

  public static start() {
    if (!Server.instance)
      throw new Error('Server not initialized. Call Server.initialize(servers) first.');

    console.log('[Quick-Server] Starting servers...');
    Server.instance.servers.forEach((server, key) => {
      if (server) server.start();
    });
  }
}
