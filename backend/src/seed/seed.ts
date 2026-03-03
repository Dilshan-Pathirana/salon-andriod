import { Service } from '../models/Service';
import { TeamMember } from '../models/TeamMember';
import { User } from '../models/User';
import bcrypt from 'bcryptjs';
import { connectDatabase, disconnectDatabase } from '../config/db';

const serviceSeeds = [
  {
    name: 'Signature Cut',
    description: 'Precision haircut with wash, styling and finishing.',
    durationMinutes: 45,
    price: 1800,
    icon: 'Scissors',
    category: 'HAIRCUT',
    isActive: true,
  },
  {
    name: 'Color & Tone',
    description: 'Custom color blend with gloss and color-protect treatment.',
    durationMinutes: 120,
    price: 4800,
    icon: 'Sparkles',
    category: 'PREMIUM',
    isActive: true,
  },
  {
    name: 'Beard Sculpt',
    description: 'Clean beard shaping, line detailing and steam towel finish.',
    durationMinutes: 30,
    price: 1200,
    icon: 'ShieldCheck',
    category: 'BEARD',
    isActive: true,
  },
  {
    name: 'Royal Treatment',
    description: 'Hair spa, scalp detox, trim and signature blowout experience.',
    durationMinutes: 90,
    price: 6200,
    icon: 'Crown',
    category: 'PREMIUM',
    isActive: true,
  },
];

const teamSeeds = [
  {
    name: 'Andri Kole',
    title: 'Creative Director',
    experienceYears: 11,
    avatar: 'https://images.unsplash.com/photo-1618077360395-f3068be8e001?auto=format&fit=crop&w=900&q=80',
    portfolio: [
      'https://images.unsplash.com/photo-1605497788044-5a32c7078486?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1613206485381-b028e578e3aa?auto=format&fit=crop&w=1200&q=80',
    ],
  },
  {
    name: 'Mira Sen',
    title: 'Color Specialist',
    experienceYears: 8,
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=900&q=80',
    portfolio: [
      'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1200&q=80',
    ],
  },
];

export async function seedInitialData(): Promise<void> {
  const serviceCount = await Service.estimatedDocumentCount();
  if (serviceCount === 0) {
    await Service.insertMany(serviceSeeds);
  }

  const teamCount = await TeamMember.estimatedDocumentCount();
  if (teamCount === 0) {
    await TeamMember.insertMany(teamSeeds);
  }

  const adminPhone = process.env.ADMIN_PHONE ?? '0712345678';
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'admin12345';
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await User.findOneAndUpdate(
    { phoneNumber: adminPhone },
    {
      phoneNumber: adminPhone,
      passwordHash,
      firstName: 'Salon',
      lastName: 'Admin',
      role: 'ADMIN',
      isActive: true,
      profileImageUrl: null,
    },
    { upsert: true, new: true }
  );
}

async function runSeed(): Promise<void> {
  await connectDatabase();
  try {
    await seedInitialData();
    console.log('✅ Seed completed successfully');
  } finally {
    await disconnectDatabase();
  }
}

if (require.main === module) {
  runSeed().catch((error) => {
    console.error('❌ Seed failed', error);
    process.exit(1);
  });
}
