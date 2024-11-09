import { Database } from './index';
import mysql from 'mysql2/promise';

export class MySqlDB implements Database {
  private connection: mysql.Connection;

  constructor(config: mysql.ConnectionOptions) {
    mysql.createConnection(config).then(res => {
      this.connection = res;
    });
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
      data
    );
  }
}