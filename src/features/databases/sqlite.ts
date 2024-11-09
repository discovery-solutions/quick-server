// src/databases/sqliteDb.ts

import { Database } from './index';
import sqlite3 from 'sqlite3';

export class SqliteDB implements Database {
  private db: sqlite3.Database;

  constructor(dbFile: string) {
    this.db = new sqlite3.Database(dbFile);
  }

  async insert<T>(table: string, data: T): Promise<void> {
    return new Promise((resolve, reject) => {
      const placeholders = Object.values(data).map(() => '?').join(',');
      const query = `INSERT INTO ${table} (${Object.keys(data).join(',')}) VALUES (${placeholders})`;

      this.db.run(query, Object.values(data), function (err) {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  async get<T>(table: string, query: object): Promise<T[]> {
    return new Promise((resolve, reject) => {
      const conditions = Object.keys(query)
        .map((key, i) => `${key} = ?`)
        .join(' AND ');
      const sql = `SELECT * FROM ${table} WHERE ${conditions}`;

      this.db.all(sql, Object.values(query), (err, rows: any) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  async update<T>(table: string, query: object, data: T): Promise<void> {
    return new Promise((resolve, reject) => {
      const setClause = Object.keys(data)
        .map((key) => `${key} = ?`)
        .join(',');
      const conditions = Object.keys(query)
        .map((key) => `${key} = ?`)
        .join(' AND ');

      const sql = `UPDATE ${table} SET ${setClause} WHERE ${conditions}`;
      this.db.run(sql, [...Object.values(data), ...Object.values(query)], function (err) {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  async delete(table: string, query: object): Promise<void> {
    return new Promise((resolve, reject) => {
      const conditions = Object.keys(query)
        .map((key) => `${key} = ?`)
        .join(' AND ');
      const sql = `DELETE FROM ${table} WHERE ${conditions}`;

      this.db.run(sql, Object.values(query), function (err) {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  async bulkInsert<T>(table: string, data: T[]): Promise<void> {
    return new Promise((resolve, reject) => {
      const placeholders = data
        .map((_) => `(${Object.keys(data[0]).map(() => '?').join(',')})`)
        .join(',');
      const query = `INSERT INTO ${table} (${Object.keys(data[0]).join(',')}) VALUES ${placeholders}`;

      const values = data.flatMap((item) => Object.values(item));

      this.db.run(query, values, function (err) {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}
