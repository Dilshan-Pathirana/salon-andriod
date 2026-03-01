import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { config } from './config';
import { errorHandler } from './middleware';

// Import routes
import { authRoutes } from './modules/auth';
import { usersRoutes } from './modules/users';
import { scheduleRoutes } from './modules/schedule';
import { appointmentsRoutes } from './modules/appointments';
import { queueRoutes } from './modules/queue';
import { sessionRoutes } from './modules/session';
import { servicesRoutes } from './modules/services';
import { reviewsRoutes } from './modules/reviews';
import { galleryRoutes } from './modules/gallery';
import { businessInfoRoutes } from './modules/business-info';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: config.cors.origin === '*' ? true : config.cors.origin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later' },
});
app.use(limiter);

// Stricter rate limit for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 attempts
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many authentication attempts, please try again later' },
});

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Logging
if (!config.server.isProduction) {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: config.server.nodeEnv,
  });
});

// API Routes
app.use('/api/v1/auth', authLimiter, authRoutes);
app.use('/api/v1/users', usersRoutes);
app.use('/api/v1/schedule', scheduleRoutes);
app.use('/api/v1/appointments', appointmentsRoutes);
app.use('/api/v1/queue', queueRoutes);
app.use('/api/v1/session', sessionRoutes);
app.use('/api/v1/services', servicesRoutes);
app.use('/api/v1/reviews', reviewsRoutes);
app.use('/api/v1/gallery', galleryRoutes);
app.use('/api/v1/business-info', businessInfoRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Global error handler
app.use(errorHandler);

export default app;
