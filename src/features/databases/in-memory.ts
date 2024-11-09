import { Database } from './index';

interface InMemoryTable {
  [key: string]: any[];
}

export class InMemoryDB implements Database {
  private db: InMemoryTable = {};

  async insert<T>(table: string, data: T): Promise<void> {
    if (!this.db[table]) {
      this.db[table] = [];
    }
    this.db[table].push(data);
  }

  async get<T>(table: string, query: object): Promise<T[]> {
    const data = this.db[table] || [];
    return data.filter(item => {
      return Object.keys(query).every(key => item[key] === query[key]);
    });
  }

  async update<T>(table: string, query: object, data: T): Promise<void> {
    const items = await this.get(table, query);
    items.forEach(item => {
      Object.assign(item, data);
    });
  }

  async delete(table: string, query: object): Promise<void> {
    const data = this.db[table] || [];
    this.db[table] = data.filter(item => {
      return !Object.keys(query).every(key => item[key] === query[key]);
    });
  }

  async bulkInsert<T>(table: string, data: T[]): Promise<void> {
    if (!this.db[table]) {
      this.db[table] = [];
    }
    this.db[table] = [...this.db[table], ...data];
  }
}
