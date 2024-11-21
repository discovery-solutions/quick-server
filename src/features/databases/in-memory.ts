import { DatabaseInterface } from './types';
import { Logger } from '../../utils/logger';
import { uuid } from '../../utils';

interface InMemoryTable {
  [key: string]: any[];
}

export class InMemoryDB implements DatabaseInterface {
  private db: InMemoryTable = {};
  private logger: Logger;

  constructor(logs: boolean = false) {
    this.logger = new Logger('InMemoryDB', logs);
  }

  async insert<T>(table: string, data: T): Promise<string> {
    if (!this.db[table]) {
      this.logger.log(`Creating non-existent table "${table}"`);
      this.db[table] = [];
    }

    const dataToInsert = {
      id: uuid(),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: undefined,
    }
    
    this.logger.log(`Inserting into ${table}...`);
    this.db[table].push(dataToInsert);
    this.logger.log(`Insert completed!`);
    return dataToInsert.id;
  }

  async get<T>(table: string, query: object = {}): Promise<T[]> {
    this.logger.log(`Fetching records from table "${table}" with query: ${JSON.stringify(query)}`);
    const data = this.db[table] || [];
    const result = data.filter(item => {
      return Object.keys(query).every(key => item[key] === query[key]);
    });
    this.logger.log(`Fetched ${result.length} record(s) from table "${table}".`);
    return result;
  }

  async update<T>(table: string, query: object, data: T): Promise<void> {
    this.logger.log(`Updating records in table "${table}" with query: ${JSON.stringify(query)}`);
    const items = this.db[table] || [];
    const targets = items.filter(item => {
      return Object.keys(query).every(key => item[key] === query[key] && !item.deletedAt);
    });

    if (targets.length === 0)
      throw new Error('Invalid Query: ' + JSON.stringify(query));
    
    for (const target of targets) {
      const index = items.findIndex(item => item.id === target.id);
      this.db[table][index] = {
        ...this.db[table][index],
        ...data,
        updatedAt: new Date(),
      }
    }
    this.logger.log(`Matched ${targets.length} record(s) and modified ${targets.length} record(s) in table "${table}".`);
  }

  async delete(table: string, query: object): Promise<void> {
    const initialCount = this.db[table].length;
    this.logger.log(`Deleting records from table "${table}" with query: ${JSON.stringify(query)}`);
    const data = this.db[table] || [];
    this.db[table] = data.filter(item => {
      return !Object.keys(query).every(key => item[key] === query[key]);
    });
    const deletedCount = initialCount - this.db[table].length;
    this.logger.log(`Deleted ${deletedCount} record(s) from table "${table}".`);
  }

  async bulkInsert<T>(table: string, raw: T[]): Promise<void> {
    if (!this.db[table])
      this.db[table] = [];
    
    this.logger.log(`Performing bulk insert into table "${table}" with ${raw.length} record(s).`);
    const data = raw.map(item => ({
      id: uuid(),
      ...item,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: undefined,
    }));

    this.db[table] = [...this.db[table], ...data];
    this.logger.log(`Bulk insert completed. Inserted ${raw.length} record(s) into table "${table}".`);
  }

  async bulkUpdate<T>(table: string, data: T[]): Promise<void> {
    this.logger.log(`Performing bulk update on table "${table}" with ${data.length} record(s).`);
    
    for (const item of data)
      await this.update(table, { id: item['id'] }, item);

    this.logger.log(`Bulk update completed. Matched ${data.length} and modified ${data.length} record(s) in table "${table}".`);
  }

  async bulkDelete<T>(table: string, data: T[]): Promise<void> {
    this.logger.log(`Performing bulk delete from table "${table}" with ${data.length} record(s).`);

    const items = this.db[table] || [];
    this.db[table] = items.filter(item => !data.some(d => d['id'] === item['id']));

    this.logger.log(`Bulk delete completed. Deleted ${data.length} record(s) from table "${table}".`);
  }

  async search<T>(query: string): Promise<Record<string, T[]>> {
    this.logger.log(`Performing global search for term: "${query}"`);
    
    const lowerCasedTerm = query.toLowerCase();
    const results: Record<string, T[]> = {};
  
    for (const table in this.db) {
      const tableData = this.db[table];
      const matches = tableData.filter(item => {
        return Object.values(item).some(value => {
          if (typeof value === 'string' || typeof value === 'number') {
            return value.toString().toLowerCase().includes(lowerCasedTerm);
          }
          return false;
        });
      });
  
      if (matches.length > 0) {
        results[table] = matches.map(item => {
          if (item._id) {
            item.id = item._id.toString();
            delete item._id;
          }
          return item as T;
        });
      }
    }
  
    this.logger.log(`Global search completed. Found results in ${Object.keys(results).length} table(s).`);
    return results;
  }  
}
