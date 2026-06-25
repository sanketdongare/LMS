const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create a demo super admin user
  // NOTE: In production, create via Firebase Auth first, then use the real firebaseUid
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@sdlms.com' },
    update: {
      role: 'SUPER_ADMIN',
      firebaseUid: 'demo-super-admin-uid',
    },
    create: {
      firebaseUid: 'demo-super-admin-uid', // Replace with real Firebase UID
      email: 'admin@sdlms.com',
      name: 'Super Admin',
      role: 'SUPER_ADMIN',
    },
  });
  console.log('✅ Created super admin:', superAdmin.email);

  // Create demo universities
  const universities = await Promise.all([
    prisma.university.upsert({
      where: { code: 'MIT' },
      update: {},
      create: {
        name: 'Massachusetts Institute of Technology',
        code: 'MIT',
        email: 'contact@mit.edu',
        website: 'https://www.mit.edu',
        address: '77 Massachusetts Ave, Cambridge, MA 02139',
        description: 'A world-renowned research university dedicated to advancing knowledge.',
        adminId: superAdmin.id,
      },
    }),
    prisma.university.upsert({
      where: { code: 'STAN' },
      update: {},
      create: {
        name: 'Stanford University',
        code: 'STAN',
        email: 'contact@stanford.edu',
        website: 'https://www.stanford.edu',
        address: '450 Serra Mall, Stanford, CA 94305',
        description: 'Stanford fosters interdisciplinary excellence across a wide range of fields.',
        adminId: superAdmin.id,
      },
    }),
    prisma.university.upsert({
      where: { code: 'HARV' },
      update: {},
      create: {
        name: 'Harvard University',
        code: 'HARV',
        email: 'contact@harvard.edu',
        website: 'https://www.harvard.edu',
        address: 'Cambridge, MA 02138',
        description: 'The oldest institution of higher education in the United States.',
      },
    }),
  ]);
  console.log(`✅ Created ${universities.length} universities`);

  // Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: superAdmin.id,
        title: 'Welcome to SDLMS!',
        message: 'Your platform is ready. Start by exploring the universities dashboard.',
        type: 'SUCCESS',
      },
      {
        userId: superAdmin.id,
        title: 'Seed Complete',
        message: '3 universities have been created for you to explore.',
        type: 'INFO',
      },
    ],
  });
  console.log('✅ Created sample notifications');

  console.log('\n🎉 Seed completed successfully!');
  console.log('ℹ️  NOTE: Update firebaseUid in the seed to match your real Firebase user.');
}

main()
  .catch((e) => { console.error('❌ Seed error:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
