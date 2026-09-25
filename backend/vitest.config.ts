import dotenv from 'dotenv';
import { defineConfig } from 'vitest/config';

const testEnv = dotenv.config({ path: '.env.test' }).parsed ?? {};

export default defineConfig({
  test: {
    environment: 'node',
    globalSetup: ['./tests/global-setup.ts'],
    setupFiles: ['./tests/setup.ts'],
    fileParallelism: false,
    testTimeout: 30000,
    hookTimeout: 30000,
    env: { NODE_ENV: 'test', ...testEnv },
  },
});
