import type { EntityConfig } from "../../../types";
import type { Context } from "../../../servers/http";
import { Entity } from "../../entity";
import { DatabaseInterface } from "../../databases";

export class CRUD_HTTP {
  private model: any;
  private entity: EntityConfig;
  private database: DatabaseInterface;

  constructor(model: any) {
    this.model = model;
    this.entity = Entity.get(model);
  }

  setDatabase(database: DatabaseInterface) {
    this.database = database;
  }

  async list(ctx: Context) {
    try {
      const entities = await this.database.get(this.model, {});
      return ctx.json(entities);
    } catch (error) {
      return ctx.error(error);
    }
  }

  async create(ctx: Context) {
    try {
      const data = await this.database.insert(this.model, ctx.request.body);
      return ctx.json(data);
    } catch (error) {
      return ctx.error(error);
    }
  }

  async read(ctx: Context) {
    try {
      const { id } = ctx.params;
      const data = await this.database.get(this.model, { id });

      if (!data) return ctx.error(new Error('Entity not found'));
      
      return ctx.json(data);
    } catch (error) {
      return ctx.error(error);
    }
  }

  async update(ctx: Context) {
    try {
      const { id } = ctx.params;
      
      await this.database.update(this.model, { id }, ctx.request.body);

      return ctx.json({ message: 'Entity updated successfully' });
    } catch (error) {
      return ctx.error(error);
    }
  }

  async delete(ctx: Context) {
    try {
      const { id } = ctx.params;
      
      await this.database.delete(this.model, { id });

      return ctx.json({ message: 'Entity deleted successfully' });
    } catch (error) {
      return ctx.error(error);
    }
  }
}

export const CRUDMiddleware = async (server) => {
  for (const key of Entity.list()) {
    const crud = new CRUD_HTTP(key);

    crud.setDatabase(server.database);
    
    server.group(`/${key}`, () => {
      server.get('/', (ctx) => crud.list(ctx));
      server.post('/', (ctx) => crud.create(ctx));
      server.get('/:id', (ctx) => crud.read(ctx));
      server.put('/:id', (ctx) => crud.update(ctx));
      server.delete('/:id', (ctx) => crud.delete(ctx));
    }); 
  }
}
