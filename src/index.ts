import { Database } from "./features/databases";
import { Entity } from "./features/entity";
import { Server } from "./servers";
import { Config } from "./types";
import { extract } from "./utils/config";
import { loadYaml } from "./utils/file";
import { Logger } from "./utils/logger";

const logger = new Logger();

export class QuickServer {
  private config: Config;
  
  constructor(filePath = 'SERVER.yaml') {
    this.config = extract(loadYaml(filePath));

    Logger.setConfig(this.config.developer.logger);
    
    logger.log('Initializing DBs');
    Database.initialize(this.config.databases);

    logger.log('Initializing Servers');
    Server.initialize(this.config.servers);
  }

  async start() {
    logger.log('Initializing Entities...');
    Entity.initialize(this.config.entities);
    
    Server.start();
  }
}