const express = require('express');
const router = express.Router();
const {
  getUniversities, getUniversity, createUniversity,
  updateUniversity, deleteUniversity, getStats
} = require('../controllers/university.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(authenticate);

// GET /api/universities/stats
router.get('/stats', authorize('SUPER_ADMIN', 'UNIVERSITY_ADMIN'), getStats);

// GET /api/universities
router.get('/', getUniversities);

// GET /api/universities/:id
router.get('/:id', getUniversity);

// POST /api/universities - Only super admin can create
router.post('/', authorize('SUPER_ADMIN'), createUniversity);

// PUT /api/universities/:id - Super admin or university admin
router.put('/:id', authorize('SUPER_ADMIN', 'UNIVERSITY_ADMIN'), updateUniversity);

// DELETE /api/universities/:id - Only super admin
router.delete('/:id', authorize('SUPER_ADMIN'), deleteUniversity);

module.exports = router;
