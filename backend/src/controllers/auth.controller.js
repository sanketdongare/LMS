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

    // Upsert user
    const user = await prisma.user.upsert({
      where: { firebaseUid },
      update: { email, name, avatar },
      create: {
        firebaseUid,
        email,
        name: name || email.split('@')[0],
        avatar,
        role: 'STUDENT',
      },
    });

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
