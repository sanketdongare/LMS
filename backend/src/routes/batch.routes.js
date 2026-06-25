const express = require('express');
const router = express.Router();
const {
  getBatches, createBatch, updateBatch, deleteBatch,
  getLearners, enrollLearner, unenrollLearner,
  getAnnouncements, createAnnouncement, getBatchAnalytics
} = require('../controllers/batch.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.use(authenticate);

const allowedRoles = authorize('SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'INSTITUTE_ADMIN');

router.get('/', allowedRoles, getBatches);
router.post('/', allowedRoles, createBatch);
router.put('/:id', allowedRoles, updateBatch);
router.delete('/:id', allowedRoles, deleteBatch);

// Learners
router.get('/:id/learners', allowedRoles, getLearners);
router.post('/:id/learners', allowedRoles, enrollLearner);
router.delete('/:id/learners/:userId', allowedRoles, unenrollLearner);

// Announcements
router.get('/:id/announcements', allowedRoles, getAnnouncements);
router.post('/:id/announcements', allowedRoles, createAnnouncement);

// Analytics
router.get('/:id/analytics', allowedRoles, getBatchAnalytics);

module.exports = router;
