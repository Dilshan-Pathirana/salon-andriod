import { prisma } from '../../config';
import {
  BadRequestError,
  NotFoundError,
  generateTimeSlots,
  parseDateString,
} from '../../utils';
import { UpsertScheduleInput } from './schedule.validation';

export async function getScheduleByDate(dateStr: string) {
  const date = parseDateString(dateStr);

  const schedule = await prisma.schedule.findUnique({
    where: { date },
    include: {
      appointments: {
        where: {
          status: { in: ['BOOKED', 'IN_SERVICE'] },
        },
        select: {
          timeSlot: true,
          status: true,
        },
      },
    },
  });

  if (!schedule) {
    return null;
  }

  const allSlots = generateTimeSlots(
    schedule.startTime,
    schedule.endTime,
    schedule.slotDurationMins
  );

  const bookedSlots = new Set(schedule.appointments.map((a) => a.timeSlot));

  const slots = allSlots.map((slot) => ({
    time: slot,
    available: !bookedSlots.has(slot),
  }));

  return {
    id: schedule.id,
    date: dateStr,
    status: schedule.status,
    startTime: schedule.startTime,
    endTime: schedule.endTime,
    slotDurationMins: schedule.slotDurationMins,
    totalSlots: allSlots.length,
    availableSlots: allSlots.length - bookedSlots.size,
    bookedSlots: bookedSlots.size,
    slots,
  };
}

export async function getScheduleRange(startDateStr?: string, endDateStr?: string) {
  const where: Record<string, unknown> = {};

  if (startDateStr && endDateStr) {
    where.date = {
      gte: parseDateString(startDateStr),
      lte: parseDateString(endDateStr),
    };
  } else if (startDateStr) {
    where.date = { gte: parseDateString(startDateStr) };
  } else if (endDateStr) {
    where.date = { lte: parseDateString(endDateStr) };
  }

  const schedules = await prisma.schedule.findMany({
    where,
    orderBy: { date: 'asc' },
    include: {
      _count: {
        select: {
          appointments: true,
        },
      },
    },
  });

  return schedules.map((s) => ({
    id: s.id,
    date: s.date.toISOString().split('T')[0],
    status: s.status,
    startTime: s.startTime,
    endTime: s.endTime,
    slotDurationMins: s.slotDurationMins,
    appointmentCount: s._count.appointments,
  }));
}

export async function upsertSchedule(data: UpsertScheduleInput, forceSlotChange = false) {
  const date = parseDateString(data.date);

  // Check if schedule exists
  const existing = await prisma.schedule.findUnique({
    where: { date },
    include: {
      appointments: {
        where: {
          status: { in: ['BOOKED', 'IN_SERVICE'] },
        },
      },
    },
  });

  // If changing slot duration and there are existing future bookings
  if (existing && existing.appointments.length > 0) {
    if (existing.slotDurationMins !== data.slotDurationMins && !forceSlotChange) {
      throw new BadRequestError(
        `Cannot change slot duration: ${existing.appointments.length} active booking(s) exist for this date. Set forceSlotChange=true to confirm.`
      );
    }

    // If closing a day with existing bookings
    if (data.status !== 'OPEN' && existing.status === 'OPEN') {
      throw new BadRequestError(
        `Cannot close this date: ${existing.appointments.length} active booking(s) exist. Cancel them first.`
      );
    }
  }

  const schedule = await prisma.schedule.upsert({
    where: { date },
    create: {
      date,
      status: data.status,
      startTime: data.startTime,
      endTime: data.endTime,
      slotDurationMins: data.slotDurationMins,
    },
    update: {
      status: data.status,
      startTime: data.startTime,
      endTime: data.endTime,
      slotDurationMins: data.slotDurationMins,
    },
  });

  return {
    id: schedule.id,
    date: data.date,
    status: schedule.status,
    startTime: schedule.startTime,
    endTime: schedule.endTime,
    slotDurationMins: schedule.slotDurationMins,
  };
}

export async function getAvailableDays(startDateStr: string, endDateStr: string) {
  const startDate = parseDateString(startDateStr);
  const endDate = parseDateString(endDateStr);

  const schedules = await prisma.schedule.findMany({
    where: {
      date: { gte: startDate, lte: endDate },
      status: 'OPEN',
    },
    orderBy: { date: 'asc' },
    include: {
      appointments: {
        where: { status: { in: ['BOOKED', 'IN_SERVICE'] } },
        select: { timeSlot: true },
      },
    },
  });

  return schedules.map((s) => {
    const allSlots = generateTimeSlots(s.startTime, s.endTime, s.slotDurationMins);
    const bookedCount = s.appointments.length;

    return {
      date: s.date.toISOString().split('T')[0],
      status: s.status,
      startTime: s.startTime,
      endTime: s.endTime,
      slotDurationMins: s.slotDurationMins,
      totalSlots: allSlots.length,
      availableSlots: allSlots.length - bookedCount,
    };
  });
}
