const express = require('express');
const router = express.Router();
const prisma = require('../config/prisma');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { getFirebaseAdmin } = require('../config/firebase');

router.use(authenticate);

// ── GET /api/users ──────────────────────────────────────────────────────────
// SUPER_ADMIN: all users with optional role/search filter
// UNIVERSITY_ADMIN: users associated with their universities/institutes
// INSTITUTE_ADMIN: instructors in their institutes
router.get('/', authorize('SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'INSTITUTE_ADMIN'), async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', role, universityId, instituteId } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const currentUser = req.user;

    let where = {};

    if (currentUser.role === 'SUPER_ADMIN') {
      // Full access
      where = {
        ...(search && { OR: [{ name: { contains: search, mode: 'insensitive' } }, { email: { contains: search, mode: 'insensitive' } }] }),
        ...(role && { role }),
      };
    } else if (currentUser.role === 'UNIVERSITY_ADMIN') {
      // Get all users scoped to universities this admin manages
      const unis = await prisma.university.findMany({ where: { adminId: currentUser.id }, select: { id: true } });
      const uniIds = unis.map(u => u.id);
      // Users are: instructors (taughtCourses in these unis), institute admins (managedInstitutes in these unis)
      where = {
        AND: [
          search ? { OR: [{ name: { contains: search, mode: 'insensitive' } }, { email: { contains: search, mode: 'insensitive' } }] } : {},
          role ? { role } : { role: { in: ['UNIVERSITY_ADMIN', 'INSTITUTE_ADMIN', 'INSTRUCTOR', 'STUDENT'] } },
          {
            OR: [
              { managedUniversities: { some: { id: { in: uniIds } } } },
              { managedInstitutes: { some: { university: { id: { in: uniIds } } } } },
              { taughtCourses: { some: { universityId: { in: uniIds } } } },
            ]
          }
        ]
      };
    } else if (currentUser.role === 'INSTITUTE_ADMIN') {
      const institutes = await prisma.institute.findMany({ where: { adminId: currentUser.id }, select: { id: true } });
      const instIds = institutes.map(i => i.id);
      where = {
        AND: [
          search ? { OR: [{ name: { contains: search, mode: 'insensitive' } }, { email: { contains: search, mode: 'insensitive' } }] } : {},
          role ? { role } : { role: { in: ['INSTRUCTOR', 'STUDENT'] } },
          { taughtCourses: { some: { OR: instIds.map(id => ({ semesterId: { not: null } })) } } }
        ]
      };
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({ where, skip, take: parseInt(limit), orderBy: { createdAt: 'desc' } }),
      prisma.user.count({ where }),
    ]);

    res.json({ success: true, data: users, pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / parseInt(limit)) } });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
});

// ── POST /api/users/create-admin ────────────────────────────────────────────
// Creates a Firebase Auth user + DB record for admin roles
router.post('/create-admin', authorize('SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'INSTITUTE_ADMIN'), async (req, res) => {
  try {
    const { email, name, password, role } = req.body;
    const currentUser = req.user;

    if (!email || !name || !password || !role) {
      return res.status(400).json({ success: false, message: 'email, name, password, and role are required' });
    }

    // Role permission checks
    const allowedByRole = {
      SUPER_ADMIN: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'INSTITUTE_ADMIN', 'INSTRUCTOR', 'STUDENT'],
      UNIVERSITY_ADMIN: ['INSTITUTE_ADMIN', 'INSTRUCTOR', 'STUDENT'],
      INSTITUTE_ADMIN: ['INSTRUCTOR', 'STUDENT'],
    };
    const allowed = allowedByRole[currentUser.role] || [];
    if (!allowed.includes(role)) {
      return res.status(403).json({ success: false, message: `You cannot create users with role: ${role}` });
    }

    const admin = getFirebaseAdmin();

    // Check if Firebase user already exists
    let firebaseUid;
    try {
      const existingFbUser = await admin.auth().getUserByEmail(email);
      firebaseUid = existingFbUser.uid;
    } catch (e) {
      if (e.code === 'auth/user-not-found') {
        const newFbUser = await admin.auth().createUser({ email, password, displayName: name, emailVerified: true });
        firebaseUid = newFbUser.uid;
      } else {
        throw e;
      }
    }

    // Check if DB user already exists
    const existingDbUser = await prisma.user.findUnique({ where: { firebaseUid } });
    if (existingDbUser) {
      return res.status(409).json({ success: false, message: 'A user with this email already exists' });
    }

    const user = await prisma.user.create({
      data: { firebaseUid, email, name, role },
    });

    res.status(201).json({ success: true, data: user, message: `${role} created successfully` });
  } catch (error) {
    console.error('Create admin error:', error);
    if (error.code === 'auth/email-already-exists') {
      return res.status(409).json({ success: false, message: 'Email already in use in Firebase' });
    }
    res.status(500).json({ success: false, message: error.message || 'Failed to create user' });
  }
});

// ── PUT /api/users/:id/role ─────────────────────────────────────────────────
router.put('/:id/role', authorize('SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'INSTITUTE_ADMIN'), async (req, res) => {
  try {
    const { role } = req.body;
    const currentUser = req.user;

    const allowedByRole = {
      SUPER_ADMIN: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'INSTITUTE_ADMIN', 'INSTRUCTOR', 'STUDENT'],
      UNIVERSITY_ADMIN: ['INSTITUTE_ADMIN', 'INSTRUCTOR', 'STUDENT'],
      INSTITUTE_ADMIN: ['INSTRUCTOR', 'STUDENT'],
    };
    const allowed = allowedByRole[currentUser.role] || [];
    if (!allowed.includes(role)) {
      return res.status(403).json({ success: false, message: 'Invalid role or insufficient permissions' });
    }

    const user = await prisma.user.update({ where: { id: req.params.id }, data: { role } });
    res.json({ success: true, data: user, message: 'Role updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update role' });
  }
});

// ── PUT /api/users/:id/toggle-active ────────────────────────────────────────
router.put('/:id/toggle-active', authorize('SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'INSTITUTE_ADMIN'), async (req, res) => {
  try {
    const target = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!target) return res.status(404).json({ success: false, message: 'User not found' });

    const user = await prisma.user.update({ where: { id: req.params.id }, data: { isActive: !target.isActive } });

    // Also disable/enable in Firebase
    try {
      const admin = getFirebaseAdmin();
      await admin.auth().updateUser(user.firebaseUid, { disabled: !user.isActive });
    } catch (fbErr) {
      console.error('Firebase toggle error (non-fatal):', fbErr.message);
    }

    res.json({ success: true, data: user, message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to toggle user status' });
  }
});

// ── DELETE /api/users/:id ───────────────────────────────────────────────────
router.delete('/:id', authorize('SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'INSTITUTE_ADMIN'), async (req, res) => {
  try {
    const currentUser = req.user;
    if (req.params.id === currentUser.id) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own account' });
    }

    const target = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!target) return res.status(404).json({ success: false, message: 'User not found' });

    // Non-super-admins cannot delete super admins
    if (target.role === 'SUPER_ADMIN' && currentUser.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ success: false, message: 'Cannot delete a Super Admin' });
    }

    await prisma.user.delete({ where: { id: req.params.id } });

    // Remove from Firebase (best effort)
    try {
      const admin = getFirebaseAdmin();
      await admin.auth().deleteUser(target.firebaseUid);
    } catch (fbErr) {
      console.error('Firebase delete error (non-fatal):', fbErr.message);
    }

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete user' });
  }
});

module.exports = router;
