import bcrypt from 'bcryptjs';
import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import jwt from 'jsonwebtoken';
import { isValidObjectId } from 'mongoose';
import morgan from 'morgan';
import { env } from './config/env';
import { Booking } from './models/Booking';
import { GalleryItem } from './models/GalleryItem';
import { Schedule } from './models/Schedule';
import { Service } from './models/Service';
import { Session } from './models/Session';
import { TeamMember } from './models/TeamMember';
import { User } from './models/User';

type Role = 'ADMIN' | 'CLIENT';

type AuthPayload = {
  userId: string;
  role: Role;
};

type AuthRequest = Request & { auth?: AuthPayload };

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.clientUrl,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));

function todayString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function sanitizeUser(user: {
  _id: unknown;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: Role;
  profileImageUrl?: string | null;
  isActive: boolean;
  createdAt?: Date;
}) {
  return {
    id: String(user._id),
    firstName: user.firstName,
    lastName: user.lastName,
    phoneNumber: user.phoneNumber,
    role: user.role,
    profileImageUrl: user.profileImageUrl ?? null,
    isActive: user.isActive,
    createdAt: user.createdAt ?? new Date(),
  };
}

function signAccessToken(payload: AuthPayload): string {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: '7d' });
}

function signRefreshToken(payload: AuthPayload): string {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: '30d' });
}

function authenticate(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'Access token is required' });
    return;
  }

  const token = authHeader.slice('Bearer '.length);

  try {
    const decoded = jwt.verify(token, env.jwtSecret) as AuthPayload;
    req.auth = { userId: decoded.userId, role: decoded.role };
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Invalid or expired access token' });
  }
}

function requireAdmin(req: AuthRequest, res: Response, next: NextFunction): void {
  if (!req.auth || req.auth.role !== 'ADMIN') {
    res.status(403).json({ success: false, message: 'Admin access required' });
    return;
  }
  next();
}

async function resequenceQueue(date: string): Promise<void> {
  const active = await Booking.find({
    date,
    status: { $in: ['BOOKED', 'IN_SERVICE'] },
  })
    .sort({ time: 1, createdAt: 1 })
    .lean();

  await Promise.all(
    active.map((row, index) =>
      Booking.updateOne(
        { _id: row._id },
        {
          $set: {
            queuePosition: index + 1,
          },
        }
      )
    )
  );
}

app.get('/api/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Salon API is healthy',
    timestamp: new Date().toISOString(),
  });
});

app.post('/api/auth/register', async (req, res, next) => {
  try {
    const { phoneNumber, password, firstName, lastName } = req.body as {
      phoneNumber: string;
      password: string;
      firstName: string;
      lastName: string;
    };

    if (!phoneNumber || !password || !firstName || !lastName) {
      res.status(400).json({ success: false, message: 'Missing required fields' });
      return;
    }

    const exists = await User.findOne({ phoneNumber }).lean();
    if (exists) {
      res.status(409).json({ success: false, message: 'A user with this phone number already exists' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      phoneNumber,
      passwordHash,
      firstName,
      lastName,
      role: 'CLIENT',
      profileImageUrl: null,
      isActive: true,
    });

    const payload: AuthPayload = { userId: String(user._id), role: user.role };
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: sanitizeUser(user),
        accessToken: signAccessToken(payload),
        refreshToken: signRefreshToken(payload),
      },
    });
  } catch (error) {
    next(error);
  }
});

app.post('/api/auth/login', async (req, res, next) => {
  try {
    const { phoneNumber, password } = req.body as {
      phoneNumber: string;
      password: string;
    };

    if (!phoneNumber || !password) {
      res.status(400).json({ success: false, message: 'Phone number and password are required' });
      return;
    }

    const user = await User.findOne({ phoneNumber });
    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid phone number or password' });
      return;
    }

    if (!user.isActive) {
      res.status(401).json({ success: false, message: 'Account has been deactivated' });
      return;
    }

    const passwordValid = await bcrypt.compare(password, user.passwordHash);
    if (!passwordValid) {
      res.status(401).json({ success: false, message: 'Invalid phone number or password' });
      return;
    }

    const payload: AuthPayload = { userId: String(user._id), role: user.role };

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: sanitizeUser(user),
        accessToken: signAccessToken(payload),
        refreshToken: signRefreshToken(payload),
      },
    });
  } catch (error) {
    next(error);
  }
});

app.post('/api/auth/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body as { refreshToken?: string };
    if (!refreshToken) {
      res.status(400).json({ success: false, message: 'Refresh token is required' });
      return;
    }

    const decoded = jwt.verify(refreshToken, env.jwtSecret) as AuthPayload;

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken: signAccessToken({ userId: decoded.userId, role: decoded.role }),
        refreshToken: signRefreshToken({ userId: decoded.userId, role: decoded.role }),
      },
    });
  } catch (error) {
    next(error);
  }
});

app.post('/api/auth/logout', (_req, res) => {
  res.status(200).json({ success: true, message: 'Logged out successfully', data: null });
});

app.post('/api/auth/logout-all', authenticate, (_req, res) => {
  res.status(200).json({ success: true, message: 'Logged out of all devices', data: null });
});

app.get('/api/users/profile', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const user = await User.findById(req.auth!.userId).lean();
    if (!user) {
      res.status(404).json({ success: false, message: 'Profile not found' });
      return;
    }
    res.status(200).json({ success: true, message: 'Profile retrieved successfully', data: sanitizeUser(user) });
  } catch (error) {
    next(error);
  }
});

app.put('/api/users/profile', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const updateBody = req.body as {
      firstName?: string;
      lastName?: string;
      password?: string;
      profileImageUrl?: string | null;
    };

    const data: Record<string, unknown> = {};
    if (updateBody.firstName !== undefined) data.firstName = updateBody.firstName;
    if (updateBody.lastName !== undefined) data.lastName = updateBody.lastName;
    if (updateBody.profileImageUrl !== undefined) data.profileImageUrl = updateBody.profileImageUrl;
    if (updateBody.password) data.passwordHash = await bcrypt.hash(updateBody.password, 10);

    const updated = await User.findByIdAndUpdate(req.auth!.userId, data, { new: true }).lean();
    if (!updated) {
      res.status(404).json({ success: false, message: 'Profile not found' });
      return;
    }

    res.status(200).json({ success: true, message: 'Profile updated successfully', data: sanitizeUser(updated) });
  } catch (error) {
    next(error);
  }
});

app.get('/api/users', authenticate, requireAdmin, async (_req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }).lean();
    res.status(200).json({ success: true, message: 'Users retrieved successfully', data: users.map(sanitizeUser) });
  } catch (error) {
    next(error);
  }
});

app.post('/api/users', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { phoneNumber, password, firstName, lastName, role } = req.body as {
      phoneNumber: string;
      password: string;
      firstName: string;
      lastName: string;
      role: Role;
    };

    if (!phoneNumber || !password || !firstName || !lastName || !role) {
      res.status(400).json({ success: false, message: 'Missing required fields' });
      return;
    }

    const exists = await User.findOne({ phoneNumber }).lean();
    if (exists) {
      res.status(409).json({ success: false, message: 'A user with this phone number already exists' });
      return;
    }

    const created = await User.create({
      phoneNumber,
      passwordHash: await bcrypt.hash(password, 10),
      firstName,
      lastName,
      role,
      profileImageUrl: null,
      isActive: true,
    });

    res.status(201).json({ success: true, message: 'User created successfully', data: sanitizeUser(created) });
  } catch (error) {
    next(error);
  }
});

app.put('/api/users/:id', authenticate, requireAdmin, async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      res.status(400).json({ success: false, message: 'Invalid user id' });
      return;
    }

    const update = req.body as {
      firstName?: string;
      lastName?: string;
      phoneNumber?: string;
      role?: Role;
      isActive?: boolean;
    };

    if (update.phoneNumber) {
      const duplicate = await User.findOne({ phoneNumber: update.phoneNumber, _id: { $ne: req.params.id } }).lean();
      if (duplicate) {
        res.status(409).json({ success: false, message: 'A user with this phone number already exists' });
        return;
      }
    }

    const updated = await User.findByIdAndUpdate(req.params.id, update, { new: true }).lean();
    if (!updated) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    res.status(200).json({ success: true, message: 'User updated successfully', data: sanitizeUser(updated) });
  } catch (error) {
    next(error);
  }
});

app.delete('/api/users/:id', authenticate, requireAdmin, async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      res.status(400).json({ success: false, message: 'Invalid user id' });
      return;
    }

    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'User deleted successfully', data: null });
  } catch (error) {
    next(error);
  }
});

app.put('/api/users/:id/deactivate', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const updated = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true }).lean();
    if (!updated) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }
    res.status(200).json({ success: true, message: 'User deactivated successfully', data: sanitizeUser(updated) });
  } catch (error) {
    next(error);
  }
});

app.put('/api/users/:id/activate', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const updated = await User.findByIdAndUpdate(req.params.id, { isActive: true }, { new: true }).lean();
    if (!updated) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }
    res.status(200).json({ success: true, message: 'User activated successfully', data: sanitizeUser(updated) });
  } catch (error) {
    next(error);
  }
});

app.get('/api/services', async (req, res, next) => {
  try {
    const includeInactive = req.query.includeInactive === 'true';
    const filter = includeInactive ? {} : { isActive: true };
    const services = await Service.find(filter).sort({ price: 1 }).lean();
    res.status(200).json({ success: true, data: services, message: 'Services retrieved successfully' });
  } catch (error) {
    next(error);
  }
});

app.get('/api/services/category/:category', async (req, res, next) => {
  try {
    const items = await Service.find({ category: req.params.category.toUpperCase(), isActive: true }).lean();
    res.status(200).json({ success: true, data: items, message: 'Services retrieved successfully' });
  } catch (error) {
    next(error);
  }
});

app.get('/api/services/:id', async (req, res, next) => {
  try {
    const item = await Service.findById(req.params.id).lean();
    if (!item) {
      res.status(404).json({ success: false, message: 'Service not found' });
      return;
    }
    res.status(200).json({ success: true, data: item, message: 'Service retrieved successfully' });
  } catch (error) {
    next(error);
  }
});

app.post('/api/services', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const payload = req.body as {
      name: string;
      description?: string;
      duration?: number;
      durationMinutes?: number;
      price: number;
      category: 'HAIRCUT' | 'BEARD' | 'COMBO' | 'PREMIUM';
      icon?: string;
      isActive?: boolean;
    };

    const created = await Service.create({
      name: payload.name,
      description: payload.description ?? '',
      durationMinutes: payload.durationMinutes ?? payload.duration ?? 30,
      price: Number(payload.price ?? 0),
      category: payload.category ?? 'HAIRCUT',
      icon: payload.icon ?? 'Scissors',
      isActive: payload.isActive ?? true,
    });

    res.status(201).json({ success: true, data: created, message: 'Service created successfully' });
  } catch (error) {
    next(error);
  }
});

app.put('/api/services/:id', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const payload = req.body as {
      name?: string;
      description?: string;
      duration?: number;
      durationMinutes?: number;
      price?: number;
      category?: 'HAIRCUT' | 'BEARD' | 'COMBO' | 'PREMIUM';
      icon?: string;
      isActive?: boolean;
    };

    const updated = await Service.findByIdAndUpdate(
      req.params.id,
      {
        name: payload.name,
        description: payload.description,
        durationMinutes: payload.durationMinutes ?? payload.duration,
        price: payload.price,
        category: payload.category,
        icon: payload.icon,
        isActive: payload.isActive,
      },
      { new: true }
    ).lean();

    if (!updated) {
      res.status(404).json({ success: false, message: 'Service not found' });
      return;
    }

    res.status(200).json({ success: true, data: updated, message: 'Service updated successfully' });
  } catch (error) {
    next(error);
  }
});

app.delete('/api/services/:id', authenticate, requireAdmin, async (req, res, next) => {
  try {
    await Service.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, data: null, message: 'Service deleted successfully' });
  } catch (error) {
    next(error);
  }
});

app.get('/api/team', async (_req, res, next) => {
  try {
    const team = await TeamMember.find().sort({ experienceYears: -1 }).lean();
    res.status(200).json({ success: true, data: team });
  } catch (error) {
    next(error);
  }
});

app.get('/api/gallery', async (req, res, next) => {
  try {
    const includeInactive = req.query.includeInactive === 'true';
    const items = await GalleryItem.find(includeInactive ? {} : { isActive: true }).sort({ createdAt: -1 }).lean();

    if (items.length === 0) {
      const fromTeam = await TeamMember.find().select('portfolio').lean();
      const gallery = fromTeam.flatMap((item: { portfolio?: string[] }) => item.portfolio ?? []);
      res.status(200).json({ success: true, data: gallery, message: 'Gallery items retrieved successfully' });
      return;
    }

    res.status(200).json({ success: true, data: items, message: 'Gallery items retrieved successfully' });
  } catch (error) {
    next(error);
  }
});

app.get('/api/gallery/category/:category', async (req, res, next) => {
  try {
    const items = await GalleryItem.find({ category: req.params.category, isActive: true }).lean();
    res.status(200).json({ success: true, data: items, message: 'Gallery items retrieved successfully' });
  } catch (error) {
    next(error);
  }
});

app.get('/api/gallery/:id', async (req, res, next) => {
  try {
    const item = await GalleryItem.findById(req.params.id).lean();
    if (!item) {
      res.status(404).json({ success: false, message: 'Gallery item not found' });
      return;
    }
    res.status(200).json({ success: true, data: item, message: 'Gallery item retrieved successfully' });
  } catch (error) {
    next(error);
  }
});

app.post('/api/gallery', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const created = await GalleryItem.create({
      title: req.body.title,
      category: req.body.category ?? 'Work',
      description: req.body.description ?? '',
      imageUrl: req.body.imageUrl,
      isActive: req.body.isActive ?? true,
    });
    res.status(201).json({ success: true, data: created, message: 'Gallery item created successfully' });
  } catch (error) {
    next(error);
  }
});

app.put('/api/gallery/:id', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const updated = await GalleryItem.findByIdAndUpdate(
      req.params.id,
      {
        title: req.body.title,
        category: req.body.category,
        description: req.body.description,
        imageUrl: req.body.imageUrl,
        isActive: req.body.isActive,
      },
      { new: true }
    ).lean();

    if (!updated) {
      res.status(404).json({ success: false, message: 'Gallery item not found' });
      return;
    }

    res.status(200).json({ success: true, data: updated, message: 'Gallery item updated successfully' });
  } catch (error) {
    next(error);
  }
});

app.delete('/api/gallery/:id', authenticate, requireAdmin, async (req, res, next) => {
  try {
    await GalleryItem.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, data: null, message: 'Gallery item deleted successfully' });
  } catch (error) {
    next(error);
  }
});

app.get('/api/schedule/available', authenticate, async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query as { startDate?: string; endDate?: string };
    if (!startDate || !endDate) {
      res.status(200).json({ success: true, data: [], message: 'startDate and endDate query params are required' });
      return;
    }

    const schedules = await Schedule.find({
      date: { $gte: startDate, $lte: endDate },
      status: 'OPEN',
    })
      .sort({ date: 1 })
      .lean();

    res.status(200).json({ success: true, data: schedules, message: 'Available days retrieved successfully' });
  } catch (error) {
    next(error);
  }
});

app.get('/api/schedule', authenticate, async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query as { startDate?: string; endDate?: string };
    const filter: Record<string, unknown> = {};
    if (startDate || endDate) {
      filter.date = {
        ...(startDate ? { $gte: startDate } : {}),
        ...(endDate ? { $lte: endDate } : {}),
      };
    }

    const schedules = await Schedule.find(filter).sort({ date: 1 }).lean();
    res.status(200).json({ success: true, data: schedules, message: 'Schedules retrieved successfully' });
  } catch (error) {
    next(error);
  }
});

app.get('/api/schedule/:date', authenticate, async (req, res, next) => {
  try {
    const schedule = await Schedule.findOne({ date: req.params.date }).lean();
    res.status(200).json({ success: true, data: schedule ?? null, message: 'Schedule retrieved successfully' });
  } catch (error) {
    next(error);
  }
});

app.put('/api/schedule', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const payload = req.body as {
      date: string;
      status: 'OPEN' | 'CLOSED' | 'HOLIDAY';
      startTime: string;
      endTime: string;
      slotDurationMins: number;
    };

    const updated = await Schedule.findOneAndUpdate(
      { date: payload.date },
      {
        date: payload.date,
        status: payload.status,
        startTime: payload.startTime,
        endTime: payload.endTime,
        slotDurationMins: payload.slotDurationMins,
      },
      { upsert: true, new: true }
    ).lean();

    res.status(200).json({ success: true, data: updated, message: 'Schedule saved successfully' });
  } catch (error) {
    next(error);
  }
});

app.get('/api/session', authenticate, async (req, res, next) => {
  try {
    const date = String(req.query.date || todayString());
    const schedule = await Schedule.findOne({ date }).lean();
    const session = await Session.findOne({ date }).lean();

    const sessionStatus = !schedule
      ? 'NO_SCHEDULE'
      : schedule.status === 'OPEN' && !session?.isClosed
        ? 'OPEN'
        : 'CLOSED';

    res.status(200).json({
      success: true,
      message: 'Session status retrieved',
      data: {
        date,
        sessionStatus,
        isClosed: session?.isClosed ?? false,
      },
    });
  } catch (error) {
    next(error);
  }
});

app.post('/api/session/open', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const date = String(req.body.date || todayString());
    await Schedule.findOneAndUpdate(
      { date },
      { date, status: 'OPEN', startTime: '09:00', endTime: '18:00', slotDurationMins: 30 },
      { upsert: true, new: true }
    );

    const session = await Session.findOneAndUpdate({ date }, { date, isClosed: false }, { upsert: true, new: true }).lean();
    res.status(200).json({ success: true, message: 'Session opened successfully', data: session });
  } catch (error) {
    next(error);
  }
});

app.put('/api/session/close', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const date = String(req.query.date || todayString());
    const session = await Session.findOneAndUpdate({ date }, { date, isClosed: true }, { upsert: true, new: true }).lean();
    res.status(200).json({ success: true, message: 'Session closed successfully', data: session });
  } catch (error) {
    next(error);
  }
});

app.get('/api/session/dashboard', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const date = String(req.query.date || todayString());

    const [users, services, appointments, schedule, session] = await Promise.all([
      User.find().lean(),
      Service.find({ isActive: true }).lean(),
      Booking.find({ date }).lean(),
      Schedule.findOne({ date }).lean(),
      Session.findOne({ date }).lean(),
    ]);

    const sessionStatus = !schedule
      ? 'NO_SCHEDULE'
      : schedule.status === 'OPEN' && !session?.isClosed
        ? 'OPEN'
        : 'CLOSED';

    const trend = Array.from({ length: 7 }).map((_, index) => {
      const day = new Date();
      day.setDate(day.getDate() - (6 - index));
      const key = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
      const count = users.filter((user) => user.createdAt?.toISOString().slice(0, 10) === key).length;
      return { day: key, count };
    });

    const result = {
      date,
      sessionStatus,
      totalAppointments: appointments.length,
      inQueue: appointments.filter((a) => a.status === 'BOOKED' || a.status === 'IN_SERVICE').length,
      completed: appointments.filter((a) => a.status === 'COMPLETED').length,
      cancelled: appointments.filter((a) => a.status === 'CANCELLED').length,
      noShow: appointments.filter((a) => a.status === 'NO_SHOW').length,
      registeredUsers: users.length,
      activeServices: services.length,
      appointmentsToday: appointments.length,
      userRegistrationTrend: trend,
      averageAppointmentTime: schedule?.slotDurationMins ?? 30,
    };

    res.status(200).json({ success: true, message: 'Dashboard stats retrieved', data: result });
  } catch (error) {
    next(error);
  }
});

app.post('/api/bookings', async (req, res, next) => {
  try {
    const { fullName, email, phone, serviceName, date, time, notes } = req.body as {
      fullName: string;
      email: string;
      phone: string;
      serviceName: string;
      date: string;
      time: string;
      notes?: string;
    };

    if (!fullName || !email || !phone || !serviceName || !date || !time) {
      res.status(400).json({ success: false, message: 'Missing required booking fields.' });
      return;
    }

    const currentCount = await Booking.countDocuments({ date, status: { $in: ['BOOKED', 'IN_SERVICE'] } });

    const booking = await Booking.create({
      fullName,
      email,
      phone,
      serviceName,
      date,
      time,
      notes: notes ?? '',
      status: 'BOOKED',
      queuePosition: currentCount + 1,
      isReserved: false,
    });

    res.status(201).json({ success: true, data: booking, message: 'Appointment request submitted.' });
  } catch (error) {
    next(error);
  }
});

app.get('/api/bookings', async (_req, res, next) => {
  try {
    const bookings = await Booking.find().sort({ date: -1, time: -1 }).limit(200).lean();
    res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    next(error);
  }
});

app.post('/api/appointments', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { date, timeSlot } = req.body as { date: string; timeSlot: string };
    if (!date || !timeSlot) {
      res.status(400).json({ success: false, message: 'date and timeSlot are required' });
      return;
    }

    const user = await User.findById(req.auth!.userId).lean();
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const occupied = await Booking.findOne({
      date,
      time: timeSlot,
      status: { $in: ['BOOKED', 'IN_SERVICE'] },
    }).lean();

    if (occupied) {
      res.status(409).json({ success: false, message: 'Selected slot is already booked' });
      return;
    }

    const queuePosition =
      (await Booking.countDocuments({
        date,
        status: { $in: ['BOOKED', 'IN_SERVICE'] },
      })) + 1;

    const appointment = await Booking.create({
      userId: String(user._id),
      fullName: `${user.firstName} ${user.lastName}`.trim(),
      email: `${user.phoneNumber}@client.local`,
      phone: user.phoneNumber,
      serviceName: 'Salon Appointment',
      date,
      time: timeSlot,
      notes: '',
      status: 'BOOKED',
      queuePosition,
      isReserved: false,
    });

    res.status(201).json({ success: true, data: appointment, message: 'Appointment booked successfully' });
  } catch (error) {
    next(error);
  }
});

app.get('/api/appointments/my', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const rows = await Booking.find({ userId: req.auth!.userId }).sort({ date: -1, time: -1 }).lean();
    res.status(200).json({ success: true, data: rows, message: 'Your appointments retrieved successfully' });
  } catch (error) {
    next(error);
  }
});

app.put('/api/appointments/:id/cancel', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const row = await Booking.findById(req.params.id);
    if (!row) {
      res.status(404).json({ success: false, message: 'Appointment not found' });
      return;
    }

    if (req.auth!.role !== 'ADMIN' && row.userId !== req.auth!.userId) {
      res.status(403).json({ success: false, message: 'Not allowed to cancel this appointment' });
      return;
    }

    row.status = 'CANCELLED';
    await row.save();
    await resequenceQueue(row.date);

    res.status(200).json({ success: true, data: row, message: 'Appointment cancelled successfully' });
  } catch (error) {
    next(error);
  }
});

app.get('/api/appointments', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { date, status, userId } = req.query as { date?: string; status?: string; userId?: string };
    const filter: Record<string, unknown> = {};
    if (date) filter.date = date;
    if (status) filter.status = status;
    if (userId) filter.userId = userId;

    const rows = await Booking.find(filter).sort({ date: -1, time: -1 }).lean();
    res.status(200).json({ success: true, data: rows, message: 'Appointments retrieved successfully' });
  } catch (error) {
    next(error);
  }
});

app.get('/api/appointments/:id', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const row = await Booking.findById(req.params.id).lean();
    if (!row) {
      res.status(404).json({ success: false, message: 'Appointment not found' });
      return;
    }
    res.status(200).json({ success: true, data: row, message: 'Appointment retrieved successfully' });
  } catch (error) {
    next(error);
  }
});

app.put('/api/appointments/:id', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const payload = req.body as {
      date?: string;
      time?: string;
      timeSlot?: string;
      status?: 'BOOKED' | 'IN_SERVICE' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
      queuePosition?: number;
    };

    const updated = await Booking.findByIdAndUpdate(
      req.params.id,
      {
        date: payload.date,
        time: payload.timeSlot ?? payload.time,
        status: payload.status,
        queuePosition: payload.queuePosition,
      },
      { new: true }
    );

    if (!updated) {
      res.status(404).json({ success: false, message: 'Appointment not found' });
      return;
    }

    await resequenceQueue(updated.date);

    res.status(200).json({ success: true, data: updated, message: 'Appointment updated successfully' });
  } catch (error) {
    next(error);
  }
});

app.put('/api/appointments/:id/complete', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const updated = await Booking.findByIdAndUpdate(req.params.id, { status: 'COMPLETED' }, { new: true });
    if (!updated) {
      res.status(404).json({ success: false, message: 'Appointment not found' });
      return;
    }
    await resequenceQueue(updated.date);
    res.status(200).json({ success: true, data: updated, message: 'Appointment marked as completed' });
  } catch (error) {
    next(error);
  }
});

app.put('/api/appointments/:id/in-service', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const row = await Booking.findById(req.params.id);
    if (!row) {
      res.status(404).json({ success: false, message: 'Appointment not found' });
      return;
    }

    await Booking.updateMany({ date: row.date, status: 'IN_SERVICE', _id: { $ne: row._id } }, { status: 'BOOKED' });
    row.status = 'IN_SERVICE';
    await row.save();

    res.status(200).json({ success: true, data: row, message: 'Appointment marked as in service' });
  } catch (error) {
    next(error);
  }
});

app.put('/api/appointments/:id/no-show', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const updated = await Booking.findByIdAndUpdate(req.params.id, { status: 'NO_SHOW' }, { new: true });
    if (!updated) {
      res.status(404).json({ success: false, message: 'Appointment not found' });
      return;
    }
    await resequenceQueue(updated.date);
    res.status(200).json({ success: true, data: updated, message: 'Appointment marked as no-show' });
  } catch (error) {
    next(error);
  }
});

app.delete('/api/appointments/:id', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const deleted = await Booking.findByIdAndDelete(req.params.id);
    if (deleted) {
      await resequenceQueue(deleted.date);
    }
    res.status(200).json({ success: true, data: null, message: 'Appointment deleted successfully' });
  } catch (error) {
    next(error);
  }
});

app.get('/api/queue', authenticate, async (req, res, next) => {
  try {
    const date = String(req.query.date || todayString());

    const queueRows = await Booking.find({
      date,
      status: { $in: ['BOOKED', 'IN_SERVICE'] },
    })
      .sort({ queuePosition: 1, time: 1, createdAt: 1 })
      .lean();

    const currentlyServing = queueRows.find((row) => row.status === 'IN_SERVICE') || null;
    const slotDuration = (await Schedule.findOne({ date }).lean())?.slotDurationMins ?? 30;

    const queue = queueRows.map((row, index) => ({
      id: String(row._id),
      position: row.queuePosition || index + 1,
      name: row.fullName,
      userId: row.userId || `phone_${row.phone}`,
      phoneNumber: row.phone,
      timeSlot: row.time,
      status: row.status,
      slotDurationMins: slotDuration,
      estimatedWaitMins: index * slotDuration,
    }));

    res.status(200).json({
      success: true,
      message: 'Live queue retrieved successfully',
      data: {
        date,
        currentlyServing: currentlyServing
          ? {
              id: String(currentlyServing._id),
              name: currentlyServing.fullName,
              timeSlot: currentlyServing.time,
              phoneNumber: currentlyServing.phone,
            }
          : null,
        queue,
        totalInQueue: queue.length,
      },
    });
  } catch (error) {
    next(error);
  }
});

app.put('/api/queue/reorder', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { date, orderedIds } = req.body as { date?: string; orderedIds?: string[] };
    const targetDate = date || todayString();

    if (!orderedIds || !Array.isArray(orderedIds) || orderedIds.length === 0) {
      res.status(400).json({ success: false, message: 'orderedIds array is required' });
      return;
    }

    await Promise.all(
      orderedIds.map((id, index) =>
        Booking.updateOne(
          { _id: id, date: targetDate },
          {
            $set: {
              queuePosition: index + 1,
              status: index === 0 ? 'IN_SERVICE' : 'BOOKED',
            },
          }
        )
      )
    );

    const refreshed = await Booking.find({ date: targetDate, status: { $in: ['BOOKED', 'IN_SERVICE'] } })
      .sort({ queuePosition: 1 })
      .lean();

    res.status(200).json({ success: true, message: 'Queue reordered successfully', data: refreshed });
  } catch (error) {
    next(error);
  }
});

app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  const message = error instanceof Error ? error.message : 'Internal server error';
  res.status(500).json({ success: false, message });
});

export default app;
