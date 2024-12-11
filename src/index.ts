import { HTTPServer, Middleware, Server, ServerTypes } from './servers';
import { EntityManager } from './features/entity';
import { Database } from './features/databases';
import { loadYaml } from './utils/file';
import { extract } from './utils/config';
import { Logger } from './utils/logger';
import { Config } from './types';
import { Auth } from './features/system/auth';
import path from 'path';

export { QuickServer, Database, EntityManager };
export * from './types';

const logger = new Logger();

class QuickServer {
  public config: Config;
  private middlewares: Middleware[] = [];
  static instance: QuickServer;
  
  constructor(filePath = path.join(process.cwd(), 'SERVER.yaml')) {
    if (QuickServer.instance) return QuickServer.instance;

    this.config = extract(loadYaml(filePath));

    Logger.setConfig(this.config.developer.logger);

    logger.log('Initializing DBs');
    Database.initialize(this.config.databases);

    logger.log('Initializing Servers');
    Server.initialize(this.config.servers);

    logger.log('Initializing Auth Setup');
    Auth.initialize(this.config.auth);

    QuickServer.instance = this;

    ['get', 'post', 'put', 'delete', 'patch'].forEach((method) => {
      (this as any)[method] = (...args: any[]) => {
        Server.servers.forEach((server: ServerTypes) => {
          if (server instanceof HTTPServer && typeof (server as any)[method] === 'function') {
            (server as any)[method](...(args as [string, Middleware]));
          }
        });
      };
    });
  }

  use(middleware: Middleware) {
    this.middlewares.push(middleware);
  }

  async start() {
    logger.log('Initializing Entities...');
    EntityManager.initialize(this.config.entities);
    
    Server.start(this.middlewares);
  }
}