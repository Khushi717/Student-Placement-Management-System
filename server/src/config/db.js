import mongoose from 'mongoose';
import { env } from './env.js';

export async function connectDB(uri = env.mongoUri) {
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
  // Make sure unique/compound indexes (e.g. one application per student+job) exist.
  await mongoose.syncIndexes();
  return mongoose.connection;
}

export async function disconnectDB() {
  await mongoose.disconnect();
}
