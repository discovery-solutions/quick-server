import { EntityManager } from './features/entity';
import { Database } from './features/databases';
import { loadYaml } from './utils/file';
import { extract } from './utils/config';
import { Logger } from './utils/logger';
import { Server } from './servers';
import { Config } from './types';
import { Auth } from './features/auth';
import path from 'path';

const logger = new Logger();

export * from './types';

export class QuickServer {
  private config: Config;
  
  constructor(filePath = path.join(process.cwd(), 'SERVER.yaml')) {
    this.config = extract(loadYaml(filePath));

    Logger.setConfig(this.config.developer.logger);

    logger.log('Initializing DBs');
    Database.initialize(this.config.databases);

    logger.log('Initializing Servers');
    Server.initialize(this.config.servers);

    logger.log('Initializing Auth Setup');
    Auth.initialize(this.config.auth);
  }

  async start() {
    logger.log('Initializing Entities...');
    EntityManager.initialize(this.config.entities);
    
    Server.start();
  }
}