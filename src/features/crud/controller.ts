import type { SocketContext, HTTPContext } from "../../servers";
import { EntityManager, Entity } from "../entity";
import { DatabaseInterface } from "../databases";

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

  list = async (ctx: HTTPContext | SocketContext) => {
    const entities = await this.database.get(this.model, {});
    return ctx.send(this.entity.secure(entities));
  }

  create = async (ctx: HTTPContext | SocketContext)  =>{
    const data = ctx.getBody();
    const { valid, errors } = this.entity.validate(data);

    if (valid === false)
      return ctx.status(400).error({ message: `Invalid fields for new ${this.model}`, errors });

    const id = await this.database.insert(this.model, data);
    
    return ctx.send({ id });
  }

  get = async (ctx: HTTPContext | SocketContext) => {
    const { id } = ctx.getParams();
    const [data] = await this.database.get(this.model, { id });

    if (!data) return ctx.status(404).error(new Error('Entity not found'));
    
    return ctx.send(this.entity.secure(data));
  }

  update = async (ctx: HTTPContext | SocketContext) => {
    const data = ctx.getBody();
    const { id } = ctx.getParams();
    const { valid, errors } = this.entity.validate(data);

    if (valid === false)
      return ctx.status(400).error({ message: `Invalid fields to update ${this.model} #${id}`, errors });
    
    await this.database.update(this.model, { id }, data);

    return ctx.send({ message: 'Entity updated successfully' });
  }

  delete = async (ctx: HTTPContext | SocketContext) => {
    const { id } = ctx.getParams();
    
    await this.database.delete(this.model, { id });

    return ctx.send({ message: 'Entity deleted successfully' });
  }

  bulkInsert = async (ctx: HTTPContext | SocketContext) => {
    await this.database.bulkInsert(this.model, ctx.getBody());
    return ctx.send({ message: 'Entities inserted successfully' });
  }

  bulkUpdate = async (ctx: HTTPContext | SocketContext) => {
    await this.database.bulkUpdate(this.model, ctx.getBody());
    return ctx.send({ message: 'Entities updated successfully' });
  }

  bulkDelete = async (ctx: HTTPContext | SocketContext) => {
    await this.database.bulkDelete(this.model, ctx.getBody());
    return ctx.send({ message: 'Entities deleted successfully' });
  }
}