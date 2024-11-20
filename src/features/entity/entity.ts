import { EntityManager } from ".";
import { EntityConfig, EntityField } from "../../types";
import { capitalize } from "../../utils";
import { DatabaseInterface } from "../databases";

export class Entity implements EntityConfig {
  name: EntityConfig['name'];
  alias: EntityConfig['alias'];
  auth?: EntityConfig['auth'];
  fields: Record<string, EntityField> = {};
  relationships: Record<string, Entity>;


  constructor(entity: EntityConfig) {
    this.name = entity.name;
    this.alias = entity.alias || capitalize(entity.name);
    this.auth = entity.auth;
    this.relationships = {};

    for (const key in entity.fields) {
      const field = entity.fields[key];

      if (typeof field === 'string') {
        this.fields[key] = {
          type: field as any,
          required: false,
          secure: false,
        }
      } else {
        this.fields[key] = { ...field };
      }

      if (this.fields[key].type === 'entity')
        this.relationships[key] = EntityManager.get(this.fields[key].entity);
    }
  }

  async resolveRelations(data: Record<string, any>, db: DatabaseInterface): Promise<Record<string, any>> {
    const resolvedData = { ...data };
   
    for (const [field, relatedEntity] of Object.entries(this.relationships)) {
      if (data[field])
        resolvedData[field] = await db.get(relatedEntity.name, { id: data[field] });
      
      if (resolvedData[field].length === 1)
        resolvedData[field] = resolvedData[field].pop();
    }

    return resolvedData;
  }

  public parse(data: Record<string, any>) {
    const parsedData: Record<string, any> = {};

    for (const key in this.fields)
      if (data[key] !== undefined) parsedData[key] = data[key];
      else parsedData[key] = null;

    return parsedData;
  }

  public secure(data: Record<string, any> | Record<string, any>[]) {
    if (Array.isArray(data))
      return data.map((item) => this.secure(item));

    const securedData: Record<string, any> = {};
    
    for (const key in data)
      if (!this.fields[key]?.secure)
        securedData[key] = data[key];
      
    return securedData;
  }

  public validate(data: Record<string, any>, force = true): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    for (const fieldName in this.fields) {
      const fieldConfig = this.fields[fieldName];
      const value = data[fieldName];

      if (force && fieldConfig.required && (value === undefined || value === null)) {
        errors.push(`Missing required field: '${fieldName}'.`);
        continue;
      }

      if (value !== undefined && typeof value !== fieldConfig.type) {
        let type = fieldConfig.type;

        if (['file', 'entity'].includes(fieldConfig.type)) {
          type = 'string';
          if (['string', 'number'].includes(typeof value)) continue;
        }

        errors.push(`Field '${fieldName}' must be of type '${type}', but received '${typeof value}'.`);
      }


      if (fieldConfig.secure && typeof value === "string")
        if (value.length === 0)
          errors.push(`Field '${fieldName}' must be a secure string (non-empty).`);
    }

    for (const key in data)
      if (!this.fields[key])
        errors.push(`Field '${key}' is not defined in the entity schema.`);

    const valid = errors.length === 0;

    return { valid, errors };
  }
}