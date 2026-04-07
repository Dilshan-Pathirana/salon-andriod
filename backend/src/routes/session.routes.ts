import { Router } from 'express';
import { prisma } from '../config/db';
import { authenticate, requireAdmin, todayString } from './helpers';

const router = Router();

router.get('/', authenticate, async (req, res, next) => {
  try {
    const date = String(req.query.date || todayString());
    const schedule = await prisma.schedule.findUnique({ where: { date } });
    const session = await prisma.session.findUnique({ where: { date } });

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

router.post('/open', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const date = String(req.body.date || todayString());
    await prisma.schedule.upsert({
      where: { date },
      create: { date, status: 'OPEN', startTime: '09:00', endTime: '18:00', slotDurationMins: 30 },
      update: { status: 'OPEN', startTime: '09:00', endTime: '18:00', slotDurationMins: 30 },
    });

    const session = await prisma.session.upsert({
      where: { date },
      create: { date, isClosed: false },
      update: { isClosed: false },
    });
    res.status(200).json({ success: true, message: 'Session opened successfully', data: session });
  } catch (error) {
    next(error);
  }
});

router.put('/close', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const date = String(req.query.date || todayString());
    const session = await prisma.session.upsert({
      where: { date },
      create: { date, isClosed: true },
      update: { isClosed: true },
    });
    res.status(200).json({ success: true, message: 'Session closed successfully', data: session });
  } catch (error) {
    next(error);
  }
});

router.get('/dashboard', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const date = String(req.query.date || todayString());

    const [registeredUsers, activeServices, appointments, schedule, session] = await Promise.all([
      prisma.user.count(),
      prisma.service.count({ where: { isActive: true } }),
      prisma.booking.findMany({ where: { date } }),
      prisma.schedule.findUnique({ where: { date } }),
      prisma.session.findUnique({ where: { date } }),
    ]);

    const sessionStatus = !schedule
      ? 'NO_SCHEDULE'
      : schedule.status === 'OPEN' && !session?.isClosed
        ? 'OPEN'
        : 'CLOSED';

    const trend = await Promise.all(
      Array.from({ length: 7 }).map(async (_, index) => {
        const day = new Date();
        day.setDate(day.getDate() - (6 - index));

        const start = new Date(day);
        start.setHours(0, 0, 0, 0);
        const end = new Date(start);
        end.setDate(end.getDate() + 1);

        const key = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
        const count = await prisma.user.count({
          where: { createdAt: { gte: start, lt: end } },
        });

        return { day: key, count };
      })
    );

    const result = {
      date,
      sessionStatus,
      totalAppointments: appointments.length,
      inQueue: appointments.filter((a) => a.status === 'BOOKED' || a.status === 'IN_SERVICE').length,
      completed: appointments.filter((a) => a.status === 'COMPLETED').length,
      cancelled: appointments.filter((a) => a.status === 'CANCELLED').length,
      noShow: appointments.filter((a) => a.status === 'NO_SHOW').length,
      registeredUsers,
      activeServices,
      appointmentsToday: appointments.length,
      userRegistrationTrend: trend,
      averageAppointmentTime: schedule?.slotDurationMins ?? 30,
    };

    res.status(200).json({ success: true, message: 'Dashboard stats retrieved', data: result });
  } catch (error) {
    next(error);
  }
});

export default router;
