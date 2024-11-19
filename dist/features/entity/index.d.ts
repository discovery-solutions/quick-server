import { EntityConfig } from "../../types";
import { Entity } from "./entity";
export { Entity };
export declare class EntityManager {
    private static instance;
    private entities;
    private static raw;
    private constructor();
    static initialize(entities: EntityConfig[]): void;
    static get(identifier: string): Entity | undefined;
    static list(): MapIterator<string>;
}
