import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Global setup/teardown for mongodb-memory-server
    setupFiles: ['./__tests__/setup.js'],
    // Generous timeout — first run downloads the MongoDB binary
    testTimeout: 30000,
    hookTimeout: 30000,
    // Run test files sequentially to avoid port/DB conflicts
    fileParallelism: false,
    // Reporter: console + HTML
    reporters: ['default', 'html'],
    outputFile: {
      html: './test-reports/index.html',
    },
  },
});
