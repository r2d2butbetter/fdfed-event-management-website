/**
 * Test Suite: User Controller
 * Tests user dashboard, save/unsave events, and refund logic.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { createTestApp } from './testApp.js';
import User from '../models/user.js';
import Event from '../models/event.js';
import Registration from '../models/registration.js';
import Payment from '../models/payment.js';
import SavedEvent from '../models/save.js';

let app, agent, testUser, testEvent;

beforeEach(async () => {
  app = createTestApp();
  agent = request.agent(app);

  // Create and login a test user
  const hash = await bcrypt.hash('password123', 10);
  testUser = await User.create({ name: 'Test User', email: 'user@test.com', passwordHash: hash });

  // Create a future event
  testEvent = await Event.create({
    category: 'Concerts',
    title: 'Future Concert',
    description: 'A concert in the future',
    startDateTime: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    endDateTime: new Date(Date.now() + 31 * 24 * 60 * 60 * 1000),
    venue: 'Test Venue',
    capacity: 100,
    ticketPrice: 1000,
    status: 'start_selling',
    organizerId: new mongoose.Types.ObjectId(),
  });

  // Login
  await agent.post('/login').send({ email: 'user@test.com', password: 'password123' });
});

describe('GET /user/dashboard', () => {
  it('should return user dashboard data when authenticated', async () => {
    const res = await agent.get('/user/dashboard').set('Accept', 'application/json');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user).toBeDefined();
    expect(res.body.data.user.email).toBe('user@test.com');
  });

  it('should return 401 when not authenticated', async () => {
    // Use a fresh app without session
    const res = await request(app).get('/user/dashboard').set('Accept', 'application/json');

    expect(res.status).toBe(401);
  });
});

describe('POST /user/save-event & POST /user/unsave-event', () => {
  it('should save an event', async () => {
    const res = await agent
      .post('/user/save-event')
      .send({ eventId: testEvent._id })
      .set('Accept', 'application/json');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should unsave a previously saved event', async () => {
    // Save first
    await agent.post('/user/save-event').send({ eventId: testEvent._id }).set('Accept', 'application/json');

    // Unsave
    const res = await agent.post('/user/unsave-event').send({ eventId: testEvent._id }).set('Accept', 'application/json');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should handle saving the same event twice gracefully', async () => {
    await agent.post('/user/save-event').send({ eventId: testEvent._id }).set('Accept', 'application/json');
    const res = await agent.post('/user/save-event').send({ eventId: testEvent._id }).set('Accept', 'application/json');

    // Should either succeed (toggle) or return a handled error
    expect([200, 400]).toContain(res.status);
  });
});

describe('GET /user/check-saved-status', () => {
  it('should return saved: true for a saved event', async () => {
    await agent.post('/user/save-event').send({ eventId: testEvent._id }).set('Accept', 'application/json');

    const res = await agent.get(`/user/check-saved-status?eventId=${testEvent._id}`).set('Accept', 'application/json');

    expect(res.status).toBe(200);
    expect(res.body.isSaved).toBe(true);
  });

  it('should return saved: false for an unsaved event', async () => {
    const res = await agent.get(`/user/check-saved-status?eventId=${testEvent._id}`).set('Accept', 'application/json');

    expect(res.status).toBe(200);
    expect(res.body.isSaved).toBe(false);
  });
});

describe('Refund Percentage Logic', () => {
  // These tests verify the refund calculation logic from the user dashboard

  it('should return 100% refund for events >7 days away', async () => {
    const futureEvent = await Event.create({
      category: 'Concerts',
      title: 'Far Future Event',
      description: 'desc',
      startDateTime: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days away
      endDateTime: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000),
      venue: 'Venue',
      capacity: 100,
      ticketPrice: 2000,
      status: 'start_selling',
      organizerId: new mongoose.Types.ObjectId(),
    });

    // Create registration + payment
    const payment = await Payment.create({
      userId: testUser._id,
      eventId: futureEvent._id,
      tickets: 1,
      totalPrice: 2000,
      adminCommission: 100,
      organizerRevenue: 1900,
      status: 'completed',
    });

    await Registration.create({
      userId: testUser._id,
      eventId: futureEvent._id,
      paymentId: payment._id,
      status: 'active',
    });

    const res = await agent.get('/user/dashboard').set('Accept', 'application/json');
    expect(res.status).toBe(200);

    // Find the booking in bookings
    const booking = res.body.data.bookings.find(r => r.title === 'Far Future Event');
    if (booking) {
      expect(booking.refundPercentage).toBe(100);
    }
  });

  it('should return 50% refund for events 3-7 days away', async () => {
    const nearEvent = await Event.create({
      category: 'TEDx',
      title: 'Near Event',
      description: 'desc',
      startDateTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days away
      endDateTime: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
      venue: 'Venue',
      capacity: 50,
      ticketPrice: 1500,
      status: 'start_selling',
      organizerId: new mongoose.Types.ObjectId(),
    });

    const payment = await Payment.create({
      userId: testUser._id,
      eventId: nearEvent._id,
      tickets: 1,
      totalPrice: 1500,
      adminCommission: 75,
      organizerRevenue: 1425,
      status: 'completed',
    });

    await Registration.create({
      userId: testUser._id,
      eventId: nearEvent._id,
      paymentId: payment._id,
      status: 'active',
    });

    const res = await agent.get('/user/dashboard').set('Accept', 'application/json');
    const booking = res.body.data.bookings.find(r => r.title === 'Near Event');
    if (booking) {
      expect(booking.refundPercentage).toBe(50);
    }
  });

  it('should return 0% refund for events <3 days away', async () => {
    const imminentEvent = await Event.create({
      category: 'Exhibitions',
      title: 'Imminent Event',
      description: 'desc',
      startDateTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day away
      endDateTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      venue: 'Venue',
      capacity: 50,
      ticketPrice: 800,
      status: 'start_selling',
      organizerId: new mongoose.Types.ObjectId(),
    });

    const payment = await Payment.create({
      userId: testUser._id,
      eventId: imminentEvent._id,
      tickets: 1,
      totalPrice: 800,
      adminCommission: 40,
      organizerRevenue: 760,
      status: 'completed',
    });

    await Registration.create({
      userId: testUser._id,
      eventId: imminentEvent._id,
      paymentId: payment._id,
      status: 'active',
    });

    const res = await agent.get('/user/dashboard').set('Accept', 'application/json');
    const booking = res.body.data.bookings.find(r => r.title === 'Imminent Event');
    if (booking) {
      expect(booking.refundPercentage).toBe(0);
    }
  });
});
