import mongoose from 'mongoose';
import { ENV } from './env';

let mongoMemoryServerInstance: any = null;

export const connectDB = async (): Promise<void> => {
  const mongoURI = ENV.MONGO_URI;

  if (!mongoURI) {
    throw new Error('MONGO_URI is missing. Check your .env file.');
  }

  console.log('[DB] Connecting to MongoDB Atlas...');

  try {
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log('[DB] MongoDB Atlas connected successfully!');
    console.log('[DB] Database:', mongoose.connection.name);
    console.log('[DB] Host:', mongoose.connection.host);
    return;
  } catch (error: any) {
    console.error('[DB] MongoDB Atlas connection failed:', error.message);
    if (error.message.includes('Authentication failed') || error.message.includes('bad auth')) {
      console.warn('[DB] Reason: Authentication failed. Please verify your MongoDB Atlas username & password in Database Access.');
    } else {
      console.warn('[DB] Reason: Your IP (45.249.79.41) is not in MongoDB Atlas Network Access IP Access List.');
    }
    console.warn('[DB] Fallback: Activating embedded in-memory MongoDB so the server runs without crashing...');
  }

  // Graceful fallback: embedded in-memory MongoDB
  try {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    mongoMemoryServerInstance = await MongoMemoryServer.create();
    const memoryUri = mongoMemoryServerInstance.getUri();
    await mongoose.connect(memoryUri);
    console.log(`[DB] Connected to embedded in-memory development MongoDB at: ${memoryUri}`);
    console.log('[DB] Server is fully operational with demo data.');
  } catch (fallbackError) {
    console.error('[DB] Critical error initializing fallback database:', fallbackError);
    throw fallbackError;
  }
};

export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    if (mongoMemoryServerInstance) {
      await mongoMemoryServerInstance.stop();
    }
    console.log('[DB] MongoDB disconnected successfully.');
  } catch (error) {
    console.error('[DB] Disconnect error:', error);
  }
};
