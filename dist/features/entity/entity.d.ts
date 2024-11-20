import { EntityConfig, EntityField } from "../../types/";
import { DatabaseInterface } from "../databases";
export declare class Entity implements EntityConfig {
    name: EntityConfig['name'];
    alias: EntityConfig['alias'];
    auth?: EntityConfig['auth'];
    fields: Record<string, EntityField>;
    relationships: Record<string, Entity>;
    constructor(entity: EntityConfig);
    resolveRelations(data: Record<string, any>, db: DatabaseInterface): Promise<Record<string, any>>;
    parse(data: Record<string, any>): Record<string, any>;
    secure(data: Record<string, any> | Record<string, any>[]): any;
    validate(data: Record<string, any>, force?: boolean): {
        valid: boolean;
        errors: string[];
    };
}
