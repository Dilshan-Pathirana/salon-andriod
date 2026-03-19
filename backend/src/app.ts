import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import appointmentRoutes from './routes/appointment.routes';
import authRoutes from './routes/auth.routes';
import bookingRoutes from './routes/booking.routes';
import queueRoutes from './routes/queue.routes';
import scheduleRoutes from './routes/schedule.routes';
import serviceRoutes from './routes/service.routes';
import sessionRoutes from './routes/session.routes';
import teamRoutes from './routes/team.routes';
import userRoutes from './routes/user.routes';

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.corsOrigins.length === 1 && env.corsOrigins[0] === '*'
      ? '*'
      : (origin, callback) => {
          if (!origin) return callback(null, true);
          if (env.corsOrigins.includes(origin)) return callback(null, true);
          callback(new Error(`CORS: origin '${origin}' not allowed`));
        },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));

// Strip MongoDB operators from user-supplied input (NoSQL injection prevention)
app.use(mongoSanitize());

// CSRF protection: require X-Requested-With header on state-changing requests
app.use((req: Request, res: Response, next: NextFunction) => {
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    if (!req.headers['x-requested-with']) {
      return res.status(403).json({ success: false, message: 'Missing required header' });
    }
  }
  next();
});

// Global rate limit: 300 requests per 15 minutes per IP
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use(globalLimiter);

// ─── Health check ──────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Salon API is healthy',
    timestamp: new Date().toISOString(),
  });
});

// ─── Route modules ────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/schedule', scheduleRoutes);
app.use('/api/session', sessionRoutes);
app.use('/api', bookingRoutes);     // /api/bookings + /api/time-slots
app.use('/api/appointments', appointmentRoutes);
app.use('/api/queue', queueRoutes);

// ─── Error handlers ───────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  const isProduction = env.nodeEnv === 'production';
  if (!isProduction) {
    console.error(error);
  }
  const message = !isProduction && error instanceof Error ? error.message : 'Internal server error';
  res.status(500).json({ success: false, message });
});

export default app;
