import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { persistenceService } from './services/persistenceService.js';
import { errorHandler } from './middleware/errorHandler.js';

// Exactly 7 API Groups
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import movieRoutes from './routes/movieRoutes.js';
import subscriptionRoutes from './routes/subscriptionRoutes.js';
import watchlistRoutes from './routes/watchlistRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import systemRoutes from './routes/systemRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const SESSION_SECRET = process.env.SESSION_SECRET || 'mybomma_super_secure_session_secret_2026_cinema_streaming';
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Security & Middleware
app.use(
  helmet({
    contentSecurityPolicy: false, // Allow CDN video and images
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  })
);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl) or local dev
      if (!origin || origin.includes('localhost') || origin.includes('127.0.0.1')) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true
  })
);

app.use(cookieParser(SESSION_SECRET));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging in development
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (process.env.NODE_ENV !== 'test') {
      console.log(`${req.method} ${req.originalUrl} [${res.statusCode}] - ${duration}ms`);
    }
  });
  next();
});

// -------------------------------------------------------------
// EXACTLY SEVEN LOGICAL REST API GROUPS
// -------------------------------------------------------------
// API 1: Authentication (Public / Member)
app.use('/api/auth', authRoutes);

// API 2: User Account (Member / Admin)
app.use('/api/user', userRoutes);

// API 3: Movie Catalog (Authenticated Members)
app.use('/api/movies', movieRoutes);

// API 4: Subscriptions & Plans (Authenticated Members)
app.use('/api/subscriptions', subscriptionRoutes);

// API 5: Watchlist & Progress (Authenticated Members)
app.use('/api/watchlist', watchlistRoutes);

// API 6: Admin Console (Admin Only)
app.use('/api/admin', adminRoutes);

// API 7: System & Telemetry (Public / Admin)
app.use('/api/system', systemRoutes);

// Centralized error handler
app.use(errorHandler);

// Server startup
async function startServer() {
  try {
    await persistenceService.init();
    app.listen(Number(PORT), '127.0.0.1', () => {
      console.log(`🎬 MYbomma Streaming Server running on http://127.0.0.1:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();

export default app;
