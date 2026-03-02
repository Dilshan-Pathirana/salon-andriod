const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: { phoneNumber: true, role: true },
    orderBy: { phoneNumber: 'asc' },
  });

  const [services, appointments, schedules, sessions, reviews, galleryItems, businessInfo, refreshTokens] = await Promise.all([
    prisma.service.count(),
    prisma.appointment.count(),
    prisma.schedule.count(),
    prisma.session.count(),
    prisma.review.count(),
    prisma.galleryItem.count(),
    prisma.businessInfo.count(),
    prisma.refreshToken.count(),
  ]);

  console.log(
    JSON.stringify(
      {
        users,
        services,
        appointments,
        schedules,
        sessions,
        reviews,
        galleryItems,
        businessInfo,
        refreshTokens,
      },
      null,
      2
    )
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
