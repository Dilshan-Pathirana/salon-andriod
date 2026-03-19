import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { Booking } from '../models/Booking';
import {
  authenticate,
  parsePagination,
  resequenceQueue,
  requireAdmin,
  sanitize,
} from './helpers';

const router = Router();

const bookingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many booking requests, please try again later.' },
});

// Public endpoint: returns only booked time strings for a date — no PII exposed
router.get('/time-slots', async (req, res, next) => {
  try {
    const date = String(req.query.date || '');
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      res.status(400).json({ success: false, message: 'Valid date query param required (YYYY-MM-DD)' });
      return;
    }
    const bookings = await Booking.find({ date, status: { $in: ['BOOKED', 'IN_SERVICE'] } })
      .select('time')
      .lean();
    res.status(200).json({ success: true, data: bookings.map((b) => b.time), message: 'Time slots retrieved' });
  } catch (error) {
    next(error);
  }
});

router.post('/bookings', bookingLimiter, async (req, res, next) => {
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

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email))) {
      res.status(400).json({ success: false, message: 'Invalid email address.' });
      return;
    }
    const cleanPhone = String(phone).replace(/[\s\-]/g, '');
    if (!/^(0\d{9}|\+94\d{9})$/.test(cleanPhone)) {
      res.status(400).json({ success: false, message: 'Invalid phone number.' });
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(date))) {
      res.status(400).json({ success: false, message: 'Invalid date format. Use YYYY-MM-DD.' });
      return;
    }
    if (!/^\d{2}:\d{2}$/.test(String(time))) {
      res.status(400).json({ success: false, message: 'Invalid time format. Use HH:MM.' });
      return;
    }

    const booking = await Booking.create({
      fullName: sanitize(String(fullName).trim()),
      email,
      phone: cleanPhone,
      serviceName: sanitize(String(serviceName).trim()),
      date,
      time,
      notes: sanitize(String(notes ?? '').trim()),
      status: 'BOOKED',
      queuePosition: 0,
      isReserved: false,
    });

    await resequenceQueue(date);

    const updated = await Booking.findById(booking._id).lean();
    res.status(201).json({ success: true, data: updated, message: 'Appointment request submitted.' });
  } catch (error) {
    next(error);
  }
});

router.get('/bookings', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { skip, take, page, limit } = parsePagination(req.query as any);
    const [bookings, total] = await Promise.all([
      Booking.find().sort({ date: 1, time: 1 }).skip(skip).limit(take).lean(),
      Booking.countDocuments(),
    ]);
    res.status(200).json({ success: true, data: bookings, page, limit, total });
  } catch (error) {
    next(error);
  }
});

export default router;
