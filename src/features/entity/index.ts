import { EntityConfig } from "../../types";

export class Entity {
  private static instance: Entity | null = null;
  private entities: Map<string, EntityConfig> = new Map();
  private static raw: EntityConfig[];

  private constructor() {}

  public static initialize(entities: EntityConfig[]) {
    this.raw = entities;

    if (Entity.instance) return ;
      
    Entity.instance = new Entity();

    for (const entity of entities)
      Entity.instance.entities.set(entity.name, entity);
  }

  public static get(identifier: string): EntityConfig | undefined {
    if (!Entity.instance)
      throw new Error(`Entity ${identifier} not initialized. Call Entity.initialize(entities) first.`);

    const entity = Entity.instance.entities.get(identifier);

    if (entity) return entity;

    const { alias } = Entity.raw.find(e => e.alias === identifier);

    return Entity.instance.entities.get(alias);
  }

  public static list() {
    return Entity.instance.entities.keys();
  }
}
