import express from 'express';
const app = express();
const port = 3000;
import { v4 as uuidv4 } from 'uuid';
import { setUser, getUser } from './services/auth.js';
import cookieParser from 'cookie-parser';
import { isAuth, optionalAuth } from './middlewares/auth.js';
import authRouter from './routes/authentication.js';
import paymentRouter from './routes/payment.js';
import eventRouter from './routes/event.js';
import adminRouter from './routes/admin.js'
import userRouter from './routes/user.js';
import organizerRouter from './routes/organizer.js';
import connectDB from './connection.js';

import session from "express-session";
import MongoStore from "connect-mongo";
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import methodOverride from 'method-override';
import cors from 'cors';

// for getting the events on home page
import Event from './models/event.js';


dotenv.config();

// CORS configuration for React frontend
app.use(cors({
  origin: 'http://localhost:5173', // React dev server (Vite default port)
  credentials: true // Allow cookies to be sent
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(methodOverride('_method')); // Enable method override using _method query param

// Serve static files (mainly for uploaded images)
app.use(express.static("Public"));
//for multer - serve uploaded files
app.use(express.static('uploads'));


// Connect to MongoDB
connectDB();

const username = process.env.MONGO_USERNAME;
const password = encodeURIComponent(process.env.MONGO_PASSWORD);

app.use(
  session({
    secret: "your_secret_key", // Simple hardcoded secret
    resave: false, // Prevents session being saved repeatedly if not modified
    saveUninitialized: false, // Don't save uninitialized sessions
    store: MongoStore.create({
      mongoUrl: `mongodb+srv://${username}:${password}@event-management-websit.4kvbvbt.mongodb.net/?retryWrites=true&w=majority&appName=event-management-website-db`,
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 day
      httpOnly: true, // Prevents client-side JS access
      secure: false, // Set true in production with HTTPS
      sameSite: 'lax' // Important for CORS: allows cookies across same-site requests
    },
  })
);

// Ensure tables are created before starting the server
// (async () => {
//   try {
//     await createUserTable();
//     console.log("User table initialized successfully.");
//   } catch (error) {
//     console.error("Error initializing database tables:", error);
//     process.exit(1); // Exit process if initialization fails
//   }
// })();




// Route for Contact Us page - Simple JSON response
app.get('/contact', optionalAuth, (req, res) => {
  res.json({
    success: true,
    data: {
      contactInfo: {
        email: 'contact@eventmanagement.com',
        phone: '+1-234-567-8900',
        address: '123 Event Street, City, Country'
      }
    }
  });
})

app.use('/', authRouter);
app.use('/payments', paymentRouter);
app.use('/events', eventRouter);
app.use('/admin', adminRouter);
app.use('/user', userRouter);
app.use('/organizer', organizerRouter);

// Home route - return JSON with basic API info since React handles the homepage
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Event Management API',
    data: {
      version: '1.0.0',
      description: 'Backend API for Event Management System',
      endpoints: {
        events: '/events',
        auth: '/login, /sign-up, /logout',
        user: '/user/dashboard',
        organizer: '/organizer/dashboard',
        admin: '/admin/dashboard',
        payments: '/payments'
      }
    }
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
