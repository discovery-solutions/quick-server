import { Config } from '../../types';
import { FirestoreDB } from './firestore';
import { InMemoryDB } from './in-memory';
import { MongoDB } from './mongodb';
import { MySqlDB } from './mysql';
import { PostgresDb } from './postgresql';
import { SqliteDB } from './sqlite';
import { DatabaseInterface } from './types';

export * from './types';

export class Database {
  private static instance: Database | null = null;
  private databases: Map<string, DatabaseInterface> = new Map();

  private constructor(config: Config['databases']) {
    for (const { key, type, logs, ...params } of config) {
      switch (type) {
        case 'in-memory':
          this.databases.set(key, new InMemoryDB(logs));
          break;
        case 'mongodb':
          this.databases.set(key, new MongoDB(params.uri, params.name, logs));
          break;
        case 'mysql':
          this.databases.set(key, new MySqlDB(params, logs));
          break;
        case 'postgresql':
          this.databases.set(key, new PostgresDb(params.uri, logs));
          break;
        case 'sqlite':
          this.databases.set(key, new SqliteDB(params.uri, logs));
          break;
        case 'firestore':
          this.databases.set(key, new FirestoreDB(params.uri, logs));
          break;
        default:
          throw new Error(`Database type ${type} not supported`);
      }
    }
  }

  public static initialize(config: Config['databases']) {
    if (!Database.instance)
      Database.instance = new Database(config);
    
    return Database.instance;
  }

  public static get(name: string): DatabaseInterface | undefined {
    if (!Database.instance)
      throw new Error('Database not initialized. Call Database.initialize(config) first.');

    return Database.instance.databases.get(name);
  }
}
