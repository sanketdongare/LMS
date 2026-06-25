const express = require('express');
const router = express.Router();
const {
  getSemesters, createSemester, deleteSemester,
  getSemesterCourses, assignCourseToSemester, unassignCourseFromSemester
} = require('../controllers/semester.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.use(authenticate);

const allowedRoles = authorize('SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'INSTITUTE_ADMIN');

router.get('/', allowedRoles, getSemesters);
router.post('/', allowedRoles, createSemester);
router.delete('/:id', allowedRoles, deleteSemester);

// Courses assigned to Semester
router.get('/:id/courses', allowedRoles, getSemesterCourses);
router.post('/:id/courses', allowedRoles, assignCourseToSemester);
router.delete('/:id/courses/:courseId', allowedRoles, unassignCourseFromSemester);

module.exports = router;
