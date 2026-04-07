import { Router } from 'express';
import { prisma } from '../config/db';
import { authenticate, requireAdmin } from './helpers';

const router = Router();

router.get('/available', authenticate, async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query as { startDate?: string; endDate?: string };
    if (!startDate || !endDate) {
      res.status(200).json({ success: true, data: [], message: 'startDate and endDate query params are required' });
      return;
    }

    const schedules = await prisma.schedule.findMany({
      where: {
        date: { gte: startDate, lte: endDate },
        status: 'OPEN',
      },
      orderBy: { date: 'asc' },
    });

    res.status(200).json({ success: true, data: schedules, message: 'Available days retrieved successfully' });
  } catch (error) {
    next(error);
  }
});

router.get('/', authenticate, async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query as { startDate?: string; endDate?: string };
    const schedules = await prisma.schedule.findMany({
      where: startDate || endDate
        ? {
            date: {
              ...(startDate ? { gte: startDate } : {}),
              ...(endDate ? { lte: endDate } : {}),
            },
          }
        : undefined,
      orderBy: { date: 'asc' },
    });
    res.status(200).json({ success: true, data: schedules, message: 'Schedules retrieved successfully' });
  } catch (error) {
    next(error);
  }
});

router.get('/:date', authenticate, async (req, res, next) => {
  try {
    const schedule = await prisma.schedule.findUnique({ where: { date: req.params.date } });
    res.status(200).json({ success: true, data: schedule ?? null, message: 'Schedule retrieved successfully' });
  } catch (error) {
    next(error);
  }
});

router.put('/', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const payload = req.body as {
      date: string;
      status: 'OPEN' | 'CLOSED' | 'HOLIDAY';
      startTime: string;
      endTime: string;
      slotDurationMins: number;
    };

    const updated = await prisma.schedule.upsert({
      where: { date: payload.date },
      create: {
        date: payload.date,
        status: payload.status,
        startTime: payload.startTime,
        endTime: payload.endTime,
        slotDurationMins: payload.slotDurationMins,
      },
      update: {
        status: payload.status,
        startTime: payload.startTime,
        endTime: payload.endTime,
        slotDurationMins: payload.slotDurationMins,
      },
    });

    res.status(200).json({ success: true, data: updated, message: 'Schedule saved successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
