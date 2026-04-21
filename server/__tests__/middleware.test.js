/**
 * Test Suite: Middleware
 * Tests isAuth, optionalAuth, errorHandler, and handle404.
 */
import { describe, it, expect, vi } from 'vitest';
import mongoose from 'mongoose';
import User from '../models/user.js';
import { isAuth, optionalAuth } from '../middlewares/auth.js';
import { handle404, errorHandler } from '../middlewares/errorHandler.js';

// Helper to create mock req/res/next
function mockReqResNext(overrides = {}) {
  const req = {
    session: {},
    cookies: {},
    xhr: false,
    headers: { accept: 'application/json' },
    path: '/api/test',
    ...overrides,
  };
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    redirect: vi.fn().mockReturnThis(),
    locals: {},
  };
  const next = vi.fn();
  return { req, res, next };
}

describe('isAuth Middleware', () => {
  it('should return 401 when no session userId exists', async () => {
    const { req, res, next } = mockReqResNext({ session: {} });

    await isAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, message: expect.stringContaining('Authentication required') })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 when session userId does not match any user', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const { req, res, next } = mockReqResNext({ session: { userId: fakeId } });

    await isAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('should call next() and attach user when session is valid', async () => {
    // Create a real user in the in-memory DB
    const user = await User.create({ name: 'Auth Test', email: 'auth@test.com', passwordHash: 'hash123' });
    const { req, res, next } = mockReqResNext({ session: { userId: user._id } });

    await isAuth(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toBeDefined();
    expect(req.user.email).toBe('auth@test.com');
    expect(res.locals.isAuth).toBe(true);
  });
});

describe('optionalAuth Middleware', () => {
  it('should call next() even without authentication', async () => {
    const { req, res, next } = mockReqResNext({ cookies: {} });

    await optionalAuth(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.locals.isAuth).toBe(false);
  });

  it('should not block the request on errors', async () => {
    // Pass invalid cookie to trigger a potential error path
    const { req, res, next } = mockReqResNext({ cookies: { uid: 'invalid-session-id' } });

    await optionalAuth(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});

describe('handle404', () => {
  it('should return 404 with JSON error', () => {
    const { req, res } = mockReqResNext();

    handle404(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, message: 'Page not found' })
    );
  });
});

describe('errorHandler', () => {
  it('should return 500 by default with error message', () => {
    const err = new Error('Something broke');
    const { req, res, next } = mockReqResNext();
    // Suppress console.error in test output
    vi.spyOn(console, 'error').mockImplementation(() => {});

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({ code: 500, message: 'Something broke' })
      })
    );
    console.error.mockRestore();
  });

  it('should use custom statusCode from the error object', () => {
    const err = new Error('Not Found');
    err.statusCode = 404;
    const { req, res, next } = mockReqResNext();
    vi.spyOn(console, 'error').mockImplementation(() => {});

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    console.error.mockRestore();
  });
});
