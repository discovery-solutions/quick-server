import { MongoClient, Db, Collection, ObjectId } from 'mongodb';
import { DatabaseInterface } from './types';
import { Logger } from '../../utils/logger';

export class MongoDB implements DatabaseInterface {
  private db: Db;
  private logger: Logger;

  constructor(uri: string, dbName: string, logs: boolean = false) {
    const client = new MongoClient(uri);
    this.logger = new Logger('MongoDB', logs);
    this.db = client.db(dbName);
    this.logger.log(`Connected to MongoDB database: "${dbName}"`);
  }

  async insert<T>(table: string, data: T): Promise<ObjectId> {
    this.logger.log(`Inserting a record into table "${table}"...`);
    const collection: Collection = this.db.collection(table);
    const res = await collection.insertOne(data);
    this.logger.log(`Record inserted into table "${table}".`);
    return res.insertedId;
  }

  async get<T>(table: string, query: object): Promise<T[]> {
    this.logger.log(`Fetching records from table "${table}" with query: ${JSON.stringify(query)}`);
    const collection: Collection = this.db.collection(table);
    const result = await collection.find(query).toArray();
    this.logger.log(`Fetched ${result.length} record(s) from table "${table}".`);
    return result as T[];
  }

  async update<T>(table: string, query: object, data: T): Promise<void> {
    this.logger.log(`Updating records in table "${table}" with query: ${JSON.stringify(query)}`);
    const collection: Collection = this.db.collection(table);
    const result = await collection.updateOne(query, { $set: data });
    this.logger.log(`Matched ${result.matchedCount} record(s) and modified ${result.modifiedCount} record(s) in table "${table}".`);
  }

  async delete(table: string, query: object): Promise<void> {
    this.logger.log(`Deleting records from table "${table}" with query: ${JSON.stringify(query)}`);
    const collection: Collection = this.db.collection(table);
    const result = await collection.deleteOne(query);
    this.logger.log(`Deleted ${result.deletedCount} record(s) from table "${table}".`);
  }

  async bulkInsert<T>(table: string, data: T[]): Promise<void> {
    this.logger.log(`Performing bulk insert into table "${table}" with ${data.length} record(s).`);
    const collection: Collection = this.db.collection(table);
    const result = await collection.insertMany(data);
    this.logger.log(`Bulk insert completed. Inserted ${result.insertedCount} record(s) into table "${table}".`);
  }

  async bulkUpdate<T>(table: string, data: T[]): Promise<void> {
    this.logger.log(`Performing bulk update on table "${table}" with ${data.length} record(s).`);
    const collection: Collection = this.db.collection(table);
    const bulkOps = data.map(item => ({
      updateOne: {
        filter: { id: item['id'] },
        update: { $set: item },
        upsert: true,
      }
    }));
    const result = await collection.bulkWrite(bulkOps);
    this.logger.log(`Bulk update completed. Matched ${result.matchedCount} and modified ${result.modifiedCount} record(s) in table "${table}".`);
  }

  async bulkDelete<T>(table: string, data: T[]): Promise<void> {
    this.logger.log(`Performing bulk delete from table "${table}" with ${data.length} record(s).`);
    const collection: Collection = this.db.collection(table);
    const ids = data.map(item => item['id']);
    const result = await collection.deleteMany({ id: { $in: ids } });
    this.logger.log(`Bulk delete completed. Deleted ${result.deletedCount} record(s) from table "${table}".`);
  }
}
