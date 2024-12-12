import { EntityConfig } from "../../types";
import { Entity } from "./entity";

export { Entity };

export class EntityManager {
  private static instance: EntityManager | null = null;
  private entities: Map<string, Entity> = new Map();
  private static raw: EntityConfig[];

  private constructor() {}

  public static initialize(entities: EntityConfig[]) {
    this.raw = entities;

    if (EntityManager.instance) return ;
      
    EntityManager.instance = new EntityManager();

    for (const item of entities)
      EntityManager.instance.entities.set(item.name, new Entity(item));
  }

  public static get(identifier: string): Entity | undefined {
    if (!EntityManager.instance)
      throw new Error(`Entity ${identifier} not initialized. Call EntityManager.initialize(entities) first.`);

    const entity = EntityManager.instance.entities.get(identifier);

    if (entity) return entity;

    const { alias } = EntityManager.raw.find(e => e.alias === identifier) || {};

    return EntityManager.instance.entities.get(alias);
  }

  public static list() {
    if (!EntityManager.instance)
      throw new Error(`EntityManager not initialized. Call EntityManager.initialize(entities) first.`);

    return EntityManager.instance.entities.keys();
  }
}