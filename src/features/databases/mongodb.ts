import { MongoClient, Db, Collection } from 'mongodb';
import { DatabaseInterface } from './types';

export class MongoDB implements DatabaseInterface {
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

  async bulkUpdate<T>(table: string, data: T[]): Promise<void> {
    const collection: Collection = this.db.collection(table);
    const bulkOps = data.map(item => ({
      updateOne: {
        filter: { id: item['id'] },
        update: { $set: item },
        upsert: true,
      }
    }));
    await collection.bulkWrite(bulkOps);
  }

  async bulkDelete<T>(table: string, data: T[]): Promise<void> {
    const collection: Collection = this.db.collection(table);
    const ids = data.map(item => item['id']);
    await collection.deleteMany({ id: { $in: ids } });
  }
}
