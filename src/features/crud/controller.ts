import type { WebSocketContext } from "../../servers/socket/types";
import type { HTTPContext } from "../../servers/http/types";
import { DatabaseInterface } from "../databases";
import { EntityManager, Entity } from "../entity";

export class ControllerCRUD {
  private model: any;
  private database: DatabaseInterface;
  private entity: Entity;

  constructor(model: any) {
    this.model = model;
    this.entity = EntityManager.get(model);
  }

  setDatabase = (database: DatabaseInterface) => {
    this.database = database;
  }

  list = async (ctx: HTTPContext | WebSocketContext) => {
    const entities = await this.database.get(this.model, {});
    return ctx.send(entities);
  }

  create = async (ctx: HTTPContext | WebSocketContext)  =>{
    const data = ctx.getBody();
    const { valid, errors } = this.entity.validate(data);

    if (valid === false)
      return ctx.status(400).error({ message: `Invalid fields for new ${this.model}`, errors });

    const id = await this.database.insert(this.model, data);
    
    return ctx.send({ id });
  }

  get = async (ctx: HTTPContext | WebSocketContext) => {
    const { id } = ctx.getParams();
    const data = await this.database.get(this.model, { id });

    if (!data) return ctx.error(new Error('Entity not found'));
    
    return ctx.send(data);
  }

  update = async (ctx: HTTPContext | WebSocketContext) => {
    const data = ctx.getBody();
    const { id } = ctx.getParams();
    const { valid, errors } = this.entity.validate(data);

    if (valid === false)
      return ctx.status(400).error({ message: `Invalid fields to update ${this.model} #${id}`, errors });
    
    await this.database.update(this.model, { id }, data);

    return ctx.send({ message: 'Entity updated successfully' });
  }

  delete = async (ctx: HTTPContext | WebSocketContext) => {
    const { id } = ctx.getParams();
    
    await this.database.delete(this.model, { id });

    return ctx.send({ message: 'Entity deleted successfully' });
  }

  bulkInsert = async (ctx: HTTPContext | WebSocketContext) => {
    const data = await this.database.bulkInsert(this.model, ctx.getBody());
    return ctx.send({ message: 'Entities inserted successfully', data });
  }

  bulkUpdate = async (ctx: HTTPContext | WebSocketContext) => {
    const data = await this.database.bulkUpdate(this.model, ctx.getBody());
    return ctx.send({ message: 'Entities updated successfully', data });
  }

  bulkDelete = async (ctx: HTTPContext | WebSocketContext) => {
    const data = await this.database.bulkDelete(this.model, ctx.getBody());
    return ctx.send({ message: 'Entities deleted successfully', data });
  }
}