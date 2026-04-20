/**
 * Test Suite: Event Controller
 * Integration tests for event listing, filtering, and retrieval.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { createTestApp } from './testApp.js';
import Event from '../models/event.js';

let app;
const orgId = new mongoose.Types.ObjectId();

beforeEach(async () => {
  app = createTestApp();

  // Seed test events
  await Event.create([
    {
      category: 'Concerts',
      title: 'Rock Night',
      description: 'Live rock music',
      startDateTime: new Date('2026-08-01'),
      endDateTime: new Date('2026-08-02'),
      venue: 'Stadium A',
      capacity: 5000,
      ticketPrice: 999,
      status: 'start_selling',
      organizerId: orgId,
    },
    {
      category: 'TEDx',
      title: 'Ideas Worth Spreading',
      description: 'Inspiring talks',
      startDateTime: new Date('2026-09-15'),
      endDateTime: new Date('2026-09-15'),
      venue: 'Hall B',
      capacity: 300,
      ticketPrice: 1500,
      status: 'start_selling',
      organizerId: orgId,
    },
    {
      category: 'Concerts',
      title: 'Jazz Evening',
      description: 'Smooth jazz',
      startDateTime: new Date('2026-07-20'),
      endDateTime: new Date('2026-07-20'),
      venue: 'Lounge C',
      capacity: 100,
      ticketPrice: 750,
      status: 'upcoming',
      organizerId: orgId,
    },
    {
      category: 'Exhibitions',
      title: 'Old Art Show',
      description: 'Past exhibition',
      startDateTime: new Date('2024-01-01'),
      endDateTime: new Date('2024-01-02'),
      venue: 'Gallery D',
      capacity: 200,
      ticketPrice: 400,
      status: 'over',
      organizerId: orgId,
    },
  ]);
});

describe('GET /events', () => {
  it('should return selling and upcoming events', async () => {
    const res = await request(app).get('/events');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    // Should return selling events section
    expect(res.body.data.selling).toBeDefined();
  });

  it('should filter events by category (exact match)', async () => {
    const res = await request(app).get('/events?category=Concerts');

    expect(res.status).toBe(200);
    // All returned selling events should be Concerts
    if (res.body.data.selling?.events?.length > 0) {
      res.body.data.selling.events.forEach(event => {
        expect(event.category).toBe('Concerts');
      });
    }
  });

  it('should return empty for non-existent category', async () => {
    const res = await request(app).get('/events?category=Nonexistent');

    expect(res.status).toBe(200);
    expect(res.body.data.selling?.events || []).toHaveLength(0);
  });
});

describe('GET /events/:id', () => {
  it('should return a single event by ID', async () => {
    const event = await Event.findOne({ title: 'Rock Night' });

    const res = await request(app).get(`/events/${event._id}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.event.title).toBe('Rock Night');
  });

  it('should return 404 for invalid event ID', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).get(`/events/${fakeId}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('should not include embedding field in response', async () => {
    const event = await Event.findOne({ title: 'Rock Night' });
    const res = await request(app).get(`/events/${event._id}`);

    expect(res.body.data.event.embedding).toBeUndefined();
  });
});

describe('GET /events/category/:category', () => {
  it('should return events for a valid category', async () => {
    const res = await request(app).get('/events/category/Concerts');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.events.length).toBeGreaterThanOrEqual(1);
    res.body.data.events.forEach(event => {
      expect(event.category).toBe('Concerts');
    });
  });

  it('should return empty array for category with no events', async () => {
    const res = await request(app).get('/events/category/Health Camp');

    expect(res.status).toBe(200);
    expect(res.body.data.events).toHaveLength(0);
  });
});
