import { EntityConfig, EntityField } from "../../types";
export declare class Entity implements EntityConfig {
    name: EntityConfig['name'];
    alias: EntityConfig['alias'];
    auth?: EntityConfig['auth'];
    fields: Record<string, EntityField>;
    constructor(entity: EntityConfig);
    parse(data: Record<string, any>): Record<string, any>;
    secure(data: Record<string, any> | Record<string, any>[]): any;
    validate(data: Record<string, any>): {
        valid: boolean;
        errors: string[];
    };
}
