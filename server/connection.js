// import sqlite3 from 'sqlite3';
// // i am importing all the models to be initiallized in connection.js so that table is created after the db is init
// import createUserTable from './models/user.js';
// import createOrganizerTable from './models/organizer.js';
// import createEventTable from './models/event.js';

// // Initialize SQLite in-memory database
// const db = new sqlite3.Database(':memory:', async (err) => {
//     if (err) {
//         console.error('Error connecting to the in-memory database:', err.message);
//     } else {
//         console.log('Connected to the in-memory SQLite database.');

//         try {
//             // Initialize User table
//             await createUserTable(db);
//             console.log("User table initialized successfully.");
//             await createOrganizerTable(db);
//             console.log("Organizer table initialized successfully.")
//             await createEventTable(db);
//             console.log("Event table initialized successfully.")
//         } catch (error) {
//             console.error("Error initializing database tables:", error);
//             process.exit(1); // Exit process if initialization fails
//         }
//     }
// });

// export default db;

import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const connectDB = async () => {
  try {
    const username = process.env.MONGO_USERNAME;
    const password = encodeURIComponent(process.env.MONGO_PASSWORD); // Encode special characters

    // Construct the MongoDB connection string using env variables
    const dbURI = `mongodb+srv://${username}:${password}@event-management-websit.4kvbvbt.mongodb.net/?retryWrites=true&w=majority&appName=event-management-website-db`;

    // Use local MongoDB as fallback if credentials aren't available
    const fallbackURI = 'mongodb://127.0.0.1:27017/EventManagement';

    await mongoose.connect(username && password ? dbURI : fallbackURI);

    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1); // Exit the app if the database connection fails
  }
};

export default connectDB;
