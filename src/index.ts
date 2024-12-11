import { Middleware, Server } from './servers';
import { EntityManager } from './features/entity';
import { Database } from './features/databases';
import { loadYaml } from './utils/file';
import { extract } from './utils/config';
import { Logger } from './utils/logger';
import { Config } from './types';
import { Auth } from './features/system/auth';
import path from 'path';

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
  }

  use(middleware: Middleware) {
    this.middlewares.push(middleware);
  }

  async start() {
    logger.log('Initializing Entities...');
    EntityManager.initialize(this.config.entities);
    
    Server.start(this.middlewares);
  }

  get(name: string) {
    return Server.get(name);
  }
}

export { QuickServer, Database, EntityManager };
export * from './types';