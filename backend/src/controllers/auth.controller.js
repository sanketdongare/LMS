const prisma = require('../config/prisma');

/**
 * POST /api/auth/sync
 * Sync Firebase user to PostgreSQL on first login
 */
const syncUser = async (req, res) => {
  try {
    const { firebaseUid, email, name, avatar } = req.body;

    if (!firebaseUid || !email) {
      return res.status(400).json({ 
        success: false, 
        message: 'firebaseUid and email are required' 
      });
    }

    // Check if user exists by firebaseUid
    let user = await prisma.user.findUnique({ where: { firebaseUid } });

    if (user) {
      // Update existing user
      user = await prisma.user.update({
        where: { id: user.id },
        data: { email, name, avatar },
      });
    } else {
      // Check if user exists by email (e.g., created by admin)
      let existingUserByEmail = await prisma.user.findUnique({ where: { email } });
      
      if (existingUserByEmail) {
        // Link firebaseUid to existing user
        user = await prisma.user.update({
          where: { id: existingUserByEmail.id },
          data: { firebaseUid, name, avatar },
        });
      } else {
        // Create new user
        user = await prisma.user.create({
          data: {
            firebaseUid,
            email,
            name: name || email.split('@')[0],
            avatar,
            role: 'STUDENT',
          },
        });
      }
    }

    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Sync user error:', error);
    res.status(500).json({ success: false, message: 'Failed to sync user' });
  }
};

/**
 * GET /api/auth/me
 * Get current authenticated user profile
 */
const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        managedUniversities: { select: { id: true, name: true, code: true } },
        _count: { select: { enrollments: true, taughtCourses: true } },
      },
    });
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch profile' });
  }
};

module.exports = { syncUser, getMe };
