import { DatabaseInterface } from './types';

interface InMemoryTable {
  [key: string]: any[];
}

export class InMemoryDB implements DatabaseInterface {
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

  async findById<T>(table: string, id: string): Promise<T | undefined> {
    const data = this.db[table] || [];
    return data.find(item => item.id === id);
  }

  async update<T>(table: string, query: object, data: T): Promise<void> {
    const items = this.db[table] || [];
    const item = items.find(item => {
      return Object.keys(query).every(key => item[key] === query[key]);
    });
    if (item) {
      Object.assign(item, data);
    }
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

  async bulkUpdate<T>(table: string, data: T[]): Promise<void> {
    const items = this.db[table] || [];
    data.forEach(itemData => {
      const index = items.findIndex(item => item.id === itemData['id']);
      if (index !== -1) {
        items[index] = { ...items[index], ...itemData };
      }
    });
  }

  async bulkDelete<T>(table: string, data: T[]): Promise<void> {
    const items = this.db[table] || [];
    this.db[table] = items.filter(item => !data.some(d => d['id'] === item['id']));
  }
}
