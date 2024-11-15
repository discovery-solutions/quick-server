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

  async get<T>(table: string, query: object): Promise<T[]> {
    const data = this.db[table] || [];
    return data.filter(item => {
      return Object.keys(query).every(key => item[key] === query[key]);
    });
  }

  async findById<T>(table: string, id: string): Promise<T | undefined> {
    const data = this.db[table] || [];
    return data.find(item => item.id === id);
  }

  async update<T>(table: string, query: object, data: T): Promise<void> {
    const items = this.db[table] || [];
    const index = items.findIndex(item => {
      return Object.keys(query).every(key => item[key] === query[key] && !item.deletedAt);
    });

    if (index < 0) throw new Error('Invalid ID');
    
    this.db[table][index] = {
      ...this.db[table][index],
      ...data,
      updatedAt: new Date(),
    }
  }

  async delete(table: string, query: object): Promise<void> {
    const data = this.db[table] || [];
    this.db[table] = data.filter(item => {
      return !Object.keys(query).every(key => item[key] === query[key]);
    });
  }

  async bulkInsert<T>(table: string, raw: T[]): Promise<void> {
    if (!this.db[table])
      this.db[table] = [];
    
    const data = raw.map(item => ({
      id: uuid(),
      ...item,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: undefined,
    }));

    this.db[table] = [...this.db[table], ...data];
  }

  async bulkUpdate<T>(table: string, data: T[]): Promise<void> {
    for (const item of data)
      await this.update(table, { id: item['id'] }, item);
  }

  async bulkDelete<T>(table: string, data: T[]): Promise<void> {
    const items = this.db[table] || [];
    this.db[table] = items.filter(item => !data.some(d => d['id'] === item['id']));
  }
}
