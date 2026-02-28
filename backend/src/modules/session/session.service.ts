import { prisma } from '../../config';
import {
  BadRequestError,
  NotFoundError,
  parseDateString,
  getTodayDate,
  formatDate,
} from '../../utils';
import { getSocketIO } from '../../socket/socket.server';

export async function getSession(dateStr?: string) {
  const date = dateStr ? parseDateString(dateStr) : getTodayDate();

  const session = await prisma.session.findUnique({
    where: { date },
  });

  if (!session) {
    return {
      date: dateStr || formatDate(getTodayDate()),
      isClosed: false,
      exists: false,
      openedAt: null,
      closedAt: null,
    };
  }

  return {
    id: session.id,
    date: session.date.toISOString().split('T')[0],
    isClosed: session.isClosed,
    exists: true,
    openedAt: session.openedAt,
    closedAt: session.closedAt,
  };
}

export async function openSession(dateStr: string) {
  const date = parseDateString(dateStr);

  // Check schedule exists and is open
  const schedule = await prisma.schedule.findUnique({ where: { date } });
  if (!schedule || schedule.status !== 'OPEN') {
    throw new BadRequestError('Cannot open session: date is not scheduled as open');
  }

  // Upsert session
  const session = await prisma.session.upsert({
    where: { date },
    create: {
      date,
      isClosed: false,
    },
    update: {
      isClosed: false,
      closedAt: null,
    },
  });

  return {
    id: session.id,
    date: dateStr,
    isClosed: session.isClosed,
    openedAt: session.openedAt,
  };
}

export async function closeSession(dateStr?: string) {
  const date = dateStr ? parseDateString(dateStr) : getTodayDate();
  const dateString = dateStr || formatDate(getTodayDate());

  // Check for active queue items
  const activeAppointments = await prisma.appointment.findMany({
    where: {
      date,
      status: { in: ['BOOKED', 'IN_SERVICE'] },
    },
  });

  if (activeAppointments.length > 0) {
    throw new BadRequestError(
      `Cannot close session: ${activeAppointments.length} active appointment(s) remaining. Complete or cancel them first.`
    );
  }

  const session = await prisma.session.upsert({
    where: { date },
    create: {
      date,
      isClosed: true,
      closedAt: new Date(),
    },
    update: {
      isClosed: true,
      closedAt: new Date(),
    },
  });

  // Emit session closed event
  try {
    const io = getSocketIO();
    io.emit('session_closed', { date: dateString });
  } catch {
    // Socket not initialized
  }

  return {
    id: session.id,
    date: dateString,
    isClosed: session.isClosed,
    closedAt: session.closedAt,
  };
}

export async function getDashboardStats(dateStr?: string) {
  const date = dateStr ? parseDateString(dateStr) : getTodayDate();

  const [
    totalAppointments,
    inQueue,
    completed,
    cancelled,
    noShow,
    session,
    schedule,
  ] = await Promise.all([
    prisma.appointment.count({ where: { date } }),
    prisma.appointment.count({
      where: { date, status: { in: ['BOOKED', 'IN_SERVICE'] } },
    }),
    prisma.appointment.count({ where: { date, status: 'COMPLETED' } }),
    prisma.appointment.count({ where: { date, status: 'CANCELLED' } }),
    prisma.appointment.count({ where: { date, status: 'NO_SHOW' } }),
    prisma.session.findUnique({ where: { date } }),
    prisma.schedule.findUnique({ where: { date } }),
  ]);

  return {
    date: dateStr || formatDate(getTodayDate()),
    sessionStatus: session?.isClosed ? 'CLOSED' : schedule?.status === 'OPEN' ? 'OPEN' : 'NO_SCHEDULE',
    totalAppointments,
    inQueue,
    completed,
    cancelled,
    noShow,
  };
}
