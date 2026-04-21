/**
 * Test Suite: Auth Controller
 * Integration tests for signup, login, session check, and logout via Supertest.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createTestApp } from './testApp.js';
import User from '../models/user.js';
import bcrypt from 'bcrypt';

let app;

beforeEach(() => {
  app = createTestApp();
});

describe('POST /sign-up', () => {
  it('should register a new user with valid data', async () => {
    const res = await request(app)
      .post('/sign-up')
      .send({ email: 'new@test.com', name: 'New User', password1: 'pass123', password2: 'pass123' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe('new@test.com');
  });

  it('should return 400 when fields are missing', async () => {
    const res = await request(app)
      .post('/sign-up')
      .send({ email: 'only@email.com' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/All fields are required/i);
  });

  it('should return 400 when passwords do not match', async () => {
    const res = await request(app)
      .post('/sign-up')
      .send({ email: 'x@test.com', name: 'X', password1: 'abc', password2: 'xyz' });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/Passwords do not match/i);
  });

  it('should return 400 for duplicate email', async () => {
    // First signup
    await request(app)
      .post('/sign-up')
      .send({ email: 'dup@test.com', name: 'Dup', password1: 'pass', password2: 'pass' });

    // Duplicate
    const res = await request(app)
      .post('/sign-up')
      .send({ email: 'dup@test.com', name: 'Dup2', password1: 'pass', password2: 'pass' });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/already registered/i);
  });
});

describe('POST /login', () => {
  beforeEach(async () => {
    // Seed a user with a known password
    const hash = await bcrypt.hash('correct-password', 10);
    await User.create({ name: 'Login User', email: 'login@test.com', passwordHash: hash });
  });

  it('should login with correct credentials', async () => {
    const res = await request(app)
      .post('/login')
      .send({ email: 'login@test.com', password: 'correct-password' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe('login@test.com');
    expect(res.body.data.role).toBe('user');
  });

  it('should return 401 for wrong password', async () => {
    const res = await request(app)
      .post('/login')
      .send({ email: 'login@test.com', password: 'wrong-password' });

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/Invalid email or password/i);
  });

  it('should return 401 for non-existent email', async () => {
    const res = await request(app)
      .post('/login')
      .send({ email: 'nobody@test.com', password: 'anything' });

    expect(res.status).toBe(401);
  });
});

describe('GET /check-session', () => {
  it('should return isAuthenticated: false when not logged in', async () => {
    const res = await request(app).get('/check-session');

    expect(res.status).toBe(200);
    expect(res.body.isAuthenticated).toBe(false);
  });

  it('should return user data when session is active', async () => {
    const hash = await bcrypt.hash('pass123', 10);
    await User.create({ name: 'Session User', email: 'session@test.com', passwordHash: hash });

    // Use an agent to persist cookies across requests
    const agent = request.agent(app);

    // Login first to establish session
    await agent
      .post('/login')
      .send({ email: 'session@test.com', password: 'pass123' });

    // Check session
    const res = await agent.get('/check-session');

    expect(res.status).toBe(200);
    expect(res.body.isAuthenticated).toBe(true);
    expect(res.body.data.email).toBe('session@test.com');
  });
});

describe('GET /logout', () => {
  it('should return success even with no active session', async () => {
    const res = await request(app).get('/logout');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should clear session on logout', async () => {
    const hash = await bcrypt.hash('pass123', 10);
    await User.create({ name: 'Logout User', email: 'logout@test.com', passwordHash: hash });

    const agent = request.agent(app);
    await agent.post('/login').send({ email: 'logout@test.com', password: 'pass123' });

    // Logout
    const logoutRes = await agent.get('/logout');
    expect(logoutRes.status).toBe(200);

    // Session should be gone
    const sessionRes = await agent.get('/check-session');
    expect(sessionRes.body.isAuthenticated).toBe(false);
  });
});
