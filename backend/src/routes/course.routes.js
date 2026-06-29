const express = require('express');
const router = express.Router();
const {
  getCourses, getCourseById,
  getOutcomes, createOutcome, deleteOutcome,
  getAnnouncements, createAnnouncement, deleteAnnouncement,
  getAssignments, createAssignment, submitAssignment, gradeSubmission,
  getTopics, createTopic, getTopicPosts, createPost,
  getAgent, updateAgent, chatWithAgent,
  getCourseAnalytics
} = require('../controllers/course.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.use(authenticate);

// List/Detail
router.get('/', getCourses);
router.get('/:id', getCourseById);

// Outcomes
router.get('/:id/outcomes', getOutcomes);
router.post('/:id/outcomes', authorize('SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'INSTITUTE_ADMIN', 'INSTRUCTOR'), createOutcome);
router.delete('/:id/outcomes/:outcomeId', authorize('SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'INSTITUTE_ADMIN', 'INSTRUCTOR'), deleteOutcome);

// Announcements
router.get('/:id/announcements', getAnnouncements);
router.post('/:id/announcements', authorize('SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'INSTITUTE_ADMIN', 'INSTRUCTOR'), createAnnouncement);
router.delete('/:id/announcements/:annId', authorize('SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'INSTITUTE_ADMIN', 'INSTRUCTOR'), deleteAnnouncement);

// Assignments & Submissions
router.get('/:id/assignments', getAssignments);
router.post('/:id/assignments', authorize('SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'INSTITUTE_ADMIN', 'INSTRUCTOR'), createAssignment);
router.post('/:id/assignments/:assignmentId/submit', authorize('STUDENT'), submitAssignment);
router.put('/:id/submissions/:submissionId/grade', authorize('SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'INSTITUTE_ADMIN', 'INSTRUCTOR'), gradeSubmission);

// Discussions
router.get('/:id/topics', getTopics);
router.post('/:id/topics', createTopic);
router.get('/:id/topics/:topicId/posts', getTopicPosts);
router.post('/:id/topics/:topicId/posts', createPost);

// Agent
router.get('/:id/agent', getAgent);
router.put('/:id/agent', authorize('SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'INSTITUTE_ADMIN', 'INSTRUCTOR'), updateAgent);
router.post('/:id/agent/chat', chatWithAgent);

// Analytics
router.get('/:id/analytics', authorize('SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'INSTITUTE_ADMIN', 'INSTRUCTOR'), getCourseAnalytics);

module.exports = router;
