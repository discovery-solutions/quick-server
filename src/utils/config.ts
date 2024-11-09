import { Config } from "../types";

export const extract = ({ databases, servers, entities }: Config) => {
  return {
    servers: Array.isArray(servers) ? servers : [servers],
    entities: Array.isArray(entities) ? entities : [entities],
    databases: Array.isArray(databases) ? databases : [databases],
  } as Config;
}