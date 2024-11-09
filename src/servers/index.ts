import { SocketServer } from './socket';
import { HTTPServer } from './http';
import { Config } from '../types';

export class Server {
  constructor(server: Config['servers'][number]) {
    switch (server.type) {
      case 'rest':
        return new HTTPServer(server);
      case 'socket':
        return new SocketServer(server);
      default:
        break;
    }
  }
}