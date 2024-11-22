import { Firestore } from '@google-cloud/firestore';
import { DatabaseInterface } from './types';
import { Logger } from '../../utils/logger';

export class FirestoreDB implements DatabaseInterface {
  private firestore: Firestore;
  private logger: Logger;

  constructor(projectId: string, logs: boolean = false) {
    this.firestore = new Firestore({ projectId });
    this.logger = new Logger('FirestoreDB', logs);
    this.logger.log('Connected to Firestore database.');
  }

  async insert<T>(collection: string, data: T): Promise<string> {
    this.logger.log(`Inserting a document into collection "${collection}"...`);
    const docRef = await this.firestore.collection(collection).add(data);
    this.logger.log(`Document inserted into collection "${collection}". ID: ${docRef.id}`);
    return docRef.id;
  }

  async get<T>(collection: string, query: Partial<T> = {}): Promise<T[]> {
    this.logger.log(`Fetching documents from collection "${collection}" with query: ${JSON.stringify(query)}`);
    const snapshot = await this.firestore.collection(collection).get();

    const documents = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(doc => Object.keys(query).every(key => doc[key] === query[key]));

    this.logger.log(`Fetched ${documents.length} document(s) from collection "${collection}".`);
    return documents as T[];
  }

  async update<T>(collection: string, query: any, data: Partial<T>): Promise<void> {
    if (!query.id) throw new Error('Query must contain an ID field.');
    this.logger.log(`Updating document in collection "${collection}" with ID: "${query.id}"`);
    await this.firestore.collection(collection).doc(query.id).update(data);
    this.logger.log(`Document with ID "${query.id}" updated in collection "${collection}".`);
  }

  async delete(collection: string, query: any): Promise<void> {
    if (!query.id) throw new Error('Query must contain an ID field.');
    this.logger.log(`Deleting document from collection "${collection}" with ID: "${query.id}"`);
    await this.firestore.collection(collection).doc(query.id).delete();
    this.logger.log(`Document with ID "${query.id}" deleted from collection "${collection}".`);
  }

  async bulkInsert<T>(collection: string, data: T[]): Promise<void> {
    this.logger.log(`Performing bulk insert into collection "${collection}" with ${data.length} document(s).`);
    const batch = this.firestore.batch();

    data.forEach(item => {
      const docRef = this.firestore.collection(collection).doc();
      batch.set(docRef, item);
    });

    await batch.commit();
    this.logger.log(`Bulk insert completed for collection "${collection}".`);
  }

  async bulkUpdate<T>(collection: string, data: any): Promise<void> {
    this.logger.log(`Performing bulk update on collection "${collection}" with ${data.length} document(s).`);
    const batch = this.firestore.batch();

    data.forEach(({ id, ...updates }) => {
      const docRef = this.firestore.collection(collection).doc(id);
      batch.update(docRef, updates);
    });

    await batch.commit();
    this.logger.log(`Bulk update completed for collection "${collection}".`);
  }

  async bulkDelete(collection: string, data: any): Promise<void> {
    this.logger.log(`Performing bulk delete from collection "${collection}" with ${data.length} document(s).`);
    const batch = this.firestore.batch();

    data.forEach(({ id }) => {
      const docRef = this.firestore.collection(collection).doc(id);
      batch.delete(docRef);
    });

    await batch.commit();
    this.logger.log(`Bulk delete completed for collection "${collection}".`);
  }

  async search<T>(query: string): Promise<Record<string, T[]>> {
    this.logger.log(`Performing global search for query: "${query}" across all collections.`);
    const lowerCasedquery = query.toLowerCase();
    const results: Record<string, T[]> = {};
  
    const collections = await this.firestore.listCollections();
  
    for (const collection of collections) {
      this.logger.log(`Searching in collection: "${collection.id}"`);
      const snapshot = await collection.get();
      const collectionResults: T[] = [];
  
      snapshot.forEach(doc => {
        const data = doc.data();
        const matches = Object.values(data).some(value =>
          typeof value === 'string' && value.toLowerCase().includes(lowerCasedquery)
        );
  
        if (matches)
          collectionResults.push({ id: doc.id, ...data } as T);
      });
  
      if (collectionResults.length > 0)
        results[collection.id] = collectionResults;
    }
  
    this.logger.log(`Global search completed. Found results in ${Object.keys(results).length} collection(s).`);
    return results;
  }  
}
