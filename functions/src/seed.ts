/**
 * Firebase Seed Script
 * Run: cd functions && npx ts-node src/seed.ts
 *
 * Requires GOOGLE_APPLICATION_CREDENTIALS env var pointing to a service account key,
 * or run via: firebase functions:shell  then  require('./lib/seed').seedDatabase()
 */
import * as admin from 'firebase-admin';

// Initialize with service account or default credentials
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();
const auth = admin.auth();

async function deleteCollection(collectionPath: string) {
  const snapshot = await db.collection(collectionPath).get();
  const batch = db.batch();
  snapshot.docs.forEach((doc) => batch.delete(doc.ref));
  if (!snapshot.empty) await batch.commit();
}

export async function seedDatabase() {
  console.log('🌱 Starting Firebase seed...');

  // Clean existing data
  const collections = [
    'reviews', 'appointments', 'sessions', 'schedules',
    'services', 'gallery', 'businessInfo', 'users',
    'slotLocks', 'userDayLocks', 'queueCounters',
  ];
  for (const col of collections) {
    await deleteCollection(col);
    console.log(`  🧹 Cleaned ${col}`);
  }

  // Delete all Firebase Auth users
  const listResult = await auth.listUsers(1000);
  for (const user of listResult.users) {
    await auth.deleteUser(user.uid);
  }
  console.log(`  🧹 Cleaned Auth users (${listResult.users.length})`);

  // ── Create Admin User ──
  const adminEmail = '0712345678@salon.app';
  const adminRecord = await auth.createUser({
    email: adminEmail,
    password: 'admin12345',
    displayName: 'Admin User',
  });

  const now = admin.firestore.Timestamp.now();
  await db.collection('users').doc(adminRecord.uid).set({
    phoneNumber: '0712345678',
    firstName: 'Admin',
    lastName: 'User',
    role: 'ADMIN',
    profileImageUrl: null,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  });
  console.log('✅ Admin created: 0712345678 / admin12345');

  // ── Create Client User ──
  const clientEmail = '0771234567@salon.app';
  const clientRecord = await auth.createUser({
    email: clientEmail,
    password: 'client12345',
    displayName: 'Test Client',
  });

  await db.collection('users').doc(clientRecord.uid).set({
    phoneNumber: '0771234567',
    firstName: 'Test',
    lastName: 'Client',
    role: 'CLIENT',
    profileImageUrl: null,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  });
  console.log('✅ Client created: 0771234567 / client12345');

  // ── Services ──
  const services = [
    { name: 'Classic Haircut', description: "Traditional men's haircut with precision styling", duration: 20, price: 1500, category: 'HAIRCUT', sortOrder: 1 },
    { name: 'Fade Haircut', description: 'Modern fade with clean lines and blending', duration: 30, price: 2000, category: 'HAIRCUT', sortOrder: 2 },
    { name: 'Premium Haircut', description: 'Premium cut with wash, style, and finishing', duration: 40, price: 3000, category: 'PREMIUM', sortOrder: 3 },
    { name: 'Beard Trim', description: 'Professional beard shaping and trimming', duration: 15, price: 800, category: 'BEARD', sortOrder: 4 },
    { name: 'Beard Styling', description: 'Full beard styling with hot towel treatment', duration: 25, price: 1500, category: 'BEARD', sortOrder: 5 },
    { name: 'Haircut + Beard Combo', description: 'Complete haircut and beard grooming package', duration: 45, price: 2500, category: 'COMBO', sortOrder: 6 },
    { name: 'Premium Combo', description: 'Premium haircut, beard styling, and face treatment', duration: 60, price: 4500, category: 'COMBO', sortOrder: 7 },
    { name: 'Royal Treatment', description: 'Full luxury experience: cut, beard, facial, massage', duration: 90, price: 6000, category: 'PREMIUM', sortOrder: 8 },
  ];

  for (const svc of services) {
    await db.collection('services').doc().set({ ...svc, isActive: true, createdAt: now, updatedAt: now });
  }
  console.log(`✅ ${services.length} services created`);

  // ── Gallery ──
  const galleryItems = [
    { title: 'Classic Fade', description: 'Clean low fade with textured top', imageUrl: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400', category: 'Haircut', sortOrder: 1 },
    { title: 'Modern Pompadour', description: 'Slicked back pompadour with skin fade', imageUrl: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=400', category: 'Haircut', sortOrder: 2 },
    { title: 'Beard Sculpting', description: 'Precision beard shaping and line up', imageUrl: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=400', category: 'Beard', sortOrder: 3 },
    { title: 'Textured Crop', description: 'Short textured crop with fringe', imageUrl: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400', category: 'Fade', sortOrder: 4 },
  ];

  for (const item of galleryItems) {
    await db.collection('gallery').doc().set({ ...item, isActive: true, createdAt: now, updatedAt: now });
  }
  console.log(`✅ ${galleryItems.length} gallery items created`);

  // ── Business Info ──
  const businessInfoItems = [
    { key: 'salon_name', value: 'Elite Cuts', category: 'about' },
    { key: 'salon_story', value: 'Founded in 2020, Elite Cuts brings premium grooming to your neighborhood.', category: 'about' },
    { key: 'salon_tagline', value: 'Where Style Meets Precision', category: 'about' },
    { key: 'salon_address', value: '123 Main Street, Colombo 07', category: 'contact' },
    { key: 'phone', value: '+94 71 234 5678', category: 'contact' },
    { key: 'whatsapp', value: '+94 71 234 5678', category: 'contact' },
    { key: 'email', value: 'info@elitecuts.lk', category: 'contact' },
    { key: 'instagram', value: 'https://instagram.com/elitecuts', category: 'contact' },
    { key: 'facebook', value: 'https://facebook.com/elitecuts', category: 'contact' },
    { key: 'opening_hours', value: 'Mon-Sat: 9:00 AM - 6:00 PM', category: 'about' },
    { key: 'established_year', value: '2020', category: 'about' },
    { key: 'team_size', value: '5', category: 'about' },
  ];

  for (const item of businessInfoItems) {
    await db.collection('businessInfo').doc(item.key).set({ value: item.value, category: item.category, createdAt: now, updatedAt: now });
  }
  console.log(`✅ ${businessInfoItems.length} business info items created`);

  console.log('\n🎉 Seed completed successfully!');
  console.log('\n📋 Login credentials:');
  console.log('  Admin:  0712345678 / admin12345');
  console.log('  Client: 0771234567 / client12345');
}

// Run if executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Seed failed:', err);
      process.exit(1);
    });
}
