import { Context, HTTPServer, SocketServer } from "../../servers";
import { Database } from "../databases";
import { Entity, EntityManager } from "../entity";

export class Search {
  static async routes(server: HTTPServer | SocketServer) {
    if (server instanceof HTTPServer) server.get('/system/search', handler);
    if (server instanceof SocketServer) server.on('system_search', handler);
  }
}

const handler = async (ctx: Context) => {
  const { query: { query }} = ctx.getParams();
  const database = Database.get(ctx.getInfo().database);
  
  if (!query) return ctx.status(400).error(new Error('Missing query get parameter'));
  
  const raw = await database.search(String(query));
  const results = Object.keys(raw).reduce((obj, table: string) => {
    const config = EntityManager.get(table);

    if (!config) return obj;

    const entity = new Entity(config);
    obj[table] = entity.secure(raw[table]);
    
    return obj;
  }, {});

  return ctx.send({ results });
}