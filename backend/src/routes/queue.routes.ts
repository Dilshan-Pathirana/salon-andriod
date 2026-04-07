import { Router } from 'express';
import { prisma } from '../config/db';
import { authenticate, requireAdmin, todayString } from './helpers';

const router = Router();

router.get('/', authenticate, async (req, res, next) => {
  try {
    const date = String(req.query.date || todayString());

    const queueRows = await prisma.booking.findMany({
      where: {
        date,
        status: { in: ['BOOKED', 'IN_SERVICE'] },
      },
      orderBy: [{ queuePosition: 'asc' }, { time: 'asc' }, { createdAt: 'asc' }],
    });

    const currentlyServing = queueRows.find((row) => row.status === 'IN_SERVICE') || null;
    const slotDuration = (await prisma.schedule.findUnique({ where: { date } }))?.slotDurationMins ?? 30;

    const queue = queueRows.map((row, index) => ({
      id: row.id,
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
              id: currentlyServing.id,
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
        prisma.booking.updateMany({
          where: { id, date: targetDate },
          data: {
            queuePosition: index + 1,
            status: index === 0 ? 'IN_SERVICE' : 'BOOKED',
          },
        })
      )
    );

    const refreshed = await prisma.booking.findMany({
      where: { date: targetDate, status: { in: ['BOOKED', 'IN_SERVICE'] } },
      orderBy: { queuePosition: 'asc' },
    });

    res.status(200).json({ success: true, message: 'Queue reordered successfully', data: refreshed });
  } catch (error) {
    next(error);
  }
});

export default router;
