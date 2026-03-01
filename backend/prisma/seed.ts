import { PrismaClient, Role, ServiceCategory } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log('🌱 Starting seed...');

  // Clean existing data
  await prisma.review.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.session.deleteMany();
  await prisma.schedule.deleteMany();
  await prisma.user.deleteMany();
  await prisma.service.deleteMany();
  await prisma.galleryItem.deleteMany();
  await prisma.businessInfo.deleteMany();

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

  // Create client user
  const clientPassword = await bcrypt.hash('client12345', 12);
  const client = await prisma.user.create({
    data: {
      phoneNumber: '0771234567',
      passwordHash: clientPassword,
      firstName: 'John',
      lastName: 'Doe',
      role: Role.CLIENT,
      isActive: true,
    },
  });
  console.log(`✅ Client created: ${client.phoneNumber} / client12345`);

  // Create default services
  const services = await Promise.all([
    prisma.service.create({
      data: { name: 'Classic Haircut', description: 'Traditional men\'s haircut with precision styling', duration: 20, price: 1500, category: ServiceCategory.HAIRCUT, sortOrder: 1 },
    }),
    prisma.service.create({
      data: { name: 'Fade Haircut', description: 'Modern fade with clean lines and blending', duration: 30, price: 2000, category: ServiceCategory.HAIRCUT, sortOrder: 2 },
    }),
    prisma.service.create({
      data: { name: 'Premium Haircut', description: 'Premium cut with wash, style, and finishing', duration: 40, price: 3000, category: ServiceCategory.PREMIUM, sortOrder: 3 },
    }),
    prisma.service.create({
      data: { name: 'Beard Trim', description: 'Professional beard shaping and trimming', duration: 15, price: 800, category: ServiceCategory.BEARD, sortOrder: 4 },
    }),
    prisma.service.create({
      data: { name: 'Beard Styling', description: 'Full beard styling with hot towel treatment', duration: 25, price: 1500, category: ServiceCategory.BEARD, sortOrder: 5 },
    }),
    prisma.service.create({
      data: { name: 'Haircut + Beard Combo', description: 'Complete haircut and beard grooming package', duration: 45, price: 2500, category: ServiceCategory.COMBO, sortOrder: 6 },
    }),
    prisma.service.create({
      data: { name: 'Premium Combo', description: 'Premium haircut, beard styling, and face treatment', duration: 60, price: 4500, category: ServiceCategory.COMBO, sortOrder: 7 },
    }),
    prisma.service.create({
      data: { name: 'Royal Treatment', description: 'Full luxury experience: cut, beard, facial, massage', duration: 90, price: 6000, category: ServiceCategory.PREMIUM, sortOrder: 8 },
    }),
  ]);
  console.log(`✅ ${services.length} services created`);

  // Create default gallery items
  const galleryItems = await Promise.all([
    prisma.galleryItem.create({
      data: { title: 'Classic Fade', description: 'Clean low fade with textured top', imageUrl: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400', category: 'Haircut', sortOrder: 1 },
    }),
    prisma.galleryItem.create({
      data: { title: 'Modern Pompadour', description: 'Slicked back pompadour with skin fade', imageUrl: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=400', category: 'Haircut', sortOrder: 2 },
    }),
    prisma.galleryItem.create({
      data: { title: 'Beard Sculpting', description: 'Precision beard shaping and line up', imageUrl: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=400', category: 'Beard', sortOrder: 3 },
    }),
    prisma.galleryItem.create({
      data: { title: 'Textured Crop', description: 'Short textured crop with fringe', imageUrl: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400', category: 'Fade', sortOrder: 4 },
    }),
  ]);
  console.log(`✅ ${galleryItems.length} gallery items created`);

  // Create default business info
  const businessInfoItems = [
    // About section
    { key: 'salon_name', value: 'Premium Men\'s Salon', category: 'about' },
    { key: 'salon_story', value: 'Founded with a passion for men\'s grooming, we deliver premium barbering services in a luxury environment. Our skilled barbers combine traditional techniques with modern styling to give you the perfect look.', category: 'about' },
    { key: 'mission', value: 'To provide every gentleman with a premium grooming experience that boosts confidence and style.', category: 'about' },
    { key: 'experience_years', value: '5', category: 'about' },
    { key: 'opening_hours', value: 'Mon-Sat: 9:00 AM - 6:00 PM\nSunday: Closed', category: 'about' },
    // Contact section
    { key: 'phone', value: '+94712345678', category: 'contact' },
    { key: 'whatsapp', value: '+94712345678', category: 'contact' },
    { key: 'email', value: 'info@premiumsalon.com', category: 'contact' },
    { key: 'instagram', value: 'https://instagram.com/premiumsalon', category: 'contact' },
    { key: 'facebook', value: 'https://facebook.com/premiumsalon', category: 'contact' },
    { key: 'google_maps', value: 'https://maps.google.com/?q=6.9271,79.8612', category: 'contact' },
    { key: 'address', value: '123 Main Street, Colombo 03, Sri Lanka', category: 'contact' },
  ];

  await Promise.all(
    businessInfoItems.map((item) =>
      prisma.businessInfo.create({ data: item })
    )
  );
  console.log(`✅ ${businessInfoItems.length} business info items created`);

  console.log('\n🎉 Seed completed successfully!');
  console.log('\n📋 Login credentials:');
  console.log('  Admin:  0712345678 / admin12345');
  console.log('  Client: 0771234567 / client12345');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
