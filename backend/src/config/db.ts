import mongoose from 'mongoose';
import { env } from './env';
import { logger } from '../utils/logger';

export async function connectDb(uri = env.mongodbUri) {
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10_000 });
  logger.info('MongoDB connected');
}

export async function syncAllIndexes() {
  const { User, Session, PasswordReset, Link, ClickEvent, Report } = await import('../models');
  for (const m of [User, Session, PasswordReset, Link, ClickEvent, Report]) {
    await m.syncIndexes();
  }
}
