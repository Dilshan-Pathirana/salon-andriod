import { Router } from 'express';
import { Booking } from '../models/Booking';
import { Schedule } from '../models/Schedule';
import { Service } from '../models/Service';
import { Session } from '../models/Session';
import { User } from '../models/User';
import { authenticate, requireAdmin, todayString } from './helpers';

const router = Router();

router.get('/', authenticate, async (req, res, next) => {
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

router.post('/open', authenticate, requireAdmin, async (req, res, next) => {
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

router.put('/close', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const date = String(req.query.date || todayString());
    const session = await Session.findOneAndUpdate({ date }, { date, isClosed: true }, { upsert: true, new: true }).lean();
    res.status(200).json({ success: true, message: 'Session closed successfully', data: session });
  } catch (error) {
    next(error);
  }
});

router.get('/dashboard', authenticate, requireAdmin, async (req, res, next) => {
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

    const trend = await Promise.all(
      Array.from({ length: 7 }).map(async (_, index) => {
        const day = new Date();
        day.setDate(day.getDate() - (6 - index));

        const start = new Date(day);
        start.setHours(0, 0, 0, 0);
        const end = new Date(start);
        end.setDate(end.getDate() + 1);

        const key = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
        const count = await User.countDocuments({ createdAt: { $gte: start, $lt: end } });

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

export default router;
