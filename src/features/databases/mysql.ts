import { DatabaseInterface } from './types';
import mysql from 'mysql2/promise';

export class MySqlDB implements DatabaseInterface {
  private connection: mysql.Connection;

  constructor(config: mysql.ConnectionOptions) {
    this.connect(config);
  }

  private async connect(config: mysql.ConnectionOptions) {
    this.connection = await mysql.createConnection(config);
  }

  async insert<T>(table: string, data: T): Promise<void> {
    const [rows] = await this.connection.execute(
      `INSERT INTO ${table} SET ?`, 
      [data]
    );
  }

  async get<T>(table: string, query: object): Promise<T[]> {
    const [rows] = await this.connection.execute(
      `SELECT * FROM ${table} WHERE ?`, 
      [query]
    );
    return rows as T[];
  }

  async update<T>(table: string, query: object, data: T): Promise<void> {
    await this.connection.execute(
      `UPDATE ${table} SET ? WHERE ?`, 
      [data, query]
    );
  }

  async delete(table: string, query: object): Promise<void> {
    await this.connection.execute(
      `DELETE FROM ${table} WHERE ?`, 
      [query]
    );
  }

  async bulkInsert<T>(table: string, data: T[]): Promise<void> {
    const [rows] = await this.connection.query(
      `INSERT INTO ${table} SET ?`, 
      [data]
    );
  }

  async bulkUpdate<T>(table: string, data: T[]): Promise<void> {
    const bulkOps = data.map(item => ({
      updateOne: {
        filter: { id: item['id'] },
        update: { $set: item },
        upsert: true,
      }
    }));
    await this.connection.query(
      `UPDATE ${table} SET ? WHERE id IN (?)`,
      [data, bulkOps]
    );
  }

  async bulkDelete<T>(table: string, data: T[]): Promise<void> {
    const ids = data.map(item => item['id']);
    await this.connection.execute(
      `DELETE FROM ${table} WHERE id IN (?)`, 
      [ids]
    );
  }
}
