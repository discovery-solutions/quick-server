import { ObjectId } from "mongodb";

export interface DatabaseInterface {
  insert<T>(table: string, data: T): Promise<string | number | ObjectId>;
  get<T>(table: string, query: object): Promise<T[]>;
  update<T>(table: string, query: object, data: T): Promise<void>;
  delete(table: string, query: object): Promise<void>;
  bulkInsert<T>(table: string, data: T[]): Promise<void>;
  bulkUpdate<T>(table: string, data: T[]): Promise<void>;
  bulkDelete<T>(table: string, data: T[]): Promise<void>;
}