/**
 * Test Suite: Model Validation
 * Tests Mongoose schema constraints for all core models.
 */
import { describe, it, expect } from 'vitest';
import mongoose from 'mongoose';
import User from '../models/user.js';
import Event from '../models/event.js';
import Registration from '../models/registration.js';
import Payment from '../models/payment.js';
import SavedEvent from '../models/save.js';
import Organizer from '../models/organizer.js';

describe('User Model', () => {
  it('should create a user with valid data', async () => {
    const user = await User.create({
      name: 'John Doe',
      email: 'john@example.com',
      passwordHash: 'hashedpassword123',
    });
    expect(user._id).toBeDefined();
    expect(user.name).toBe('John Doe');
    expect(user.email).toBe('john@example.com');
  });

  it('should fail without required fields', async () => {
    await expect(User.create({})).rejects.toThrow();
  });

  it('should have default notification preferences', async () => {
    const user = await User.create({
      name: 'Pref User',
      email: 'prefs@example.com',
      passwordHash: 'hash',
    });
    expect(user.notificationPreferences).toBeDefined();
    expect(user.notificationPreferences.emailUpdates).toBe(true);
  });
});

describe('Event Model', () => {
  it('should create an event with valid data', async () => {
    const orgId = new mongoose.Types.ObjectId();
    const event = await Event.create({
      category: 'Concerts',
      title: 'Test Concert',
      description: 'A test concert event',
      startDateTime: new Date('2026-06-01'),
      endDateTime: new Date('2026-06-02'),
      venue: 'Test Venue',
      capacity: 100,
      ticketPrice: 500,
      organizerId: orgId,
    });
    expect(event._id).toBeDefined();
    expect(event.status).toBe('start_selling'); // default
  });



  it('should fail with invalid status enum', async () => {
    const orgId = new mongoose.Types.ObjectId();
    await expect(
      Event.create({
        category: 'Concerts',
        title: 'Bad Status',
        description: 'desc',
        startDateTime: new Date(),
        endDateTime: new Date(),
        venue: 'Venue',
        capacity: 10,
        ticketPrice: 100,
        organizerId: orgId,
        status: 'invalid_status',
      })
    ).rejects.toThrow();
  });

  it('should exclude embedding field by default (select: false)', async () => {
    const orgId = new mongoose.Types.ObjectId();
    await Event.create({
      category: 'Concerts',
      title: 'Embedding Test',
      description: 'desc',
      startDateTime: new Date(),
      endDateTime: new Date(),
      venue: 'Venue',
      capacity: 10,
      ticketPrice: 100,
      organizerId: orgId,
      embedding: [0.1, 0.2, 0.3],
    });

    const found = await Event.findOne({ title: 'Embedding Test' });
    expect(found.embedding).toBeUndefined();

    // But can be explicitly selected
    const withEmbed = await Event.findOne({ title: 'Embedding Test' }).select('+embedding');
    expect(withEmbed.embedding).toHaveLength(3);
  });
});

describe('Registration Model', () => {
  it('should create a registration with defaults', async () => {
    const reg = await Registration.create({
      userId: new mongoose.Types.ObjectId(),
      eventId: new mongoose.Types.ObjectId(),
    });
    expect(reg.status).toBe('active');
    expect(reg.refundAmount).toBe(0);
    expect(reg.registrationDate).toBeDefined();
  });

  it('should only accept valid status enum', async () => {
    await expect(
      Registration.create({
        userId: new mongoose.Types.ObjectId(),
        eventId: new mongoose.Types.ObjectId(),
        status: 'invalid',
      })
    ).rejects.toThrow();
  });
});

describe('Payment Model', () => {
  it('should create a payment with required fields', async () => {
    const payment = await Payment.create({
      userId: new mongoose.Types.ObjectId(),
      eventId: new mongoose.Types.ObjectId(),
      tickets: 2,
      totalPrice: 1000,
      adminCommission: 50,
      organizerRevenue: 950,
    });
    expect(payment.status).toBe('pending'); // default
    expect(payment.gateway).toBe('razorpay'); // default
  });

  it('should only accept valid status enum', async () => {
    await expect(
      Payment.create({
        userId: new mongoose.Types.ObjectId(),
        eventId: new mongoose.Types.ObjectId(),
        tickets: 1,
        totalPrice: 100,
        adminCommission: 5,
        organizerRevenue: 95,
        status: 'invalid_status',
      })
    ).rejects.toThrow();
  });
});

describe('SavedEvent Model', () => {
  it('should create a saved event', async () => {
    const saved = await SavedEvent.create({
      userId: new mongoose.Types.ObjectId(),
      eventId: new mongoose.Types.ObjectId(),
    });
    expect(saved.savedDate).toBeDefined();
  });

  it('should enforce unique (userId, eventId) compound index', async () => {
    const userId = new mongoose.Types.ObjectId();
    const eventId = new mongoose.Types.ObjectId();

    await SavedEvent.create({ userId, eventId });

    // Duplicate should fail
    await expect(SavedEvent.create({ userId, eventId })).rejects.toThrow();
  });
});

describe('Organizer Model', () => {
  it('should create an organizer with required fields', async () => {
    const org = await Organizer.create({
      userId: new mongoose.Types.ObjectId(),
      organizationName: 'Test Org',
      contactNo: '9999999999',
      organizationType: 'Individual',
    });
    expect(org.verified).toBe(false); // default
    expect(org.verificationStatus).toBe('not_submitted'); // default
  });

  it('should enforce unique userId', async () => {
    const userId = new mongoose.Types.ObjectId();
    await Organizer.create({
      userId,
      organizationName: 'Org 1',
      contactNo: '1111',
      organizationType: 'Individual',
    });

    await expect(
      Organizer.create({
        userId,
        organizationName: 'Org 2',
        contactNo: '2222',
        organizationType: 'Individual',
      })
    ).rejects.toThrow();
  });
});
