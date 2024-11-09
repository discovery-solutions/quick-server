import { Server } from "./servers";
import { Config } from "./types";
import { extract } from "./utils/config";
import { loadYaml } from "./utils/file";

interface QuickServerParams {

}

export class QuickServer {
  private config: Config;
  private servers: Record<string, any> = {};

  constructor(filePath = 'SERVER.yaml', parameters?: QuickServerParams) {
    this.config = extract(loadYaml(filePath));

    for (const server of this.config.servers)
      this.servers[server.name] = new Server(server);
  }

  async start() {
    Object.keys(this.servers).forEach(key => {
      this.servers[key].start();
    })
  }
}