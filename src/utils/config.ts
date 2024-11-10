import { Config } from "../types";

export const extract = ({ databases, servers, entities, ...rest }: Config) => {
  return {
    servers: Array.isArray(servers) ? servers : [servers],
    entities: Array.isArray(entities) ? entities : [entities],
    databases: Array.isArray(databases) ? databases : [databases],
    ...rest,
  } as Config;
}