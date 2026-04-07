import { Router } from 'express';
import { prisma } from '../config/db';
import {
  AuthRequest,
  authenticate,
  parsePagination,
  resequenceQueue,
  requireAdmin,
} from './helpers';

const router = Router();
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

router.post('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { date, timeSlot } = req.body as { date: string; timeSlot: string };
    if (!date || !timeSlot) {
      res.status(400).json({ success: false, message: 'date and timeSlot are required' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: req.auth!.userId } });
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const occupied = await prisma.booking.findFirst({
      where: {
      date,
      time: timeSlot,
      status: { in: ['BOOKED', 'IN_SERVICE'] },
      },
    });

    if (occupied) {
      res.status(409).json({ success: false, message: 'Selected slot is already booked' });
      return;
    }

    const appointment = await prisma.booking.create({
      data: {
        userId: user.id,
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
      },
    });

    await resequenceQueue(date);

    const refreshed = await prisma.booking.findUnique({ where: { id: appointment.id } });
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

    const occupied = await prisma.booking.findFirst({
      where: {
      date,
      time: timeSlot,
      status: { in: ['BOOKED', 'IN_SERVICE'] },
      },
    });

    if (occupied) {
      res.status(409).json({ success: false, message: 'Selected slot is already booked' });
      return;
    }

    const reserved = await prisma.booking.create({
      data: {
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
      },
    });

    await resequenceQueue(date);

    const refreshed = await prisma.booking.findUnique({ where: { id: reserved.id } });
    res.status(201).json({ success: true, data: refreshed, message: 'Appointment reserved successfully' });
  } catch (error) {
    next(error);
  }
});

router.get('/my', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const rows = await prisma.booking.findMany({
      where: { userId: req.auth!.userId },
      orderBy: [{ date: 'asc' }, { time: 'asc' }],
    });
    res.status(200).json({ success: true, data: rows, message: 'Your appointments retrieved successfully' });
  } catch (error) {
    next(error);
  }
});

router.put('/:id/cancel', authenticate, async (req: AuthRequest, res, next) => {
  try {
    if (!uuidRegex.test(req.params.id)) {
      res.status(400).json({ success: false, message: 'Invalid appointment id' });
      return;
    }
    const row = await prisma.booking.findUnique({ where: { id: req.params.id } });
    if (!row) {
      res.status(404).json({ success: false, message: 'Appointment not found' });
      return;
    }

    if (req.auth!.role !== 'ADMIN' && row.userId !== req.auth!.userId) {
      res.status(403).json({ success: false, message: 'Not allowed to cancel this appointment' });
      return;
    }

    const updated = await prisma.booking.update({ where: { id: req.params.id }, data: { status: 'CANCELLED' } });
    await resequenceQueue(row.date);

    res.status(200).json({ success: true, data: updated, message: 'Appointment cancelled successfully' });
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
      prisma.booking.findMany({ where: filter as any, orderBy: [{ date: 'asc' }, { time: 'asc' }], skip, take }),
      prisma.booking.count({ where: filter as any }),
    ]);
    res.status(200).json({ success: true, data: rows, page, limit, total, message: 'Appointments retrieved successfully' });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', authenticate, requireAdmin, async (req, res, next) => {
  try {
    if (!uuidRegex.test(req.params.id)) {
      res.status(400).json({ success: false, message: 'Invalid appointment id' });
      return;
    }
    const row = await prisma.booking.findUnique({ where: { id: req.params.id } });
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
    if (!uuidRegex.test(req.params.id)) {
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

    const existing = await prisma.booking.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      res.status(404).json({ success: false, message: 'Appointment not found' });
      return;
    }

    const updated = await prisma.booking.update({
      where: { id: req.params.id },
      data: {
        ...(payload.date !== undefined ? { date: payload.date } : {}),
        ...((payload.timeSlot ?? payload.time) !== undefined ? { time: payload.timeSlot ?? payload.time } : {}),
        ...(payload.status !== undefined ? { status: payload.status } : {}),
        ...(payload.queuePosition !== undefined ? { queuePosition: payload.queuePosition } : {}),
      },
    });

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
    if (!uuidRegex.test(req.params.id)) {
      res.status(400).json({ success: false, message: 'Invalid appointment id' });
      return;
    }
    const updated = await prisma.booking.update({ where: { id: req.params.id }, data: { status: 'COMPLETED' } });
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
    if (!uuidRegex.test(req.params.id)) {
      res.status(400).json({ success: false, message: 'Invalid appointment id' });
      return;
    }
    const row = await prisma.booking.findUnique({ where: { id: req.params.id } });
    if (!row) {
      res.status(404).json({ success: false, message: 'Appointment not found' });
      return;
    }

    await prisma.booking.updateMany({
      where: { date: row.date, status: 'IN_SERVICE', NOT: { id: row.id } },
      data: { status: 'BOOKED' },
    });
    const updated = await prisma.booking.update({ where: { id: row.id }, data: { status: 'IN_SERVICE' } });
    await resequenceQueue(row.date);

    res.status(200).json({ success: true, data: updated, message: 'Appointment marked as in service' });
  } catch (error) {
    next(error);
  }
});

router.put('/:id/no-show', authenticate, requireAdmin, async (req, res, next) => {
  try {
    if (!uuidRegex.test(req.params.id)) {
      res.status(400).json({ success: false, message: 'Invalid appointment id' });
      return;
    }
    const updated = await prisma.booking.update({ where: { id: req.params.id }, data: { status: 'NO_SHOW' } });
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
    if (!uuidRegex.test(req.params.id)) {
      res.status(400).json({ success: false, message: 'Invalid appointment id' });
      return;
    }
    const deleted = await prisma.booking.findUnique({ where: { id: req.params.id } });
    if (deleted) {
      await prisma.booking.delete({ where: { id: req.params.id } });
      await resequenceQueue(deleted.date);
    }
    res.status(200).json({ success: true, data: null, message: 'Appointment deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
