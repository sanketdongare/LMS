/**
 * SDLMS Seed Script
 * Creates demo accounts in Firebase Auth + assigns roles in the database.
 *
 * Usage: node seed-users.js
 */

require('dotenv').config();
const admin = require('firebase-admin');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// ─── Initialize Firebase Admin ────────────────────────────────────────────────
if (admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

// ─── Demo Accounts ────────────────────────────────────────────────────────────
const DEMO_USERS = [
  {
    email: 'superadmin@sdlms.com',
    password: 'Super@1234',
    name: 'Super Admin',
    role: 'SUPER_ADMIN',
  },
  {
    email: 'uniadmin@sdlms.com',
    password: 'UniAdmin@1234',
    name: 'University Admin',
    role: 'UNIVERSITY_ADMIN',
  },
  {
    email: 'instadmin@sdlms.com',
    password: 'InstAdmin@1234',
    name: 'Institute Admin',
    role: 'INSTITUTE_ADMIN',
  },
  {
    email: 'techcoord@sdlms.com',
    password: 'TechCoord@1234',
    name: 'Technical Coordinator',
    role: 'INSTRUCTOR',          // Maps to INSTRUCTOR in the DB schema
  },
  {
    email: 'coursecoord@sdlms.com',
    password: 'CourseCoord@1234',
    name: 'Course Coordinator',
    role: 'INSTRUCTOR',          // Instructors have course edit access
  },
  {
    email: 'learner@sdlms.com',
    password: 'Learner@1234',
    name: 'Learner Student',
    role: 'STUDENT',
  },
];

// ─── Main ─────────────────────────────────────────────────────────────────────
async function seedUsers() {
  console.log('\n🌱 Starting SDLMS User Seed...\n');

  for (const demoUser of DEMO_USERS) {
    try {
      // 1. Try to get existing Firebase user
      let firebaseUser;
      try {
        firebaseUser = await admin.auth().getUserByEmail(demoUser.email);
        console.log(`⚠️  Firebase user already exists: ${demoUser.email}`);
      } catch {
        // Create new Firebase user
        firebaseUser = await admin.auth().createUser({
          email: demoUser.email,
          password: demoUser.password,
          displayName: demoUser.name,
          emailVerified: true,
        });
        console.log(`✅ Firebase user created: ${demoUser.email}`);
      }

      // 2. Upsert into local database with the correct role
      // First try to find an existing record by email (might have different firebaseUid)
      const existing = await prisma.user.findFirst({
        where: { OR: [{ firebaseUid: firebaseUser.uid }, { email: demoUser.email }] }
      });

      let dbUser;
      if (existing) {
        dbUser = await prisma.user.update({
          where: { id: existing.id },
          data: {
            firebaseUid: firebaseUser.uid,
            role: demoUser.role,
            name: demoUser.name,
            email: demoUser.email,
            isActive: true,
          },
        });
      } else {
        dbUser = await prisma.user.create({
          data: {
            firebaseUid: firebaseUser.uid,
            email: demoUser.email,
            name: demoUser.name,
            role: demoUser.role,
            isActive: true,
          },
        });
      }

      console.log(`   └─ DB role set to [${dbUser.role}] (id: ${dbUser.id})`);
    } catch (err) {
      console.error(`❌ Failed for ${demoUser.email}:`, err.message);
    }
  }

  console.log('\n─────────────────────────────────────────────');
  console.log('🎉 Seeding complete! Login credentials:\n');
  DEMO_USERS.forEach(u => {
    console.log(`  Role: ${u.role.padEnd(20)} Email: ${u.email.padEnd(30)} Password: ${u.password}`);
  });
  console.log('─────────────────────────────────────────────\n');

  await prisma.$disconnect();
  process.exit(0);
}

seedUsers().catch(async (err) => {
  console.error('Fatal seed error:', err);
  await prisma.$disconnect();
  process.exit(1);
});
