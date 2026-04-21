// import db from '../connection.js';

// const createOrganizerTable = async () => {
//   await db.exec(`
//     CREATE TABLE IF NOT EXISTS Organizer (
//       organizerId INTEGER PRIMARY KEY AUTOINCREMENT,
//       userId INTEGER NOT NULL,
//       organizationName TEXT NOT NULL,
//       description TEXT,
//       contactNo TEXT NOT NULL,
//       verified BOOLEAN DEFAULT 0,
//       FOREIGN KEY (userId) REFERENCES User(userId) ON DELETE CASCADE
//     );
//   `);
// };

// export default createOrganizerTable;


import mongoose from 'mongoose';

const OrganizerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  organizationName: { type: String, required: true },
  description: { type: String },
  contactNo: { type: String, required: true },

  // Common organization profile / verification-related details
  orgType: {
    type: String,
    enum: [
      'Individual',
      'Company',
      'NGO',
      'College/University',
      'Government',
      'Hospital',
      'Clinic',
      'Event Company',
      'Artist Management',
    ],
  },
  registeredAddress: {
    line1: { type: String },
    line2: { type: String },
    city: { type: String },
    state: { type: String },
    postalCode: { type: String },
    country: { type: String },
  },
  website: { type: String },
  socialLinks: {
    facebook: { type: String },
    instagram: { type: String },
    twitter: { type: String },
    linkedin: { type: String },
    youtube: { type: String },
  },
  registrationNumber: { type: String },
  yearEstablished: { type: Number },

  // TEDx specific information
  tedxInfo: {
    licenseId: { type: String },
    licenseOwnerName: { type: String },
    licenseOwnerEmail: { type: String },
    licenseScope: { type: String }, // city/region
    licenseExpiryDate: { type: Date },
    documentLinks: { type: String }, // URLs to license/approval docs
  },

  // Health Camp specific information
  healthCampInfo: {
    organizerType: {
      type: String,
      enum: ['Hospital', 'Clinic', 'NGO', 'Individual Doctor Group'],
    },
    medicalDirectorName: { type: String },
    medicalRegistrationNumber: { type: String },
    partnerHospitalName: { type: String },
    emergencyContact: { type: String },
    documentLinks: { type: String }, // registration/permission docs
  },

  // Concerts specific information
  concertInfo: {
    organizerType: {
      type: String,
      enum: ['Event Company', 'Artist Management', 'Individual'],
    },
    primaryArtists: { type: String }, // comma-separated list or free text
    venueNameConfirmation: { type: String },
    venueCapacityConfirmation: { type: String },
    ageRestrictions: { type: String },
    documentLinks: { type: String }, // venue contract / permits links
  },

  // Exhibitions specific information
  exhibitionInfo: {
    venueDetails: { type: String },
    hallDetails: { type: String },
    keyExhibitors: { type: String },
    documentLinks: { type: String }, // venue agreement / trade license links
  },

  // Verification system
  verified: { type: Boolean, default: false },
  verificationStatus: {
    type: String,
    enum: ['not_submitted', 'pending', 'approved', 'rejected'],
    default: 'not_submitted'
  },
  verificationDocument: { type: String }, // file path to uploaded document
  verificationRequestDate: { type: Date },
  verificationReviewDate: { type: Date },
  rejectionReason: { type: String },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Manager' },
});

// --- Indexes ---
// Primary lookup: every organizer dashboard request does findOne({ userId })
OrganizerSchema.index({ userId: 1 }, { unique: true });
// Admin verification queue: filter by verificationStatus
OrganizerSchema.index({ verificationStatus: 1 });

const Organizer = mongoose.model('Organizer', OrganizerSchema);

export default Organizer;
