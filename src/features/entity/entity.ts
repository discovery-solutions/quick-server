import { EntityConfig, EntityField } from "../../types";
import { capitalize } from "../../utils";

export class Entity implements EntityConfig {
  name: EntityConfig['name'];
  alias: EntityConfig['alias'];
  auth?: EntityConfig['auth'];
  fields: Record<string, EntityField> = {};

  constructor(entity: EntityConfig) {
    this.name = entity.name;
    this.alias = entity.alias || capitalize(entity.name);
    this.auth = entity.auth;

    for (const key in entity.fields) {
      const field = entity.fields[key];

      if (typeof field === 'string') {
        this.fields[key] = {
          type: field as any,
          required: false,
          secure: false,
        }
      } else {
        this.fields[key] = {
          type: field.type,
          required: field.required,
          secure: field.secure,
        }
      }
    }
  }

  public parse(data: Record<string, any>) {
    const parsedData: Record<string, any> = {};

    for (const key in this.fields)
      if (data[key] !== undefined) parsedData[key] = data[key];
      else parsedData[key] = null;

    return parsedData;
  }

  public secure(data: Record<string, any>) {
    const securedData: Record<string, any> = {};
    
    for (const key in data)
      if (!this.fields[key]?.secure)
        securedData[key] = data[key];
      
    return securedData;
  }

  public validate(data: Record<string, any>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    for (const fieldName in this.fields) {
      const fieldConfig = this.fields[fieldName];
      const value = data[fieldName];

      if (fieldConfig.required && (value === undefined || value === null)) {
        errors.push(`Campo obrigatório '${fieldName}' está ausente.`);
        continue;
      }

      if (value !== undefined && typeof value !== fieldConfig.type)
        errors.push(`Campo '${fieldName}' deve ser do tipo '${fieldConfig.type}', mas recebeu '${typeof value}'.`);

      if (fieldConfig.secure && typeof value === "string")
        if (value.length === 0)
          errors.push(`Campo '${fieldName}' deve ser uma string segura (não vazia).`);
    }

    for (const key in data)
      if (!this.fields[key])
        errors.push(`Campo '${key}' não está definido no esquema da entidade.`);

    const valid = errors.length === 0;

    return { valid, errors };
  }
}