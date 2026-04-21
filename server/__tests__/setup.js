/**
 * Global test setup — starts an in-memory MongoDB server before all tests
 * and tears it down after all tests complete.
 */
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { beforeAll, afterAll, afterEach } from 'vitest';

let mongoServer;

beforeAll(async () => {
  // Start in-memory MongoDB
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  // Connect mongoose to the in-memory server
  await mongoose.connect(uri);
});

afterEach(async () => {
  // Clear all collections between tests for isolation
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  // Disconnect and stop the in-memory server
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});
