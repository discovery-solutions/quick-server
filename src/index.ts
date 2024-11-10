import { Database } from "./features/databases";
import { Entity } from "./features/entity";
import { Server } from "./servers";
import { Config } from "./types";
import { extract } from "./utils/config";
import { loadYaml } from "./utils/file";

export class QuickServer {
  private config: Config;
  
  constructor(filePath = 'SERVER.yaml') {
    this.config = extract(loadYaml(filePath));

    console.log('[Quick-Server] Initializing DBs');
    Database.initialize(this.config.databases);

    console.log('[Quick-Server] Initializing Servers');
    Server.initialize(this.config.servers);
  }

  async start() {
    console.log('[Quick-Server] Initializing Entities...');
    Entity.initialize(this.config.entities);
    
    Server.start();
  }
}