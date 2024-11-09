// src/databases/mongoDb.ts

import { Database } from './index';
import { MongoClient, Db, Collection } from 'mongodb';

export class MongoDB implements Database {
  private db: Db;

  constructor(uri: string, dbName: string) {
    const client = new MongoClient(uri);
    this.db = client.db(dbName);
  }

  async insert<T>(table: string, data: T): Promise<void> {
    const collection: Collection = this.db.collection(table);
    await collection.insertOne(data);
  }

  async get<T>(table: string, query: object): Promise<T[]> {
    const collection: Collection = this.db.collection(table);
    const result = await collection.find(query).toArray();
    return result as T[];
  }

  async update<T>(table: string, query: object, data: T): Promise<void> {
    const collection: Collection = this.db.collection(table);
    await collection.updateOne(query, { $set: data });
  }

  async delete(table: string, query: object): Promise<void> {
    const collection: Collection = this.db.collection(table);
    await collection.deleteOne(query);
  }

  async bulkInsert<T>(table: string, data: T[]): Promise<void> {
    const collection: Collection = this.db.collection(table);
    await collection.insertMany(data);
  }
}
