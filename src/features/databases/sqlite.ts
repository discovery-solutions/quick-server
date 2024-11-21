import { DatabaseInterface } from './types';
import { Logger } from '../../utils/logger';
import sqlite3 from 'sqlite3';

export class SqliteDB implements DatabaseInterface {
  private db: sqlite3.Database;
  private logger: Logger;

  constructor(dbFile: string, logs: boolean = false) {
    this.logger = new Logger('SqliteDB', logs);
    this.db = new sqlite3.Database(dbFile);
  }

  private runQuery<T>(query: string, params: any[]): Promise<number | void> {
    return new Promise((resolve, reject) => {
      this.db.run(query, params, function (err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });
  }

  private allQuery<T>(query: string, params: any[]): Promise<T[]> {
    return new Promise((resolve, reject) => {
      this.db.all(query, params, (err, rows: any) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  async insert<T>(table: string, data: T): Promise<number> {
    const placeholders = Object.values(data).map(() => '?').join(',');
    const query = `INSERT INTO ${table} (${Object.keys(data).join(',')}) VALUES (${placeholders})`;
    const values = Object.values(data);

    this.logger.log(`Executing query: ${query} with values: ${JSON.stringify(values)}`);
    try {
      const id = await this.runQuery(query, values);
      this.logger.log(`Query executed successfully: ${query}`);
      return id as number;
    } catch (err) {
      this.logger.error(`Error executing query: ${err.message}`);
      throw err;
    }
  }

  async get<T>(table: string, query: object = {}): Promise<T[]> {
    const conditions = Object.keys(query)
      .map((key) => `${key} = ?`)
      .join(' AND ');
    const sql = `SELECT * FROM ${table} WHERE ${conditions}`;
    const values = Object.values(query);

    this.logger.log(`Executing query: ${sql} with values: ${JSON.stringify(values)}`);
    try {
      const rows: T[] = await this.allQuery(sql, values);
      this.logger.log(`Query executed successfully: ${sql}`);
      return rows;
    } catch (err) {
      this.logger.error(`Error executing query: ${err.message}`);
      throw err;
    }
  }

  async update<T>(table: string, query: object, data: T): Promise<void> {
    const setClause = Object.keys(data)
      .map((key) => `${key} = ?`)
      .join(',');
    const conditions = Object.keys(query)
      .map((key) => `${key} = ?`)
      .join(' AND ');
    const sql = `UPDATE ${table} SET ${setClause} WHERE ${conditions}`;
    const values = [...Object.values(data), ...Object.values(query)];

    this.logger.log(`Executing query: ${sql} with values: ${JSON.stringify(values)}`);
    try {
      await this.runQuery(sql, values);
      this.logger.log(`Query executed successfully: ${sql}`);
    } catch (err) {
      this.logger.error(`Error executing query: ${err.message}`);
      throw err;
    }
  }

  async delete(table: string, query: object): Promise<void> {
    const conditions = Object.keys(query)
      .map((key) => `${key} = ?`)
      .join(' AND ');
    const sql = `DELETE FROM ${table} WHERE ${conditions}`;
    const values = Object.values(query);

    this.logger.log(`Executing query: ${sql} with values: ${JSON.stringify(values)}`);
    try {
      await this.runQuery(sql, values);
      this.logger.log(`Query executed successfully: ${sql}`);
    } catch (err) {
      this.logger.error(`Error executing query: ${err.message}`);
      throw err;
    }
  }

  async bulkInsert<T>(table: string, data: T[]): Promise<void> {
    const placeholders = data
      .map(() => `(${Object.keys(data[0]).map(() => '?').join(',')})`)
      .join(',');
    const query = `INSERT INTO ${table} (${Object.keys(data[0]).join(',')}) VALUES ${placeholders}`;
    const values = data.flatMap((item) => Object.values(item));

    this.logger.log(`Executing query: ${query} with values: ${JSON.stringify(values)}`);
    try {
      await this.runQuery(query, values);
      this.logger.log(`Query executed successfully: ${query}`);
    } catch (err) {
      this.logger.error(`Error executing query: ${err.message}`);
      throw err;
    }
  }

  async bulkUpdate<T>(table: string, data: T[]): Promise<void> {
    const setClause = Object.keys(data[0])
      .map((key) => `${key} = ?`)
      .join(',');
    const placeholders = data
      .map(() => `(${Object.keys(data[0]).map(() => '?').join(',')})`)
      .join(',');
    const query = `UPDATE ${table} SET ${setClause} WHERE ${placeholders}`;
    const values = data.flatMap((item) => Object.values(item));

    this.logger.log(`Executing query: ${query} with values: ${JSON.stringify(values)}`);
    try {
      await this.runQuery(query, values);
      this.logger.log(`Query executed successfully: ${query}`);
    } catch (err) {
      this.logger.error(`Error executing query: ${err.message}`);
      throw err;
    }
  }

  async bulkDelete<T>(table: string, data: T[]): Promise<void> {
    const conditions = data
      .map(() => `id = ?`)
      .join(' OR ');
    const query = `DELETE FROM ${table} WHERE ${conditions}`;
    const values = data.map((item) => item['id']);

    this.logger.log(`Executing query: ${query} with values: ${JSON.stringify(values)}`);
    try {
      await this.runQuery(query, values);
      this.logger.log(`Query executed successfully: ${query}`);
    } catch (err) {
      this.logger.error(`Error executing query: ${err.message}`);
      throw err;
    }
  }

  async search<T>(query: string): Promise<Record<string, T[]>> {
    const tables = await this.getTables();
    
    const searchResults: Record<string, T[]> = {};
    
    for (const table of tables) {
      const columns = await this.getColumns(table);
      const conditions = columns.map(col => `${col} LIKE ?`).join(' OR ');
      const values = columns.map(() => `%${query}%`);

      const sql = `SELECT * FROM ${table} WHERE ${conditions}`;
      const rows: T[] = await this.allQuery(sql, values);
      
      if (rows.length > 0)
        searchResults[table] = rows;
    }

    return searchResults;
  }

  private getTables(): Promise<string[]> {
    return new Promise((resolve, reject) => {
      this.db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, rows: any) => {
        if (err) reject(err);
        else resolve(rows.map(row => row.name));
      });
    });
  }
  
  private getColumns(table: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
      this.db.all(`PRAGMA table_info(${table})`, (err, rows: any) => {
        if (err) reject(err);
        else resolve(rows.map(row => row.name));
      });
    });
  }

}
