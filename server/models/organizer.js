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
  verified: { type: Boolean, default: false },
});

const Organizer = mongoose.model('Organizer', OrganizerSchema);

export default Organizer;
