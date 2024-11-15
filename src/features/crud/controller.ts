import type { WebSocketContext } from "../../servers/socket/types";
import type { HTTPContext } from "../../servers/http/types";
import { DatabaseInterface } from "../databases";

export class ControllerCRUD {
  private model: any;
  private database: DatabaseInterface;

  constructor(model: any) {
    this.model = model;
  }

  setDatabase(database: DatabaseInterface) {
    this.database = database;
  }

  async list(ctx: HTTPContext | WebSocketContext) {
    const entities = await this.database.get(this.model, {});
    return ctx.send(entities);
  }

  async create(ctx: HTTPContext | WebSocketContext) {
    const id = await this.database.insert(this.model, ctx.getBody());
    
    return ctx.send({ id });
  }

  async read(ctx: HTTPContext | WebSocketContext) {
    const { id } = ctx.getParams();
    const data = await this.database.get(this.model, { id });

    if (!data) return ctx.error(new Error('Entity not found'));
    
    return ctx.send(data);
  }

  async update(ctx: HTTPContext | WebSocketContext) {
    const { id } = ctx.getParams();
    
    await this.database.update(this.model, { id }, ctx.getBody());

    return ctx.send({ message: 'Entity updated successfully' });
  }

  async delete(ctx: HTTPContext | WebSocketContext) {
    const { id } = ctx.getParams();
    
    await this.database.delete(this.model, { id });

    return ctx.send({ message: 'Entity deleted successfully' });
  }

  async bulkInsert(ctx: HTTPContext | WebSocketContext) {
    const data = await this.database.bulkInsert(this.model, ctx.getBody());
    return ctx.send({ message: 'Entities inserted successfully', data });
  }

  async bulkUpdate(ctx: HTTPContext | WebSocketContext) {
    const data = await this.database.bulkUpdate(this.model, ctx.getBody());
    return ctx.send({ message: 'Entities updated successfully', data });
  }

  async bulkDelete(ctx: HTTPContext | WebSocketContext) {
    const data = await this.database.bulkDelete(this.model, ctx.getBody());
    return ctx.send({ message: 'Entities deleted successfully', data });
  }
}