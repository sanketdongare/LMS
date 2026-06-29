const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth.middleware');

const {
  getUnits, getUnit, createUnit, updateUnit, deleteUnit,
  getQuizzes, createQuiz, updateQuiz, deleteQuiz,
  createQuestion, updateQuestion, deleteQuestion,
  submitAttempt, getAttempts, gradeAnswer
} = require('../controllers/unit.controller');

const canManage = authorize('SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'INSTITUTE_ADMIN', 'INSTRUCTOR');

// All routes require authentication
router.use(authenticate);

// ─────── Unit routes (nested under /api/courses/:courseId/units) ───────
router.get('/courses/:courseId/units', getUnits);
router.post('/courses/:courseId/units', canManage, createUnit);
router.get('/units/:unitId', getUnit);
router.put('/units/:unitId', canManage, updateUnit);
router.delete('/units/:unitId', canManage, deleteUnit);

// ─────── Quiz routes (nested under /api/units/:unitId/quizzes) ───────
router.get('/units/:unitId/quizzes', getQuizzes);
router.post('/units/:unitId/quizzes', canManage, createQuiz);
router.put('/quizzes/:quizId', canManage, updateQuiz);
router.delete('/quizzes/:quizId', canManage, deleteQuiz);

// ─────── Question routes ───────
router.post('/quizzes/:quizId/questions', canManage, createQuestion);
router.put('/questions/:questionId', canManage, updateQuestion);
router.delete('/questions/:questionId', canManage, deleteQuestion);

// ─────── Attempt routes ───────
router.post('/quizzes/:quizId/attempts', submitAttempt);
router.get('/quizzes/:quizId/attempts', getAttempts);
router.put('/answers/:answerId/grade', canManage, gradeAnswer);

module.exports = router;
