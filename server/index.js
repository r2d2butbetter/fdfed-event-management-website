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
import { sendEmail } from './config/emailConfig.js';

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
      connectSrc: ["'self'", "https://api.razorpay.com", "https://checkout.razorpay.com"],
      frameSrc: ["'self'", "https://api.razorpay.com", "https://checkout.razorpay.com"],
    },
  },
  crossOriginEmbedderPolicy: false, // Disable for CORS compatibility
  crossOriginResourcePolicy: { policy: "cross-origin" }, // Allow cross-origin resource sharing
}));

// CORS configuration for React frontend and independent deployments
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173', // React dev server (Vite default port)
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
  explorer: false,
  customSiteTitle: 'Event Management API Docs'
}));
app.get('/api-docs.json', (req, res) => {
  res.json(swaggerDocument);
});

// Serve static files (mainly for uploaded images)
app.use(express.static("Public", { redirect: false }));
//for multer - serve uploaded files
app.use(express.static('uploads', { redirect: false }));
app.use('/uploads', express.static('uploads', { redirect: false }));


// Initialize app with database connection and session management
async function initializeApp() {
  try {
    // Connect to MongoDB first
    await connectDB();
    console.log('[DEBUG] MongoDB connection completed');

    const username = process.env.MONGO_USERNAME;
    const password = encodeURIComponent(process.env.MONGO_PASSWORD);
    console.log('[DEBUG] Environment variables loaded');

    // Set up session store after DB connection is established
    app.use(
      session({
        secret: "your_secret_key",
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({
          mongoUrl: `mongodb+srv://${username}:${password}@event-management-websit.4kvbvbt.mongodb.net/?retryWrites=true&w=majority&appName=event-management-website-db`,
        }),
        cookie: {
          maxAge: 1000 * 60 * 60 * 24,
          httpOnly: true,
          secure: false,
          sameSite: 'lax'
        },
      })
    );
    console.log('[DEBUG] Session middleware configured');

    // Set up routes
    app.use('/', authRouter);
    console.log('[DEBUG] Auth router loaded');
    app.use('/payments', paymentRouter);
    console.log('[DEBUG] Payment router loaded');
    app.use('/events', eventRouter);
    console.log('[DEBUG] Event router loaded');
    app.use('/admin', adminRouter);
    console.log('[DEBUG] Admin router loaded');
    app.use('/user', userRouter);
    console.log('[DEBUG] User router loaded');
    app.use('/organizer', organizerRouter);
    console.log('[DEBUG] Organizer router loaded');
    app.use('/manager', managerRouter);
    console.log('[DEBUG] Manager router loaded');

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
    });

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

    // 404 handler
    app.use(handle404);
    console.log('[DEBUG] 404 handler loaded');

    // Global error handler
    app.use(errorHandler);
    console.log('[DEBUG] Error handler loaded');

    // Start server
    app.listen(port, () => {
      console.log('[DEBUG] Server listening on port', port);
      logger.info(`Server running at http://localhost:${port}`);
      logger.info(`Swagger UI (all APIs): http://localhost:${port}/api-docs`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    logger.error('Failed to initialize app:', error);
    console.error('[ERROR] Failed to initialize app:', error);
    process.exit(1);
  }
}

// Start the application
initializeApp().catch(err => {
  console.error('[FATAL] Uncaught error in initializeApp:', err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('[FATAL] Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('[FATAL] Uncaught Exception:', error);
  process.exit(1);
});

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


