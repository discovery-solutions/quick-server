import { DatabaseInterface } from './types';
import { Logger } from '../../utils/logger';
import mysql from 'mysql2/promise';

export class MySqlDB implements DatabaseInterface {
  private connection: mysql.Connection;
  private logger: Logger;

  constructor(config: mysql.ConnectionOptions, logs: boolean = false) {
    this.logger = new Logger('MySqlDB', logs);
    this.connect(config).then(() => {
      this.logger.log('Connected to MySQL database.');
    }).catch((error) => {
      this.logger.error(`Failed to connect to MySQL database: ${error.message}`);
    });
  }

  private async connect(config: mysql.ConnectionOptions) {
    this.connection = await mysql.createConnection(config);
  }

  async insert<T>(table: string, data: T): Promise<string> {
    this.logger.log(`Inserting a record into table "${table}"...`);
    const [result] = await this.connection.execute(
      `INSERT INTO ${table} SET ?`, 
      [data]
    );
    this.logger.log(`Record inserted into table "${table}". Result: ${JSON.stringify(result)}`);
    return result[0].insertId;
  }

  async get<T>(table: string, query: object): Promise<T[]> {
    this.logger.log(`Fetching records from table "${table}" with query: ${JSON.stringify(query)}`);
    const [_, rows] = await this.connection.execute(
      `SELECT * FROM ${table} WHERE ?`, 
      [query]
    );
    this.logger.log(`Fetched ${rows.length} record(s) from table "${table}".`);
    return rows as T[];
  }

  async update<T>(table: string, query: object, data: T): Promise<void> {
    this.logger.log(`Updating records in table "${table}" with query: ${JSON.stringify(query)}`);
    const [result] = await this.connection.execute(
      `UPDATE ${table} SET ? WHERE ?`, 
      [data, query]
    );
    this.logger.log(`Records updated in table "${table}". Result: ${JSON.stringify(result)}`);
  }

  async delete(table: string, query: object): Promise<void> {
    this.logger.log(`Deleting records from table "${table}" with query: ${JSON.stringify(query)}`);
    const [result] = await this.connection.execute(
      `DELETE FROM ${table} WHERE ?`, 
      [query]
    );
    this.logger.log(`Deleted records from table "${table}". Result: ${JSON.stringify(result)}`);
  }

  async bulkInsert<T>(table: string, data: T[]): Promise<void> {
    this.logger.log(`Performing bulk insert into table "${table}" with ${data.length} record(s).`);
    const [result] = await this.connection.query(
      `INSERT INTO ${table} SET ?`, 
      [data]
    );
    this.logger.log(`Bulk insert completed. Result: ${JSON.stringify(result)}`);
  }

  async bulkUpdate<T>(table: string, data: T[]): Promise<void> {
    this.logger.log(`Performing bulk update on table "${table}" with ${data.length} record(s).`);
    const bulkOps = data.map(item => ({
      updateOne: {
        filter: { id: item['id'] },
        update: { $set: item },
        upsert: true,
      }
    }));
    const [result] = await this.connection.query(
      `UPDATE ${table} SET ? WHERE id IN (?)`,
      [data, bulkOps]
    );
    this.logger.log(`Bulk update completed. Result: ${JSON.stringify(result)}`);
  }

  async bulkDelete<T>(table: string, data: T[]): Promise<void> {
    this.logger.log(`Performing bulk delete from table "${table}" with ${data.length} record(s).`);
    const ids = data.map(item => item['id']);
    const [result] = await this.connection.execute(
      `DELETE FROM ${table} WHERE id IN (?)`, 
      [ids]
    );
    this.logger.log(`Bulk delete completed. Result: ${JSON.stringify(result)}`);
  }
}
