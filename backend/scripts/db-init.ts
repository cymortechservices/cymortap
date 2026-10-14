/* Creates or updates all MongoDB indexes. Run once after setting MONGODB_URI: npm run db:init */
import mongoose from 'mongoose';
import { connectDb, syncAllIndexes } from '../src/config/db';

(async () => {
  await connectDb();
  await syncAllIndexes();
  console.log('Indexes are in sync.');
  await mongoose.disconnect();
})().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
