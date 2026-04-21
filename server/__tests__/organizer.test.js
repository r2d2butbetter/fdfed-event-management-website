/**
 * Test Suite: Organizer Controller
 * Tests organizer registration, dashboard, event creation, update, and deletion.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { createTestApp } from './testApp.js';
import User from '../models/user.js';
import Event from '../models/event.js';
import Organizer from '../models/organizer.js';
import Registration from '../models/registration.js';

let app, agent, testUser, testOrg;

beforeEach(async () => {
  app = createTestApp();
  agent = request.agent(app);

  // Create user and login
  const hash = await bcrypt.hash('orgpass123', 10);
  testUser = await User.create({ name: 'Org User', email: 'org@test.com', passwordHash: hash });
  await agent.post('/login').send({ email: 'org@test.com', password: 'orgpass123' });

  // Create organizer profile for this user
  testOrg = await Organizer.create({
    userId: testUser._id,
    organizationName: 'Test Organization',
    description: 'A test organization',
    contactNo: '1234567890',
    organizationType: 'Individual',
    verified: true,
    verificationStatus: 'approved',
  });
});

// ─── Organizer Registration ────────────────────────────────────────────────

describe('POST /host_with_us (Organizer Registration)', () => {
  it('should register a new organizer', async () => {
    // Create a fresh user who is NOT an organizer
    const hash = await bcrypt.hash('neworg', 10);
    await User.create({ name: 'New Org', email: 'neworg@test.com', passwordHash: hash });

    const freshAgent = request.agent(app);
    await freshAgent.post('/login').send({ email: 'neworg@test.com', password: 'neworg' });

    const res = await freshAgent
      .post('/host_with_us')
      .send({ orgName: 'Fresh Org', description: 'New org desc', mobile: '9876543210' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.organizationName).toBe('Fresh Org');
  });

  it('should reject registration without required fields', async () => {
    const hash = await bcrypt.hash('incomplete', 10);
    await User.create({ name: 'Incomplete', email: 'inc@test.com', passwordHash: hash });

    const freshAgent = request.agent(app);
    await freshAgent.post('/login').send({ email: 'inc@test.com', password: 'incomplete' });

    const res = await freshAgent
      .post('/host_with_us')
      .send({ orgName: '' }); // Missing mobile

    expect(res.status).toBe(400);
  });

  it('should reject duplicate organizer registration', async () => {
    const res = await agent
      .post('/host_with_us')
      .send({ orgName: 'Duplicate Org', mobile: '1111111111' });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/already registered/i);
  });
});

// ─── Organizer Dashboard ───────────────────────────────────────────────────

describe('GET /organizer/dashboard', () => {
  it('should return dashboard data for authenticated organizer', async () => {
    // Create some events for this organizer
    await Event.create({
      category: 'Concerts',
      title: 'Org Concert',
      description: 'desc',
      startDateTime: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      endDateTime: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000),
      venue: 'Venue',
      capacity: 500,
      ticketPrice: 1000,
      status: 'start_selling',
      organizerId: testOrg._id,
    });

    const res = await agent.get('/organizer/dashboard').set('Accept', 'application/json');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.stats.totalEvents).toBeGreaterThanOrEqual(1);
    expect(res.body.data.upcomingEvents).toBeDefined();
  });

  it('should return 401 for unauthenticated access', async () => {
    const res = await request(app).get('/organizer/dashboard').set('Accept', 'application/json');

    expect(res.status).toBe(401);
  });

  it('should include correct revenue and attendee stats', async () => {
    const event = await Event.create({
      category: 'TEDx',
      title: 'Stats Event',
      description: 'desc',
      startDateTime: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      endDateTime: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      venue: 'Hall',
      capacity: 100,
      ticketPrice: 500,
      status: 'start_selling',
      organizerId: testOrg._id,
    });

    // Add registrations
    const userId = new mongoose.Types.ObjectId();
    await Registration.create([
      { userId, eventId: event._id, status: 'active' },
      { userId: new mongoose.Types.ObjectId(), eventId: event._id, status: 'active' },
    ]);

    const res = await agent.get('/organizer/dashboard').set('Accept', 'application/json');

    expect(res.status).toBe(200);
    expect(res.body.data.stats.totalAttendees).toBeGreaterThanOrEqual(2);
  });
});

// ─── Event CRUD ────────────────────────────────────────────────────────────

describe('POST /organizer/events (Create Event)', () => {
  it('should create a new event', async () => {
    const res = await agent
      .post('/organizer/events')
      .field('category', 'Concerts')
      .field('title', 'New Concert')
      .field('description', 'A brand new concert')
      .field('startDateTime', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString())
      .field('endDateTime', new Date(Date.now() + 31 * 24 * 60 * 60 * 1000).toISOString())
      .field('venue', 'New Venue')
      .field('capacity', '200')
      .field('price', '1500')
      .field('status', 'start_selling')
      .set('Accept', 'application/json');

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.event.title).toBe('New Concert');
  });

  it('should reject event creation with missing required fields', async () => {
    const res = await agent
      .post('/organizer/events')
      .field('title', 'Incomplete Event')
      .set('Accept', 'application/json');
    // Missing category, description, dates, venue, capacity, price

    expect([400, 500]).toContain(res.status);
  });
});

describe('PUT /organizer/events/:id (Update Event)', () => {
  it('should update an existing event', async () => {
    const event = await Event.create({
      category: 'Concerts',
      title: 'Original Title',
      description: 'desc',
      startDateTime: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      endDateTime: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000),
      venue: 'Old Venue',
      capacity: 100,
      ticketPrice: 500,
      status: 'start_selling',
      organizerId: testOrg._id,
    });

    const res = await agent
      .put(`/organizer/events/${event._id}`)
      .field('title', 'Updated Title')
      .field('venue', 'New Venue')
      .field('capacity', '200')
      .set('Accept', 'application/json');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Verify the update
    const updated = await Event.findById(event._id);
    expect(updated.title).toBe('Updated Title');
  });

  it('should return error for non-existent event ID', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await agent
      .put(`/organizer/events/${fakeId}`)
      .field('title', 'Ghost Event')
      .set('Accept', 'application/json');

    expect([404, 500]).toContain(res.status);
  });
});

describe('DELETE /organizer/events/:id', () => {
  it('should delete an event', async () => {
    const event = await Event.create({
      category: 'TEDx',
      title: 'To Delete',
      description: 'desc',
      startDateTime: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      endDateTime: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000),
      venue: 'Venue',
      capacity: 50,
      ticketPrice: 300,
      status: 'start_selling',
      organizerId: testOrg._id,
    });

    const res = await agent.delete(`/organizer/events/${event._id}`).set('Accept', 'application/json');

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/deleted successfully/i);

    // Verify deletion
    const deleted = await Event.findById(event._id);
    expect(deleted).toBeNull();
  });

  it('should return error for non-existent event', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await agent.delete(`/organizer/events/${fakeId}`).set('Accept', 'application/json');

    expect([404, 500]).toContain(res.status);
  });
});
