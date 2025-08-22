import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import connectDB from './connection.js';

// Import routes
import authRoutes from './routes/authentication.js';
import eventRoutes from './routes/event.js';
import userRoutes from './routes/user.js';
import adminRoutes from './routes/admin.js';
import organizerRoutes from './routes/organizer.js';
import paymentRoutes from './routes/payment.js';

// Load environment variables
dotenv.config();

const app = express();

// Enhanced CORS configuration for React frontend
app.use(cors({
    origin: [
        'http://localhost:3000', // React dev server default
        'http://localhost:5173', // Vite dev server default
        'http://localhost:3001', // Alternative React port
        process.env.CLIENT_URL || 'http://localhost:3000'
    ],
    credentials: true, // Allow cookies and authorization headers
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// Middleware
app.use(express.json({ limit: '10mb' })); // Increased limit for file uploads
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Session middleware (keeping for backward compatibility, will add JWT)
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to true in production with HTTPS
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Connect to database
connectDB();

// Test route - Enhanced for React
app.get('/test', (req, res) => {
    console.log("Test successful");
    res.json({
        success: true,
        message: "Server is running successfully!",
        timestamp: new Date().toISOString(),
        endpoints: [
            '/api/auth/*',
            '/api/events/*',
            '/api/users/*',
            '/api/admin/*',
            '/api/organizer/*',
            '/api/payment/*'
        ]
    });
});

// Root route - API info
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Event Management API is running',
        version: '1.0.0',
        documentation: '/api/docs',
        endpoints: {
            auth: '/api/auth',
            events: '/api/events',
            users: '/api/users',
            admin: '/api/admin',
            organizer: '/api/organizer',
            payment: '/api/payment'
        }
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/organizer', organizerRoutes);
app.use('/api/payment', paymentRoutes);

// Error handling middleware for React compatibility
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
        error: process.env.NODE_ENV === 'production' ? {} : err.stack
    });
});

// 404 handler - Return JSON instead of HTML
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'API endpoint not found',
        availableEndpoints: ['/api/auth', '/api/events', '/api/users', '/api/admin', '/api/organizer', '/api/payment']
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Event Management API server running on http://localhost:${PORT}`);
    console.log(`📖 API Documentation: http://localhost:${PORT}/`);
    console.log(`🧪 Test endpoint: http://localhost:${PORT}/test`);
    console.log('🔗 Available API endpoints:');
    console.log('   - Authentication: /api/auth');
    console.log('   - Events: /api/events');
    console.log('   - Users: /api/users');
    console.log('   - Admin: /api/admin');
    console.log('   - Organizer: /api/organizer');
    console.log('   - Payment: /api/payment');
    console.log('🌐 CORS enabled for React development');
});
