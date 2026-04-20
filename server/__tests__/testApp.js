/**
 * Lightweight Express app for testing via Supertest.
 * Mirrors the real app's middleware and routes but skips
 * MongoStore session, Morgan logging, Helmet, and the DB connection
 * (handled by setup.js's in-memory MongoDB).
 */
import express from 'express';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import methodOverride from 'method-override';

import authRouter from '../routes/authentication.js';
import eventRouter from '../routes/event.js';
import userRouter from '../routes/user.js';
import organizerRouter from '../routes/organizer.js';
import { handle404, errorHandler } from '../middlewares/errorHandler.js';

export function createTestApp() {
  const app = express();

  // Body parsing
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(methodOverride('_method'));

  // Simple in-memory session (no MongoStore needed for tests)
  app.use(
    session({
      secret: 'test-secret',
      resave: false,
      saveUninitialized: false,
      cookie: { maxAge: 1000 * 60 * 60, httpOnly: true, secure: false },
    })
  );

  // Mount routes
  app.use('/', authRouter);
  app.use('/events', eventRouter);
  app.use('/user', userRouter);
  app.use('/organizer', organizerRouter);

  // Error handling
  app.use(handle404);
  app.use(errorHandler);

  return app;
}
