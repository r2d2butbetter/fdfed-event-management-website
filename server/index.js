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
import managerRouter from './routes/manager.js';
import connectDB from './connection.js';
import { handle404, errorHandler } from './middlewares/errorHandler.js';

import session from "express-session";
import MongoStore from "connect-mongo";
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import methodOverride from 'method-override';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from './config/logger.js';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './docs/swagger.js';

// for getting the events on home page
import Event from './models/event.js';
import Organizer from './models/organizer.js';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// Create logs directory if it doesn't exist (Winston will also create it, but we do it here for Morgan)
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
  logger.info('Logs directory created');
}

// Create a write stream for access log file (append mode)
const accessLogStream = fs.createWriteStream(
  path.join(logsDir, 'access.log'),
  { flags: 'a' } // 'a' means append mode
);

// Security middleware - Helmet sets various HTTP headers to help protect the app
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      // Swagger UI injects inline script for runtime config.
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:", "http://localhost:3000"],
    },
  },
  crossOriginEmbedderPolicy: false, // Disable for CORS compatibility
  crossOriginResourcePolicy: { policy: "cross-origin" }, // Allow cross-origin resource sharing
}));

// CORS configuration for React frontend
app.use(cors({
  origin: 'http://localhost:5173', // React dev server (Vite default port)
  credentials: true // Allow cookies to be sent
}));

// HTTP request logger middleware
// Log to console in 'dev' format (colored, concise output for development)
app.use(morgan('dev'));

// Log to file in 'combined' format (Apache combined log format - better for file storage)
// This includes: IP, date, method, URL, status, response time, referrer, user agent
app.use(morgan('combined', {
  stream: accessLogStream,
  skip: (req, res) => {
    // Skip logging static file requests to reduce log noise
    return req.url.startsWith('/uploads/') || req.url.startsWith('/Public/');
  }
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(methodOverride('_method')); // Enable method override using _method query param

// API documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
  explorer: true,
  customSiteTitle: 'Event Management API Docs'
}));
app.get('/api-docs.json', (req, res) => {
  res.json(swaggerDocument);
});

// Serve static files (mainly for uploaded images)
app.use(express.static("Public"));
//for multer - serve uploaded files
app.use(express.static('uploads'));
app.use('/uploads', express.static('uploads'));


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
app.get('/contact', optionalAuth, (req, res, next) => {
  try {
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
  } catch (error) {
    next(error);
  }
})

// Route for Contact Us form submission
app.post('/api/contact', async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'name, email, subject and message are required'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    const trimmedName = String(name).trim();
    const trimmedSubject = String(subject).trim();
    const trimmedMessage = String(message).trim();

    if (trimmedName.length < 2 || trimmedSubject.length < 3 || trimmedMessage.length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Please provide valid name, subject and message lengths'
      });
    }

    const supportEmail = process.env.CONTACT_RECEIVER_EMAIL || process.env.EMAIL_USER || 'contact@eventmanagement.com';
    const ticketId = `CNT-${uuidv4().split('-')[0]}`;
    const submittedAt = new Date().toISOString();

    const bodyText = [
      `Ticket ID: ${ticketId}`,
      `Submitted At: ${submittedAt}`,
      `Name: ${trimmedName}`,
      `Email: ${email}`,
      `Subject: ${trimmedSubject}`,
      '',
      'Message:',
      trimmedMessage
    ].join('\n');

    await sendEmail(
      supportEmail,
      `[Contact Us] ${trimmedSubject}`,
      bodyText,
      `<pre style="font-family: Arial, sans-serif; white-space: pre-wrap;">${bodyText}</pre>`
    );

    return res.status(200).json({
      success: true,
      message: 'Your message has been received. Our team will contact you shortly.',
      data: {
        ticketId,
        submittedAt
      }
    });
  } catch (error) {
    next(error);
  }
});

app.use('/', authRouter);
app.use('/payments', paymentRouter);
app.use('/events', eventRouter);
app.use('/admin', adminRouter);
app.use('/user', userRouter);
app.use('/organizer', organizerRouter);
app.use('/manager', managerRouter);

// Stats endpoint - returns total events and organizers
app.get('/stats', async (req, res, next) => {
  try {
    const totalEvents = await Event.countDocuments();
    const totalOrganizers = await Organizer.countDocuments();

    res.json({
      success: true,
      data: {
        totalEvents,
        totalOrganizers
      }
    });
  } catch (error) {
    logger.error('Error fetching stats:', { error: error.message, stack: error.stack });
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching statistics.'
    });
  }
});

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

// 404 handler - must come after all routes
app.use(handle404);

// Global error handler - must be the last middleware
app.use(errorHandler);

app.listen(port, () => {
  logger.info(`Server running at http://localhost:${port}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
