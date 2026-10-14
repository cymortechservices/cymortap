import mongoose from 'mongoose';
import { createApp } from './app';
import { connectDb } from './config/db';
import { env } from './config/env';
import { logger } from './utils/logger';

async function main() {
  await connectDb();
  const app = createApp();
  const server = app.listen(env.port, () => {
    logger.info('CYMOR TAP API listening', { port: env.port, env: env.nodeEnv, shortLinkBaseUrl: env.shortLinkBaseUrl });
  });

  const shutdown = (signal: string) => {
    logger.info('Shutting down', { signal });
    server.close(async () => {
      await mongoose.disconnect();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10_000).unref();
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

main().catch((err) => {
  logger.error('Failed to start', { err: err instanceof Error ? err : String(err) });
  process.exit(1);
});
