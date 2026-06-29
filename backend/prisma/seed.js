const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create a demo super admin user
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@sdlms.com' },
    update: {
      role: 'SUPER_ADMIN',
      firebaseUid: 'demo-super-admin-uid',
    },
    create: {
      firebaseUid: 'demo-super-admin-uid',
      email: 'admin@sdlms.com',
      name: 'Super Admin',
      role: 'SUPER_ADMIN',
    },
  });
  console.log('✅ Created super admin:', superAdmin.email);

  // Create a demo university admin
  const universityAdmin = await prisma.user.upsert({
    where: { email: 'uniadmin@sdlms.com' },
    update: {
      role: 'UNIVERSITY_ADMIN',
      firebaseUid: 'demo-uni-admin-uid',
    },
    create: {
      firebaseUid: 'demo-uni-admin-uid',
      email: 'uniadmin@sdlms.com',
      name: 'University Admin',
      role: 'UNIVERSITY_ADMIN',
    },
  });
  console.log('✅ Created university admin:', universityAdmin.email);

  // Create a demo institute admin
  const instituteAdmin = await prisma.user.upsert({
    where: { email: 'instadmin@sdlms.com' },
    update: {
      role: 'INSTITUTE_ADMIN',
      firebaseUid: 'demo-inst-admin-uid',
    },
    create: {
      firebaseUid: 'demo-inst-admin-uid',
      email: 'instadmin@sdlms.com',
      name: 'Institute Admin',
      role: 'INSTITUTE_ADMIN',
    },
  });
  console.log('✅ Created institute admin:', instituteAdmin.email);

  // Create demo universities
  const universities = await Promise.all([
    prisma.university.upsert({
      where: { code: 'MIT' },
      update: { adminId: universityAdmin.id },
      create: {
        name: 'Massachusetts Institute of Technology',
        code: 'MIT',
        email: 'contact@mit.edu',
        website: 'https://www.mit.edu',
        address: '77 Massachusetts Ave, Cambridge, MA 02139',
        description: 'A world-renowned research university dedicated to advancing knowledge.',
        adminId: universityAdmin.id,
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

  // Create demo institute under MIT
  const mitUni = universities.find((u) => u.code === 'MIT');
  const institute = await prisma.institute.upsert({
    where: { code: 'MIT-CS' },
    update: { adminId: instituteAdmin.id },
    create: {
      name: 'MIT Computer Science & AI Lab',
      code: 'MIT-CS',
      email: 'cs-admin@mit.edu',
      website: 'https://csail.mit.edu',
      address: 'Stata Center, 32 Vassar St, Cambridge, MA 02139',
      description: 'The computer science and artificial intelligence research hub at MIT.',
      universityId: mitUni.id,
      adminId: instituteAdmin.id,
    },
  });
  console.log('✅ Created demo institute:', institute.name);

  // Notifications
  await prisma.notification.deleteMany({ where: { userId: superAdmin.id } });
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
        message: '3 universities and 1 institute have been created for you to explore.',
        type: 'INFO',
      },
    ],
  });
  console.log('✅ Created sample notifications');

  console.log('\n🎉 Seed completed successfully!');
}

main()
  .catch((e) => { console.error('❌ Seed error:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
