// import db from '../connection.js';

// const createEventTable = async () => {
//   await db.exec(`
//     CREATE TABLE IF NOT EXISTS Event (
//       eventId INTEGER PRIMARY KEY AUTOINCREMENT,
//       category TEXT NOT NULL,
//       title TEXT NOT NULL,
//       description TEXT NOT NULL,
//       startDateTime DATETIME NOT NULL,
//       endDateTime DATETIME NOT NULL,
//       venue TEXT NOT NULL,
//       capacity INTEGER NOT NULL,
//       ticketPrice REAL NOT NULL,
//       status TEXT DEFAULT 'Upcoming',
//       organizerId INTEGER NOT NULL,
//       FOREIGN KEY (organizerId) REFERENCES Organizer(organizerId) ON DELETE CASCADE
//     );
//   `);
// };

// export default createEventTable;


import mongoose from 'mongoose';

const EventSchema = new mongoose.Schema({
  category: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  startDateTime: { type: Date, required: true },
  endDateTime: { type: Date, required: true },
  venue: { type: String, required: true },
  capacity: { type: Number, required: true },
  ticketPrice: { type: Number, required: true },
  status: { type: String, default: 'Upcoming' },
  organizerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organizer', required: true },
  image: {type: String, required: false},

},{ collection: 'event' });

const Event = mongoose.model('Event', EventSchema);

export default Event;

//   image: {type: String, required: false},
