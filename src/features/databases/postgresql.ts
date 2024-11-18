import { DatabaseInterface } from './types';
import { Pool } from 'pg';
import { Logger } from '../../utils/logger';

export class PostgresDb implements DatabaseInterface {
  private pool: Pool;
  private logger: Logger;

  constructor(connectionString: string, logs: boolean = false) {
    this.logger = new Logger('PostgresDb', logs);
    this.pool = new Pool({ connectionString });
    this.logger.log('Connected to PostgreSQL database.');
  }

  async insert<T>(table: string, data: T): Promise<string> {
    this.logger.log(`Inserting a record into table "${table}"...`);
    const keys = Object.keys(data).join(',');
    const values = Object.values(data);
    const placeholders = values.map((_, i) => `$${i + 1}`).join(',');

    const query = `INSERT INTO ${table} (${keys}) VALUES (${placeholders})`;
    const { rows } = await this.pool.query(query, values);
    this.logger.log(`Record inserted into table "${table}". Data: ${JSON.stringify(data)}`);
    return rows[0].id;
  }

  async get<T>(table: string, query: object): Promise<T[]> {
    this.logger.log(`Fetching records from table "${table}" with query: ${JSON.stringify(query)}`);
    const keys = Object.keys(query);
    const values = Object.values(query);
    const conditions = keys.map((key, i) => `${key} = $${i + 1}`).join(' AND ');

    const result = await this.pool.query(`SELECT * FROM ${table} WHERE ${conditions}`, values);
    this.logger.log(`Fetched ${result.rows.length} record(s) from table "${table}".`);
    return result.rows;
  }

  async update<T>(table: string, query: object, data: T): Promise<void> {
    this.logger.log(`Updating records in table "${table}" with query: ${JSON.stringify(query)} and data: ${JSON.stringify(data)}`);
    const keys = Object.keys(data);
    const values = Object.values(data);
    const setClauses = keys.map((key, i) => `${key} = $${i + 1}`).join(',');

    const conditionKeys = Object.keys(query);
    const conditionValues = Object.values(query);
    const whereClauses = conditionKeys.map((key, i) => `${key} = $${i + keys.length + 1}`).join(' AND ');

    const queryText = `UPDATE ${table} SET ${setClauses} WHERE ${whereClauses}`;
    await this.pool.query(queryText, [...values, ...conditionValues]);
    this.logger.log(`Records updated in table "${table}".`);
  }

  async delete(table: string, query: object): Promise<void> {
    this.logger.log(`Deleting records from table "${table}" with query: ${JSON.stringify(query)}`);
    const keys = Object.keys(query);
    const values = Object.values(query);
    const conditions = keys.map((key, i) => `${key} = $${i + 1}`).join(' AND ');

    await this.pool.query(`DELETE FROM ${table} WHERE ${conditions}`, values);
    this.logger.log(`Deleted records from table "${table}".`);
  }

  async bulkInsert<T>(table: string, data: T[]): Promise<void> {
    this.logger.log(`Performing bulk insert into table "${table}" with ${data.length} record(s).`);
    const keys = Object.keys(data[0]);
    const values = data.map(item => Object.values(item));
    const valuePlaceholders = values
      .map((_, i) => `(${keys.map((_, j) => `$${i * keys.length + j + 1}`).join(',')})`)
      .join(',');

    const queryText = `INSERT INTO ${table} (${keys.join(',')}) VALUES ${valuePlaceholders}`;
    const flatValues = values.flat();
    await this.pool.query(queryText, flatValues);
    this.logger.log(`Bulk insert completed into table "${table}".`);
  }

  async bulkUpdate<T>(table: string, data: T[]): Promise<void> {
    this.logger.log(`Performing bulk update on table "${table}" with ${data.length} record(s).`);
    const keys = Object.keys(data[0]);
    const values = data.map(item => Object.values(item));
    const valuePlaceholders = values
      .map((_, i) => `(${keys.map((_, j) => `$${i * keys.length + j + 1}`).join(',')})`)
      .join(',');

    const queryText = `UPDATE ${table} SET ${keys.map(key => `${key} = ?`).join(', ')} WHERE id = ?`;
    const flatValues = values.flat();
    await this.pool.query(queryText, flatValues);
    this.logger.log(`Bulk update completed on table "${table}".`);
  }

  async bulkDelete<T>(table: string, data: T[]): Promise<void> {
    this.logger.log(`Performing bulk delete from table "${table}" with ${data.length} record(s).`);
    const ids = data.map(item => item['id']);
    await this.pool.query(
      `DELETE FROM ${table} WHERE id = ANY($1)`,
      [ids]
    );
    this.logger.log(`Bulk delete completed from table "${table}".`);
  }

  async search<T>(query: string): Promise<Record<string, T[]>> {
    this.logger.log(`Starting global search with query: ${query}`);

    const tablesResult = await this.pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);

    const tables = tablesResult.rows.map(row => row.table_name);
    const results: Record<string, T[]> = {};
    
    for (const table of tables) {
      const columnsResult = await this.pool.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = $1
      `, [table]);

      const columns = columnsResult.rows.map(row => row.column_name);

      const whereClause = columns
        .map((column, index) => `${column} ILIKE $${index + 1}`)
        .join(' OR ');

      if (whereClause) {
        const values = columns.map(() => `%${query}%`);
        const queryText = `SELECT * FROM ${table} WHERE ${whereClause}`;

        const result = await this.pool.query(queryText, values);

        if (result.rows.length > 0)
          results[table] = result.rows as T[];
      }
    }

    this.logger.log(`Global search completed. Found ${results.length} table(s) with matches.`);
    return results;
  }

}
