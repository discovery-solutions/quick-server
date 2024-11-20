import type { SocketContext, HTTPContext } from "../../servers";
import { EntityManager, Entity } from "../entity";
import { DatabaseInterface } from "../databases";

export class ControllerCRUD {
  private model: string;
  private database: DatabaseInterface;
  private entity: Entity;

  constructor(model: string) {
    this.model = model;
    this.entity = EntityManager.get(model);
  }

  setDatabase = (database: DatabaseInterface) => {
    this.database = database;
  }

  private async resolveEntityRelations(data: any | any[]) {
    if (!data) return data;

    if (!Array.isArray(data))
      return await this.entity.resolveRelations(data, this.database);
      
    return await Promise.all(data.map(item => this.entity.resolveRelations(item, this.database)));
  }

  list = async (ctx: HTTPContext | SocketContext) => {
    const entities = await this.database.get(this.model, {});
    const resolvedEntities = await this.resolveEntityRelations(entities);
    return ctx.send(this.entity.secure(resolvedEntities));
  };

  create = async (ctx: HTTPContext | SocketContext) => {
    const data = ctx.getBody();
    const { valid, errors } = this.entity.validate(data);

    if (!valid) {
      return ctx.status(400).error({
        message: `Invalid fields for new ${this.model}`,
        errors,
      });
    }

    const id = await this.database.insert(this.model, data);
    return ctx.send({ id });
  };

  get = async (ctx: HTTPContext | SocketContext) => {
    const { id } = ctx.getParams();
    const [data] = await this.database.get(this.model, { id });

    if (!data) {
      return ctx.status(404).error(new Error("Entity not found"));
    }

    const resolvedData = await this.resolveEntityRelations(data);
    return ctx.send(this.entity.secure(resolvedData));
  };

  update = async (ctx: HTTPContext | SocketContext) => {
    const data = ctx.getBody();
    const { id } = ctx.getParams();
    const { valid, errors } = this.entity.validate(data, false);

    if (!valid) {
      return ctx.status(400).error({
        message: `Invalid fields to update ${this.model} #${id}`,
        errors,
      });
    }

    await this.database.update(this.model, { id }, data);
    return ctx.send({ message: "Entity updated successfully" });
  };

  delete = async (ctx: HTTPContext | SocketContext) => {
    const { id } = ctx.getParams();

    await this.database.delete(this.model, { id });
    return ctx.send({ message: "Entity deleted successfully" });
  };

  bulkInsert = async (ctx: HTTPContext | SocketContext) => {
    await this.database.bulkInsert(this.model, ctx.getBody());
    return ctx.send({ message: "Entities inserted successfully" });
  };

  bulkUpdate = async (ctx: HTTPContext | SocketContext) => {
    await this.database.bulkUpdate(this.model, ctx.getBody());
    return ctx.send({ message: "Entities updated successfully" });
  };

  bulkDelete = async (ctx: HTTPContext | SocketContext) => {
    await this.database.bulkDelete(this.model, ctx.getBody());
    return ctx.send({ message: "Entities deleted successfully" });
  };
}
