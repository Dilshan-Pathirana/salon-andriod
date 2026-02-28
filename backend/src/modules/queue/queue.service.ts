import { prisma } from '../../config';
import {
  BadRequestError,
  parseDateString,
  getTodayDate,
  formatDate,
} from '../../utils';
import { ReorderQueueInput } from './queue.validation';
import { getSocketIO } from '../../socket/socket.server';

export async function getLiveQueue(dateStr?: string) {
  const date = dateStr ? parseDateString(dateStr) : getTodayDate();
  const dateString = dateStr || formatDate(getTodayDate());

  const appointments = await prisma.appointment.findMany({
    where: {
      date,
      status: { in: ['BOOKED', 'IN_SERVICE'] },
    },
    orderBy: { queuePosition: 'asc' },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phoneNumber: true,
        },
      },
      schedule: {
        select: {
          slotDurationMins: true,
        },
      },
    },
  });

  const currentlyServing = appointments.find((a) => a.status === 'IN_SERVICE') || null;

  const queue = appointments.map((a, index) => ({
    id: a.id,
    position: a.queuePosition,
    name: `${a.user.firstName} ${a.user.lastName}`,
    userId: a.user.id,
    phoneNumber: a.user.phoneNumber,
    timeSlot: a.timeSlot,
    status: a.status,
    slotDurationMins: a.schedule.slotDurationMins,
  }));

  // Calculate estimated wait times
  const queueWithWait = queue.map((item, index) => {
    const itemsAhead = queue
      .slice(0, index)
      .filter((q) => q.status !== 'IN_SERVICE');
    const estimatedWaitMins = itemsAhead.length * (item.slotDurationMins || 20);

    return {
      ...item,
      estimatedWaitMins,
    };
  });

  return {
    date: dateString,
    currentlyServing: currentlyServing
      ? {
          id: currentlyServing.id,
          name: `${currentlyServing.user.firstName} ${currentlyServing.user.lastName}`,
          timeSlot: currentlyServing.timeSlot,
          phoneNumber: currentlyServing.user.phoneNumber,
        }
      : null,
    queue: queueWithWait,
    totalInQueue: appointments.length,
  };
}

export async function reorderQueue(data: ReorderQueueInput) {
  const date = parseDateString(data.date);

  // Verify all IDs belong to active appointments on the given date
  const appointments = await prisma.appointment.findMany({
    where: {
      date,
      status: { in: ['BOOKED', 'IN_SERVICE'] },
    },
  });

  const activeIds = new Set(appointments.map((a) => a.id));

  for (const id of data.orderedIds) {
    if (!activeIds.has(id)) {
      throw new BadRequestError(`Appointment ${id} is not an active appointment for this date`);
    }
  }

  // Update positions in a transaction
  await prisma.$transaction(
    data.orderedIds.map((id, index) =>
      prisma.appointment.update({
        where: { id },
        data: { queuePosition: index + 1 },
      })
    )
  );

  // Emit queue update
  try {
    const io = getSocketIO();
    io.emit('queue_updated', { date: data.date });
  } catch {
    // Socket not initialized
  }

  return { message: 'Queue reordered successfully', date: data.date };
}
