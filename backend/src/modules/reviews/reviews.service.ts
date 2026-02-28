import { prisma } from '../../config';
import { BadRequestError, ConflictError, ForbiddenError, NotFoundError } from '../../utils';
import { CreateReviewInput } from './reviews.validation';

export async function getAllReviews(onlyVisible = true) {
  const where = onlyVisible ? { isVisible: true } : {};
  const reviews = await prisma.review.findMany({
    where,
    include: {
      user: { select: { id: true, firstName: true, lastName: true, profileImageUrl: true } },
      appointment: { select: { id: true, date: true, timeSlot: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  return reviews;
}

export async function getReviewStats() {
  const result = await prisma.review.aggregate({
    where: { isVisible: true },
    _avg: { rating: true },
    _count: { rating: true },
  });
  const distribution = await prisma.review.groupBy({
    by: ['rating'],
    where: { isVisible: true },
    _count: { rating: true },
    orderBy: { rating: 'desc' },
  });
  return {
    averageRating: result._avg.rating ? Math.round(result._avg.rating * 10) / 10 : 0,
    totalReviews: result._count.rating,
    distribution: distribution.map((d) => ({ rating: d.rating, count: d._count.rating })),
  };
}

export async function createReview(userId: string, data: CreateReviewInput) {
  // Verify the appointment belongs to the user and is completed
  const appointment = await prisma.appointment.findUnique({
    where: { id: data.appointmentId },
    include: { review: true },
  });

  if (!appointment) throw new NotFoundError('Appointment not found');
  if (appointment.userId !== userId) throw new ForbiddenError('You can only review your own appointments');
  if (appointment.status !== 'COMPLETED') throw new BadRequestError('Can only review completed appointments');
  if (appointment.review) throw new ConflictError('A review already exists for this appointment');

  return prisma.review.create({
    data: {
      userId,
      appointmentId: data.appointmentId,
      rating: data.rating,
      comment: data.comment ?? null,
    },
    include: {
      user: { select: { id: true, firstName: true, lastName: true, profileImageUrl: true } },
      appointment: { select: { id: true, date: true, timeSlot: true } },
    },
  });
}

export async function deleteReview(id: string) {
  const review = await prisma.review.findUnique({ where: { id } });
  if (!review) throw new NotFoundError('Review not found');
  await prisma.review.delete({ where: { id } });
}

export async function toggleVisibility(id: string) {
  const review = await prisma.review.findUnique({ where: { id } });
  if (!review) throw new NotFoundError('Review not found');

  return prisma.review.update({
    where: { id },
    data: { isVisible: !review.isVisible },
    include: {
      user: { select: { id: true, firstName: true, lastName: true, profileImageUrl: true } },
      appointment: { select: { id: true, date: true, timeSlot: true } },
    },
  });
}
