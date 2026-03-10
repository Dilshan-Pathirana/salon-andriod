import { AppointmentStatus, Prisma } from '@prisma/client';
import { prisma } from '../../config';
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
  generateTimeSlots,
  parseDateString,
  getTodayDate,
} from '../../utils';
import { CreateAppointmentInput, UpdateAppointmentInput } from './appointments.validation';
import { getSocketIO } from '../../socket/socket.server';

export async function createAppointment(userId: string, data: CreateAppointmentInput) {
  const date = parseDateString(data.date);
  const today = getTodayDate();
  const maxAdvanceDate = new Date(today);
  maxAdvanceDate.setUTCDate(maxAdvanceDate.getUTCDate() + 5);

  if (date < today) {
    throw new BadRequestError('Cannot book appointments in the past');
  }

  if (date > maxAdvanceDate) {
    throw new BadRequestError('You can only book for today and the next 5 days');
  }

  // Use a serializable transaction to prevent race conditions
  return await prisma.$transaction(async (tx) => {
    // 1. Check schedule exists and is open
    const schedule = await tx.schedule.findUnique({
      where: { date },
    });

    if (!schedule) {
      throw new NotFoundError('No schedule found for this date');
    }

    if (schedule.status !== 'OPEN') {
      throw new BadRequestError('This date is not available for booking');
    }

    // 2. Check session is not closed
    const session = await tx.session.findUnique({
      where: { date },
    });

    if (session?.isClosed) {
      throw new BadRequestError('Session is closed for this date');
    }

    // 3. Validate the time slot is valid for this schedule
    const validSlots = generateTimeSlots(
      schedule.startTime,
      schedule.endTime,
      schedule.slotDurationMins
    );

    if (!validSlots.includes(data.timeSlot)) {
      throw new BadRequestError('Invalid time slot for this date');
    }

    // 4. Check for double booking (unique constraint also enforces this)
    const existingSlot = await tx.appointment.findFirst({
      where: {
        date,
        timeSlot: data.timeSlot,
        status: { in: ['BOOKED', 'IN_SERVICE'] },
      },
    });

    if (existingSlot) {
      throw new ConflictError('This time slot is already booked');
    }

    // 5. Enforce max two active bookings per user
    const activeBookingCount = await tx.appointment.count({
      where: {
        userId,
        date: { gte: today },
        status: { in: ['BOOKED', 'IN_SERVICE'] },
      },
    });

    if (activeBookingCount >= 2) {
      throw new ConflictError('You can only hold a maximum of 2 active bookings');
    }

    // 6. Calculate queue position
    const lastPosition = await tx.appointment.findFirst({
      where: {
        date,
        status: { in: ['BOOKED', 'IN_SERVICE'] },
      },
      orderBy: { queuePosition: 'desc' },
      select: { queuePosition: true },
    });

    const queuePosition = (lastPosition?.queuePosition ?? 0) + 1;

    // 7. Create appointment
    const appointment = await tx.appointment.create({
      data: {
        userId,
        scheduleId: schedule.id,
        date,
        timeSlot: data.timeSlot,
        queuePosition,
        status: 'BOOKED',
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phoneNumber: true,
          },
        },
      },
    });

    return {
      id: appointment.id,
      date: data.date,
      timeSlot: appointment.timeSlot,
      queuePosition: appointment.queuePosition,
      status: appointment.status,
      user: appointment.user,
      createdAt: appointment.createdAt,
    };
  }, {
    isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    timeout: 10000,
  });
}

export async function getAppointments(filters: {
  date?: string;
  status?: AppointmentStatus;
  userId?: string;
}) {
  const where: Prisma.AppointmentWhereInput = {};

  if (filters.date) {
    where.date = parseDateString(filters.date);
  }
  if (filters.status) {
    where.status = filters.status;
  }
  if (filters.userId) {
    where.userId = filters.userId;
  }

  const appointments = await prisma.appointment.findMany({
    where,
    orderBy: [{ date: 'asc' }, { queuePosition: 'asc' }],
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phoneNumber: true,
        },
      },
    },
  });

  return appointments.map((a) => ({
    id: a.id,
    date: a.date.toISOString().split('T')[0],
    timeSlot: a.timeSlot,
    queuePosition: a.queuePosition,
    status: a.status,
    user: a.user,
    createdAt: a.createdAt,
  }));
}

export async function getAppointmentById(id: string) {
  const appointment = await prisma.appointment.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phoneNumber: true,
        },
      },
    },
  });

  if (!appointment) {
    throw new NotFoundError('Appointment not found');
  }

  return {
    id: appointment.id,
    date: appointment.date.toISOString().split('T')[0],
    timeSlot: appointment.timeSlot,
    queuePosition: appointment.queuePosition,
    status: appointment.status,
    user: appointment.user,
    createdAt: appointment.createdAt,
  };
}

export async function getUserAppointments(userId: string) {
  const appointments = await prisma.appointment.findMany({
    where: { userId },
    orderBy: [{ date: 'desc' }, { timeSlot: 'asc' }],
    include: {
      schedule: {
        select: {
          slotDurationMins: true,
        },
      },
    },
  });

  return appointments.map((a) => ({
    id: a.id,
    date: a.date.toISOString().split('T')[0],
    timeSlot: a.timeSlot,
    queuePosition: a.queuePosition,
    status: a.status,
    slotDurationMins: a.schedule.slotDurationMins,
    createdAt: a.createdAt,
  }));
}

export async function updateAppointment(id: string, data: UpdateAppointmentInput) {
  const appointment = await prisma.appointment.findUnique({ where: { id } });

  if (!appointment) {
    throw new NotFoundError('Appointment not found');
  }

  if (appointment.status === 'COMPLETED' || appointment.status === 'CANCELLED') {
    throw new BadRequestError('Cannot update a completed or cancelled appointment');
  }

  const updateData: Prisma.AppointmentUpdateInput = {};

  if (data.status) {
    updateData.status = data.status;
  }

  if (data.timeSlot) {
    const date = data.date ? parseDateString(data.date) : appointment.date;

    // Check new slot not taken
    const existing = await prisma.appointment.findFirst({
      where: {
        date,
        timeSlot: data.timeSlot,
        status: { in: ['BOOKED', 'IN_SERVICE'] },
        id: { not: id },
      },
    });

    if (existing) {
      throw new ConflictError('The new time slot is already booked');
    }

    updateData.timeSlot = data.timeSlot;
  }

  if (data.date) {
    updateData.date = parseDateString(data.date);
  }

  const updated = await prisma.appointment.update({
    where: { id },
    data: updateData,
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phoneNumber: true,
        },
      },
    },
  });

  // Emit queue update
  try {
    const io = getSocketIO();
    io.emit('queue_updated', {
      date: updated.date.toISOString().split('T')[0],
    });
  } catch {
    // Socket not initialized yet
  }

  return {
    id: updated.id,
    date: updated.date.toISOString().split('T')[0],
    timeSlot: updated.timeSlot,
    queuePosition: updated.queuePosition,
    status: updated.status,
    user: updated.user,
    createdAt: updated.createdAt,
  };
}

export async function cancelAppointment(id: string, userId: string, isAdmin: boolean) {
  const appointment = await prisma.appointment.findUnique({ where: { id } });

  if (!appointment) {
    throw new NotFoundError('Appointment not found');
  }

  // Non-admin can only cancel own appointment
  if (!isAdmin && appointment.userId !== userId) {
    throw new ForbiddenError('You can only cancel your own appointment');
  }

  if (appointment.status === 'COMPLETED') {
    throw new BadRequestError('Cannot cancel a completed appointment');
  }

  if (appointment.status === 'CANCELLED') {
    throw new BadRequestError('Appointment is already cancelled');
  }

  // Check if past date
  const today = getTodayDate();
  if (appointment.date < today) {
    throw new BadRequestError('Cannot cancel a past appointment');
  }

  const updated = await prisma.appointment.update({
    where: { id },
    data: { status: 'CANCELLED' },
  });

  // Emit queue update
  try {
    const io = getSocketIO();
    io.emit('queue_updated', {
      date: updated.date.toISOString().split('T')[0],
    });
  } catch {
    // Socket not initialized yet
  }

  return {
    id: updated.id,
    date: updated.date.toISOString().split('T')[0],
    timeSlot: updated.timeSlot,
    queuePosition: updated.queuePosition,
    status: updated.status,
  };
}

export async function completeAppointment(id: string) {
  const appointment = await prisma.appointment.findUnique({ where: { id } });

  if (!appointment) {
    throw new NotFoundError('Appointment not found');
  }

  if (appointment.status === 'COMPLETED') {
    throw new BadRequestError('Appointment is already completed');
  }

  if (appointment.status === 'CANCELLED') {
    throw new BadRequestError('Cannot complete a cancelled appointment');
  }

  const updated = await prisma.appointment.update({
    where: { id },
    data: { status: 'COMPLETED' },
  });

  // Emit events
  try {
    const io = getSocketIO();
    io.emit('appointment_completed', {
      appointmentId: updated.id,
      date: updated.date.toISOString().split('T')[0],
    });
    io.emit('queue_updated', {
      date: updated.date.toISOString().split('T')[0],
    });
  } catch {
    // Socket not initialized yet
  }

  return {
    id: updated.id,
    date: updated.date.toISOString().split('T')[0],
    timeSlot: updated.timeSlot,
    queuePosition: updated.queuePosition,
    status: updated.status,
  };
}

export async function markInService(id: string) {
  const appointment = await prisma.appointment.findUnique({ where: { id } });

  if (!appointment) {
    throw new NotFoundError('Appointment not found');
  }

  if (appointment.status !== 'BOOKED') {
    throw new BadRequestError('Only booked appointments can be marked as in service');
  }

  const updated = await prisma.appointment.update({
    where: { id },
    data: { status: 'IN_SERVICE' },
  });

  try {
    const io = getSocketIO();
    io.emit('queue_updated', {
      date: updated.date.toISOString().split('T')[0],
    });
  } catch {
    // Socket not initialized yet
  }

  return {
    id: updated.id,
    date: updated.date.toISOString().split('T')[0],
    timeSlot: updated.timeSlot,
    queuePosition: updated.queuePosition,
    status: updated.status,
  };
}

export async function markNoShow(id: string) {
  const appointment = await prisma.appointment.findUnique({ where: { id } });

  if (!appointment) {
    throw new NotFoundError('Appointment not found');
  }

  if (appointment.status === 'COMPLETED' || appointment.status === 'CANCELLED') {
    throw new BadRequestError('Cannot mark completed or cancelled appointment as no-show');
  }

  const updated = await prisma.appointment.update({
    where: { id },
    data: { status: 'NO_SHOW' },
  });

  try {
    const io = getSocketIO();
    io.emit('queue_updated', {
      date: updated.date.toISOString().split('T')[0],
    });
  } catch {
    // Socket not initialized yet
  }

  return {
    id: updated.id,
    date: updated.date.toISOString().split('T')[0],
    timeSlot: updated.timeSlot,
    queuePosition: updated.queuePosition,
    status: updated.status,
  };
}

export async function deleteAppointment(id: string) {
  const appointment = await prisma.appointment.findUnique({ where: { id } });

  if (!appointment) {
    throw new NotFoundError('Appointment not found');
  }

  await prisma.appointment.delete({ where: { id } });

  try {
    const io = getSocketIO();
    io.emit('queue_updated', {
      date: appointment.date.toISOString().split('T')[0],
    });
  } catch {
    // Socket not initialized yet
  }
}
