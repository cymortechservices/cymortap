import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import { createApp } from '../src/app';
import { syncAllIndexes } from '../src/config/db';

let mongod: MongoMemoryServer | undefined;

export async function startDb() {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
  await syncAllIndexes();
}

export async function stopDb() {
  await mongoose.disconnect();
  await mongod?.stop();
}

export async function clearDb() {
  const collections = await mongoose.connection.db!.collections();
  await Promise.all(collections.map((c) => c.deleteMany({})));
}

export const DESKTOP_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';
export const MOBILE_UA = 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Mobile Safari/537.36';
export const BOT_UA = 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uahtml)';

export const app = createApp();
export const CSRF = { 'X-Requested-With': 'cymor-tap' };

export const validLink = (over: Record<string, unknown> = {}) => ({
  country: 'KE',
  phone: '0712345678',
  message: 'Hi there! I want to order Air Force 1 shoes.',
  ...over,
});

export async function registerAgent(email = 'amina@example.com') {
  const agent = request.agent(app);
  const res = await agent.post('/api/v1/auth/register').set(CSRF).send({ email, password: 'correct-horse-battery', displayName: 'Amina' });
  return { agent, res };
}
