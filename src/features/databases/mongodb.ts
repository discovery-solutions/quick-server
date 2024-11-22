import { MongoClient, Db, Collection, ObjectId } from 'mongodb';
import { DatabaseInterface } from './types';
import { EntityManager } from '../entity';
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

  private parse(query: Record<string, any> = {}) {
    if (query.id) {
      query._id = query.id;
      delete query.id;
    }

    for (const key in query)
      if (ObjectId.isValid(query[key]))
        query[key] = new ObjectId(String(query[key]));

    console.log({ query })
    return query;
  }

  private addTimestamps(data: Record<string, any>) {
    const now = new Date();
    const parsed = this.parse(data);
    delete parsed.id;
    delete parsed._id;

    return {
      ...parsed,
      createdAt: data.createdAt || now,
      updatedAt: now,
      deletedAt: undefined,
    };
  }
  
  private transformResult<T>(result: T[]): T[] {
    return result.map((data: any) => {
      if (data._id) {
        data['id'] = data._id.toString();
        delete data._id;
      }
      
      return data;
    });
  }

  async insert<T>(table: string, data: T): Promise<string> {
    this.logger.log(`Inserting a record into table "${table}"...`);
    const collection: Collection = this.db.collection(table);
    const res = await collection.insertOne(this.addTimestamps(data));
    this.logger.log(`Record inserted into table "${table}".`);
    return res.insertedId.toString();
  }

  async get<T>(table: string, query: Record<string, any> = {}): Promise<T[]> {
    this.logger.log(`Fetching records from table "${table}" with query: ${JSON.stringify(query)}`);
    const collection: Collection = this.db.collection(table);
    const result = await collection.find(this.parse(query)).toArray();
    console.log(table, result)
    this.logger.log(`Fetched ${result.length} record(s) from table "${table}".`);
    return this.transformResult(result) as T[];
  }

  async update<T>(table: string, query: Record<string, any>, data: T): Promise<void> {
    this.logger.log(`Updating records in table "${table}" with query: ${JSON.stringify(query)}`);
    const collection: Collection = this.db.collection(table);
    const result = await collection.updateOne(this.parse(query), { $set: this.addTimestamps(data) });
    this.logger.log(`Matched ${result.matchedCount} record(s) and modified ${result.modifiedCount} record(s) in table "${table}".`);
  }

  async delete(table: string, query: Record<string, any> = {}): Promise<void> {
    this.logger.log(`Deleting records from table "${table}" with query: ${JSON.stringify(query)}`);
    const collection: Collection = this.db.collection(table);
    const result = await collection.deleteOne(this.parse(query));
    this.logger.log(`Deleted ${result.deletedCount} record(s) from table "${table}".`);
  }

  async bulkInsert<T>(table: string, data: T[]): Promise<void> {
    this.logger.log(`Performing bulk insert into table "${table}" with ${data.length} record(s).`);
    const collection: Collection = this.db.collection(table);
    const dataWithTimestamps = data.map(item => this.addTimestamps(item));
    const result = await collection.insertMany(dataWithTimestamps);
    this.logger.log(`Bulk insert completed. Inserted ${result.insertedCount} record(s) into table "${table}".`);
  }

  async bulkUpdate<T>(table: string, data: T[]): Promise<void> {
    this.logger.log(`Performing bulk update on table "${table}" with ${data.length} record(s).`);
    const collection: Collection = this.db.collection(table);
    const bulkOps = data.map(item => ({
      updateOne: {
        filter: { _id: item['_id'] },
        update: { $set: this.addTimestamps(item) },
        upsert: true,
      },
    }));
    const result = await collection.bulkWrite(bulkOps);
    this.logger.log(`Bulk update completed. Matched ${result.matchedCount} and modified ${result.modifiedCount} record(s) in table "${table}".`);
  }

  async bulkDelete<T>(table: string, data: T[]): Promise<void> {
    this.logger.log(`Performing bulk delete from table "${table}" with ${data.length} record(s).`);
    const collection: Collection = this.db.collection(table);
    const ids = data.map(item => item['_id']);
    const result = await collection.deleteMany({ _id: { $in: ids } });
    this.logger.log(`Bulk delete completed. Deleted ${result.deletedCount} record(s) from table "${table}".`);
  }

  async search<T>(query: string): Promise<Record<string, T[]>> {
    this.logger.log(`Performing global search for term: "${query}" across all collections.`);
    
    const collections = await this.db.listCollections().toArray();
    const results: Record<string, T[]> = {};
  
    for (const { name } of collections) {
      const entity = EntityManager.get(name);
      this.logger.log(`Searching in collection: "${name}"`);
  
      if (!entity) continue;
  
      const collection: Collection = this.db.collection(name);
      
      const result = await collection.find({
        $or: Object.keys(entity.fields).map(field => ({
          [field]: { $regex: query, $options: "i" },
        })),
      }).toArray();
  
      if (result.length > 0) {
        results[name] = result.map(item => {
          if (item._id) {
            item.id = item._id.toString();
            delete item._id;
          }
          return item as T;
        });
      }
    }
  
    this.logger.log(`Global search completed. Found results in ${Object.keys(results).length} collection(s).`);
    return results;
  }  
}
