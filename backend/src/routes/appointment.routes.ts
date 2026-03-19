import { Router } from 'express';
import { isValidObjectId } from 'mongoose';
import { Booking } from '../models/Booking';
import { User } from '../models/User';
import {
  AuthRequest,
  authenticate,
  parsePagination,
  resequenceQueue,
  requireAdmin,
} from './helpers';

const router = Router();

router.post('/', authenticate, async (req: AuthRequest, res, next) => {
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
      queuePosition: 0,
      isReserved: false,
    });

    await resequenceQueue(date);

    const refreshed = await Booking.findById(appointment._id).lean();
    res.status(201).json({ success: true, data: refreshed, message: 'Appointment booked successfully' });
  } catch (error) {
    next(error);
  }
});

router.post('/reserve', authenticate, requireAdmin, async (req: AuthRequest, res, next) => {
  try {
    const { date, timeSlot, notes } = req.body as { date: string; timeSlot: string; notes?: string };
    if (!date || !timeSlot) {
      res.status(400).json({ success: false, message: 'date and timeSlot are required' });
      return;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(date))) {
      res.status(400).json({ success: false, message: 'Invalid date format. Use YYYY-MM-DD.' });
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

    const reserved = await Booking.create({
      userId: null,
      fullName: 'Reserved Slot',
      email: 'reserved@salon.local',
      phone: '0000000000',
      serviceName: 'Reserved',
      date,
      time: timeSlot,
      notes: notes ?? 'Reserved by admin',
      status: 'BOOKED',
      queuePosition: 0,
      isReserved: true,
    });

    await resequenceQueue(date);

    const refreshed = await Booking.findById(reserved._id).lean();
    res.status(201).json({ success: true, data: refreshed, message: 'Appointment reserved successfully' });
  } catch (error) {
    next(error);
  }
});

router.get('/my', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const rows = await Booking.find({ userId: req.auth!.userId }).sort({ date: 1, time: 1 }).lean();
    res.status(200).json({ success: true, data: rows, message: 'Your appointments retrieved successfully' });
  } catch (error) {
    next(error);
  }
});

router.put('/:id/cancel', authenticate, async (req: AuthRequest, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      res.status(400).json({ success: false, message: 'Invalid appointment id' });
      return;
    }
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

router.get('/', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { date, status, userId } = req.query as { date?: string; status?: string; userId?: string };
    const filter: Record<string, unknown> = {};
    if (date) filter.date = date;
    if (status) filter.status = status;
    if (userId) filter.userId = userId;

    const { skip, take, page, limit } = parsePagination(req.query as any);
    const [rows, total] = await Promise.all([
      Booking.find(filter).sort({ date: 1, time: 1 }).skip(skip).limit(take).lean(),
      Booking.countDocuments(filter),
    ]);
    res.status(200).json({ success: true, data: rows, page, limit, total, message: 'Appointments retrieved successfully' });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', authenticate, requireAdmin, async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      res.status(400).json({ success: false, message: 'Invalid appointment id' });
      return;
    }
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

router.put('/:id', authenticate, requireAdmin, async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      res.status(400).json({ success: false, message: 'Invalid appointment id' });
      return;
    }
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

router.put('/:id/complete', authenticate, requireAdmin, async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      res.status(400).json({ success: false, message: 'Invalid appointment id' });
      return;
    }
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

router.put('/:id/in-service', authenticate, requireAdmin, async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      res.status(400).json({ success: false, message: 'Invalid appointment id' });
      return;
    }
    const row = await Booking.findById(req.params.id);
    if (!row) {
      res.status(404).json({ success: false, message: 'Appointment not found' });
      return;
    }

    await Booking.updateMany({ date: row.date, status: 'IN_SERVICE', _id: { $ne: row._id } }, { status: 'BOOKED' });
    row.status = 'IN_SERVICE';
    await row.save();
    await resequenceQueue(row.date);

    res.status(200).json({ success: true, data: row, message: 'Appointment marked as in service' });
  } catch (error) {
    next(error);
  }
});

router.put('/:id/no-show', authenticate, requireAdmin, async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      res.status(400).json({ success: false, message: 'Invalid appointment id' });
      return;
    }
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

router.delete('/:id', authenticate, requireAdmin, async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      res.status(400).json({ success: false, message: 'Invalid appointment id' });
      return;
    }
    const deleted = await Booking.findByIdAndDelete(req.params.id);
    if (deleted) {
      await resequenceQueue(deleted.date);
    }
    res.status(200).json({ success: true, data: null, message: 'Appointment deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
