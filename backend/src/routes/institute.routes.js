const express = require('express');
const router = express.Router();
const {
  getInstitutes, getInstitute, createInstitute, updateInstitute, deleteInstitute,
} = require('../controllers/institute.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(authenticate);

// GET /api/institutes - Accessible by SUPER_ADMIN and UNIVERSITY_ADMIN
router.get('/', authorize('SUPER_ADMIN', 'UNIVERSITY_ADMIN'), getInstitutes);

// GET /api/institutes/:id
router.get('/:id', authorize('SUPER_ADMIN', 'UNIVERSITY_ADMIN'), getInstitute);

// POST /api/institutes - UNIVERSITY_ADMIN creates institutes; SUPER_ADMIN can also create
router.post('/', authorize('SUPER_ADMIN', 'UNIVERSITY_ADMIN'), createInstitute);

// PUT /api/institutes/:id - SUPER_ADMIN or UNIVERSITY_ADMIN (their university only)
router.put('/:id', authorize('SUPER_ADMIN', 'UNIVERSITY_ADMIN'), updateInstitute);

// DELETE /api/institutes/:id - SUPER_ADMIN or UNIVERSITY_ADMIN (their university only)
router.delete('/:id', authorize('SUPER_ADMIN', 'UNIVERSITY_ADMIN'), deleteInstitute);

module.exports = router;
