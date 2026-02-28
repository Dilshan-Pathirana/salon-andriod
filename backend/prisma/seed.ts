import { PrismaClient, Role, DayStatus, AppointmentStatus } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log('🌱 Starting seed...');

  // Clean existing data
  await prisma.refreshToken.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.session.deleteMany();
  await prisma.schedule.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Cleaned existing data');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin12345', 12);
  const admin = await prisma.user.create({
    data: {
      phoneNumber: '0712345678',
      passwordHash: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: Role.ADMIN,
      isActive: true,
    },
  });
  console.log(`✅ Admin created: ${admin.phoneNumber} / admin12345`);

  // Create client users
  const clientPassword = await bcrypt.hash('client12345', 12);
  const clients = await Promise.all([
    prisma.user.create({
      data: {
        phoneNumber: '0771234567',
        passwordHash: clientPassword,
        firstName: 'John',
        lastName: 'Doe',
        role: Role.CLIENT,
        isActive: true,
      },
    }),
    prisma.user.create({
      data: {
        phoneNumber: '0761234567',
        passwordHash: clientPassword,
        firstName: 'David',
        lastName: 'Smith',
        role: Role.CLIENT,
        isActive: true,
      },
    }),
    prisma.user.create({
      data: {
        phoneNumber: '0751234567',
        passwordHash: clientPassword,
        firstName: 'Kumar',
        lastName: 'Perera',
        role: Role.CLIENT,
        isActive: true,
      },
    }),
    prisma.user.create({
      data: {
        phoneNumber: '0741234567',
        passwordHash: clientPassword,
        firstName: 'Sarah',
        lastName: 'Johnson',
        role: Role.CLIENT,
        isActive: true,
      },
    }),
  ]);
  console.log(`✅ Created ${clients.length} client users (password: client12345)`);

  // Create schedules for next 14 days
  const today = new Date();
  const schedules = [];

  for (let i = 0; i < 14; i++) {
    const date = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate() + i));
    const dayOfWeek = date.getUTCDay();

    // Close on Sundays (0)
    const status: DayStatus = dayOfWeek === 0 ? DayStatus.CLOSED : DayStatus.OPEN;

    const schedule = await prisma.schedule.create({
      data: {
        date,
        status,
        startTime: '09:00',
        endTime: '18:00',
        slotDurationMins: 20,
      },
    });
    schedules.push(schedule);
  }
  console.log(`✅ Created ${schedules.length} schedule days`);

  // Create today's session
  const todayDate = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
  await prisma.session.create({
    data: {
      date: todayDate,
      isClosed: false,
    },
  });
  console.log('✅ Created today\'s session');

  // Create some sample appointments for today
  const todaySchedule = schedules[0];
  if (todaySchedule && todaySchedule.status === DayStatus.OPEN) {
    const sampleAppointments = [
      { user: clients[0], timeSlot: '09:00', position: 1, status: AppointmentStatus.IN_SERVICE },
      { user: clients[1], timeSlot: '09:20', position: 2, status: AppointmentStatus.BOOKED },
      { user: clients[2], timeSlot: '09:40', position: 3, status: AppointmentStatus.BOOKED },
      { user: clients[3], timeSlot: '10:00', position: 4, status: AppointmentStatus.BOOKED },
    ];

    for (const apt of sampleAppointments) {
      await prisma.appointment.create({
        data: {
          userId: apt.user.id,
          scheduleId: todaySchedule.id,
          date: todayDate,
          timeSlot: apt.timeSlot,
          queuePosition: apt.position,
          status: apt.status,
        },
      });
    }
    console.log(`✅ Created ${sampleAppointments.length} sample appointments for today`);
  }

  console.log('\n🎉 Seed completed successfully!');
  console.log('\n📋 Login credentials:');
  console.log('  Admin: 0712345678 / admin12345');
  console.log('  Client: 0771234567 / client12345');
  console.log('  Client: 0761234567 / client12345');
  console.log('  Client: 0751234567 / client12345');
  console.log('  Client: 0741234567 / client12345');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
