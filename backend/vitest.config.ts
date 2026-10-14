import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.ts'],
    testTimeout: 30_000,
    hookTimeout: 180_000, // first run downloads a MongoDB binary for mongodb-memory-server
    pool: 'forks',
    fileParallelism: false,
  },
});
