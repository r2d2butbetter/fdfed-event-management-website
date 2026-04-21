// import db from '../connection.js';

// const createRegistrationTable = async () => {
//   await db.exec(`
//    CREATE TABLE IF NOT EXISTS Registration (
//        registrationId INTEGER PRIMARY KEY AUTOINCREMENT,
//        userId INTEGER NOT NULL,
//        eventId INTEGER NOT NULL,
//        registrationDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//        FOREIGN KEY (userId) REFERENCES User(userId) ON DELETE CASCADE,
//        FOREIGN KEY (eventId) REFERENCES Event(eventId) ON DELETE CASCADE,
//        UNIQUE(userId, eventId) -- To prevent duplicate registrations
//    );
//   `);
// };

// export default createRegistrationTable;


import mongoose from 'mongoose';

const RegistrationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
  registrationDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['active', 'cancelled'], default: 'active' },
  cancelledAt: { type: Date },
  refundAmount: { type: Number, default: 0 },
});

// --- Indexes ---
// User dashboard: fetch all registrations for a user sorted by date
RegistrationSchema.index({ userId: 1, registrationDate: -1 });
// Capacity queries & attendee counts: find all registrations for an event by status
RegistrationSchema.index({ eventId: 1, status: 1 });
// Analytics date-range filters: registrations for a set of events within a time window
RegistrationSchema.index({ eventId: 1, registrationDate: -1 });

const Registration = mongoose.model('Registration', RegistrationSchema);

export default Registration;
