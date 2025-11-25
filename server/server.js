require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');

const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const registrationRoutes = require('./routes/registrations');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

// Security headers
app.use(helmet());

// Basic rate limiting to mitigate brute-force and abusive requests
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false
});
app.use(limiter);

// Middleware
// CORS configuration
if (process.env.NODE_ENV === 'production') {
    // In production, allow the configured FRONTEND_URL and vercel deployments.
    // This helps when the frontend is deployed to a vercel.app domain but
    // FRONTEND_URL wasn't updated yet in the Render environment.
    const configuredFrontend = process.env.FRONTEND_URL || '';
    console.log('Configured FRONTEND_URL:', configuredFrontend);

    app.use(cors({
        origin: (origin, callback) => {
            // allow requests with no origin (curl, server-to-server)
            if (!origin) return callback(null, true);
            try {
                const url = new URL(origin);
                const hostname = url.hostname;

                // Allow explicitly configured frontend origin
                if (configuredFrontend && origin === configuredFrontend) {
                    return callback(null, true);
                }

                // Allow Vercel preview/production domains (endsWith .vercel.app)
                if (hostname.endsWith('.vercel.app')) {
                    return callback(null, true);
                }

                // Allow localhost/127.0.0.1 during dev testing
                if (hostname === 'localhost' || hostname === '127.0.0.1') {
                    return callback(null, true);
                }
            } catch (err) {
                // ignore parse errors
            }
            callback(new Error('Not allowed by CORS'));
        },
        credentials: true
    }));
} else {
    // In development allow any localhost origin (useful when CRA picks another port)
    app.use(cors({
        origin: (origin, callback) => {
            // allow requests with no origin (like mobile apps or curl)
            if (!origin) return callback(null, true);
            try {
                const url = new URL(origin);
                if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
                    return callback(null, true);
                }
            } catch (err) {
                // ignore parse errors
            }
            // fallback to environment config
            if (origin === process.env.FRONTEND_URL) return callback(null, true);
            callback(new Error('Not allowed by CORS'));
        },
        credentials: true
    }));
}
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// When running behind a proxy (Render), trust the first proxy so secure cookies
// and other proxy-related headers behave correctly in production.
if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
}

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'college-event-secret-key',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/college-event-manager'
    }),
    // Configure cookie security based on environment. For cross-site cookies
    // (client on Vercel, server on Render) we need `sameSite: 'none'` and
    // `secure: true` in production and enable trust proxy above.
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    }
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/registrations', registrationRoutes);

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/college-event-manager')
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});