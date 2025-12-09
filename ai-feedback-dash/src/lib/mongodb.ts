import { MongoClient, MongoClientOptions, Collection } from 'mongodb';

const uri = process.env.MONGODB_URI;
const options: MongoClientOptions = {};

let clientPromise: Promise<MongoClient> | null = null;

function getClientPromise(): Promise<MongoClient> {
  if (!uri) {
    throw new Error('Please define the MONGODB_URI environment variable');
  }

  if (clientPromise) {
    return clientPromise;
  }

  if (process.env.NODE_ENV === 'development') {
    // In development mode, use a global variable to preserve the connection across module reloads.
    const globalWithMongo = global as typeof globalThis & {
      _mongoClientPromise?: Promise<MongoClient>;
    };

    if (!globalWithMongo._mongoClientPromise) {
      const client = new MongoClient(uri, options);
      globalWithMongo._mongoClientPromise = client.connect();
      console.log('Created new MongoDB connection');
    }
    clientPromise = globalWithMongo._mongoClientPromise!;
  } else {
    // In production mode, it's best to not use a global variable.
    const client = new MongoClient(uri, options);
    clientPromise = client.connect();
    console.log('Created production MongoDB connection');
  }

  return clientPromise;
}

export async function getCollection<T>(collectionName: string): Promise<Collection<T>> {
  try {
    const client = await getClientPromise();
    return client.db('ai-feedback-db').collection<T>(collectionName);
  } catch (error) {
    console.error('Error getting MongoDB collection:', error);
    throw new Error('Failed to connect to database');
  }
}

export default getClientPromise;
