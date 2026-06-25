const express = require('express');
const router = express.Router();
const {
  getSurveys, getSurvey, createSurvey, deleteSurvey,
  addQuestion, deleteQuestion, submitResponse
} = require('../controllers/survey.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.use(authenticate);

// List, Get, and Respond can be done by students too. But creation/deletion of surveys and questions requires admin roles.
const allowedAdminRoles = authorize('SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'INSTITUTE_ADMIN');

// Anyone authenticated can read survey list and detail or submit response
router.get('/', getSurveys);
router.get('/:id', getSurvey);
router.post('/:id/responses', submitResponse);

// Admin actions
router.post('/', allowedAdminRoles, createSurvey);
router.delete('/:id', allowedAdminRoles, deleteSurvey);
router.post('/:id/questions', allowedAdminRoles, addQuestion);
router.delete('/questions/:questionId', allowedAdminRoles, deleteQuestion);

module.exports = router;
