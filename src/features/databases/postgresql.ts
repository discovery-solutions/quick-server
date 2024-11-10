import { DatabaseInterface } from './types';
import { Pool } from 'pg';

export class PostgresDb implements DatabaseInterface {
  private pool: Pool;

  constructor(connectionString: string) {
    this.pool = new Pool({ connectionString });
  }

  async insert<T>(table: string, data: T): Promise<void> {
    const keys = Object.keys(data).join(',');
    const values = Object.values(data);
    const placeholders = values.map((_, i) => `$${i + 1}`).join(',');

    const query = `INSERT INTO ${table} (${keys}) VALUES (${placeholders})`;
    await this.pool.query(query, values);
  }

  async get<T>(table: string, query: object): Promise<T[]> {
    const keys = Object.keys(query);
    const values = Object.values(query);
    const conditions = keys.map((key, i) => `${key} = $${i + 1}`).join(' AND ');

    const result = await this.pool.query(`SELECT * FROM ${table} WHERE ${conditions}`, values);
    return result.rows;
  }

  async update<T>(table: string, query: object, data: T): Promise<void> {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const setClauses = keys.map((key, i) => `${key} = $${i + 1}`).join(',');

    const conditionKeys = Object.keys(query);
    const conditionValues = Object.values(query);
    const whereClauses = conditionKeys.map((key, i) => `${key} = $${i + keys.length + 1}`).join(' AND ');

    const queryText = `UPDATE ${table} SET ${setClauses} WHERE ${whereClauses}`;
    await this.pool.query(queryText, [...values, ...conditionValues]);
  }

  async delete(table: string, query: object): Promise<void> {
    const keys = Object.keys(query);
    const values = Object.values(query);
    const conditions = keys.map((key, i) => `${key} = $${i + 1}`).join(' AND ');

    await this.pool.query(`DELETE FROM ${table} WHERE ${conditions}`, values);
  }

  async bulkInsert<T>(table: string, data: T[]): Promise<void> {
    const keys = Object.keys(data[0]);
    const values = data.map(item => Object.values(item));
    const valuePlaceholders = values.map((_, i) => `(${keys.map((_, j) => `$${i * keys.length + j + 1}`).join(',')})`).join(',');

    const queryText = `INSERT INTO ${table} (${keys.join(',')}) VALUES ${valuePlaceholders}`;
    const flatValues = values.flat();
    await this.pool.query(queryText, flatValues);
  }

  async bulkUpdate<T>(table: string, data: T[]): Promise<void> {
    const keys = Object.keys(data[0]);
    const values = data.map(item => Object.values(item));
    const valuePlaceholders = values.map((_, i) => `(${keys.map((_, j) => `$${i * keys.length + j + 1}`).join(',')})`).join(',');

    const queryText = `UPDATE ${table} SET ${keys.map(key => `${key} = ?`).join(', ')} WHERE id = ?`;
    const flatValues = values.flat();
    await this.pool.query(queryText, flatValues);
  }

  async bulkDelete<T>(table: string, data: T[]): Promise<void> {
    const ids = data.map(item => item['id']);
    await this.pool.query(
      `DELETE FROM ${table} WHERE id = ANY($1)`,
      [ids]
    );
  }
}
