const express = require('express');
const router = express.Router();
const {
  getPrograms, createProgram, updateProgram, deleteProgram
} = require('../controllers/program.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// All routes require authentication and INSTITUTE_ADMIN, SUPER_ADMIN or UNIVERSITY_ADMIN role
router.use(authenticate);

router.get('/', authorize('SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'INSTITUTE_ADMIN'), getPrograms);
router.post('/', authorize('SUPER_ADMIN', 'INSTITUTE_ADMIN'), createProgram);
router.put('/:id', authorize('SUPER_ADMIN', 'INSTITUTE_ADMIN'), updateProgram);
router.delete('/:id', authorize('SUPER_ADMIN', 'INSTITUTE_ADMIN'), deleteProgram);

module.exports = router;
