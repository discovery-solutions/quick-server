import { DeveloperConfig } from "./developer";
import { DatabaseConfig } from "./database";
import { EntityConfig } from "./entity";
import { ServerConfig } from "./server";
import { AuthConfig } from "./auth";

export * from "./developer";
export * from "./database";
export * from "./entity";
export * from "./server";
export * from "./auth";

export interface Config {
  auth?: AuthConfig;
  servers: ServerConfig[];
  databases: DatabaseConfig[];
  entities: EntityConfig[];
  developer: DeveloperConfig;
}
