const prisma = require('../config/prisma');

/**
 * GET /api/semesters
 * Get semesters of a batch
 */
const getSemesters = async (req, res) => {
  try {
    const { batchId } = req.query;

    if (!batchId) {
      return res.status(400).json({ success: false, message: 'batchId is required' });
    }

    const semesters = await prisma.semester.findMany({
      where: { batchId },
      orderBy: { number: 'asc' },
      include: {
        _count: { select: { courses: true } },
      },
    });

    res.json({ success: true, data: semesters });
  } catch (error) {
    console.error('Get semesters error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch semesters' });
  }
};

/**
 * POST /api/semesters
 * Create semester
 */
const createSemester = async (req, res) => {
  try {
    const { name, number, batchId } = req.body;

    if (!name || !number || !batchId) {
      return res.status(400).json({ success: false, message: 'Name, number, and batchId are required' });
    }

    const semester = await prisma.semester.create({
      data: {
        name,
        number: parseInt(number),
        batchId,
      },
    });

    res.status(201).json({ success: true, data: semester, message: 'Semester created successfully' });
  } catch (error) {
    console.error('Create semester error:', error);
    res.status(500).json({ success: false, message: 'Failed to create semester' });
  }
};

/**
 * DELETE /api/semesters/:id
 * Delete semester
 */
const deleteSemester = async (req, res) => {
  try {
    const { id } = req.params;

    const semester = await prisma.semester.findUnique({ where: { id } });
    if (!semester) {
      return res.status(404).json({ success: false, message: 'Semester not found' });
    }

    await prisma.semester.delete({ where: { id } });

    res.json({ success: true, message: 'Semester deleted successfully' });
  } catch (error) {
    console.error('Delete semester error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete semester' });
  }
};

/**
 * GET /api/semesters/:id/courses
 * Get courses in a semester
 */
const getSemesterCourses = async (req, res) => {
  try {
    const { id } = req.params;

    const courses = await prisma.course.findMany({
      where: { semesterId: id },
      orderBy: { createdAt: 'desc' },
      include: {
        instructor: { select: { name: true, email: true } },
      },
    });

    res.json({ success: true, data: courses });
  } catch (error) {
    console.error('Get semester courses error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch semester courses' });
  }
};

/**
 * POST /api/semesters/:id/courses
 * Create or assign course to semester
 */
const assignCourseToSemester = async (req, res) => {
  try {
    const { id } = req.params; // Semester ID
    const { courseId, title, description, duration } = req.body;

    // If assigning existing course
    if (courseId) {
      const course = await prisma.course.update({
        where: { id: courseId },
        data: { semesterId: id },
      });
      return res.json({ success: true, data: course, message: 'Course assigned to semester successfully' });
    }

    // Else if creating a new course directly
    if (!title) {
      return res.status(400).json({ success: false, message: 'Course title or courseId is required' });
    }

    // Find the university of the logged-in admin's institute
    const institute = await prisma.institute.findFirst({
      where: { adminId: req.user.id },
      select: { universityId: true },
    });

    if (!institute) {
      return res.status(403).json({ success: false, message: 'Only an Institute Admin can create courses here' });
    }

    const course = await prisma.course.create({
      data: {
        title,
        description,
        duration: duration ? parseInt(duration) : null,
        universityId: institute.universityId,
        semesterId: id,
        isPublished: true,
      },
    });

    res.status(201).json({ success: true, data: course, message: 'Course created and assigned successfully' });
  } catch (error) {
    console.error('Assign course error:', error);
    res.status(500).json({ success: false, message: 'Failed to assign course to semester' });
  }
};

/**
 * DELETE /api/semesters/:id/courses/:courseId
 * Remove course from semester (sets semesterId to null)
 */
const unassignCourseFromSemester = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await prisma.course.update({
      where: { id: courseId },
      data: { semesterId: null },
    });

    res.json({ success: true, data: course, message: 'Course unassigned from semester successfully' });
  } catch (error) {
    console.error('Unassign course error:', error);
    res.status(500).json({ success: false, message: 'Failed to unassign course' });
  }
};

module.exports = {
  getSemesters,
  createSemester,
  deleteSemester,
  getSemesterCourses,
  assignCourseToSemester,
  unassignCourseFromSemester,
};
