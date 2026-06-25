const express = require('express');
const router = express.Router();
const prisma = require('../config/prisma');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.use(authenticate);

// GET /api/users - List all users (admin only)
router.get('/', authorize('SUPER_ADMIN'), async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', role } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(role && { role }),
    };
    const [users, total] = await Promise.all([
      prisma.user.findMany({ where, skip, take: parseInt(limit), orderBy: { createdAt: 'desc' } }),
      prisma.user.count({ where }),
    ]);
    res.json({ success: true, data: users, pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / parseInt(limit)) } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
});

// PUT /api/users/:id/role - Update user role (super admin only)
router.put('/:id/role', authorize('SUPER_ADMIN'), async (req, res) => {
  try {
    const { role } = req.body;
    const validRoles = ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'INSTITUTE_ADMIN', 'INSTRUCTOR', 'STUDENT'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }
    const user = await prisma.user.update({ where: { id: req.params.id }, data: { role } });
    res.json({ success: true, data: user, message: 'Role updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update role' });
  }
});

module.exports = router;
