import { Router } from 'express';
import { Schedule } from '../models/Schedule';
import { authenticate, requireAdmin } from './helpers';

const router = Router();

router.get('/available', authenticate, async (req, res, next) => {
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

router.get('/', authenticate, async (req, res, next) => {
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

router.get('/:date', authenticate, async (req, res, next) => {
  try {
    const schedule = await Schedule.findOne({ date: req.params.date }).lean();
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

export default router;
