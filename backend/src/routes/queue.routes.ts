import { Router } from 'express';
import { Booking } from '../models/Booking';
import { Schedule } from '../models/Schedule';
import { authenticate, requireAdmin, todayString } from './helpers';

const router = Router();

router.get('/', authenticate, async (req, res, next) => {
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

router.put('/reorder', authenticate, requireAdmin, async (req, res, next) => {
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

export default router;
