const prisma = require('../config/prisma');

/**
 * GET /api/batches
 * Get batches of a program
 */
const getBatches = async (req, res) => {
  try {
    const { programId } = req.query;

    if (!programId) {
      return res.status(400).json({ success: false, message: 'programId is required' });
    }

    const batches = await prisma.batch.findMany({
      where: { programId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { enrollments: true, semesters: true } },
      },
    });

    res.json({ success: true, data: batches });
  } catch (error) {
    console.error('Get batches error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch batches' });
  }
};

/**
 * POST /api/batches
 * Create batch
 */
const createBatch = async (req, res) => {
  try {
    const { name, code, description, startDate, endDate, programId } = req.body;

    if (!name || !code || !programId) {
      return res.status(400).json({ success: false, message: 'Name, code, and programId are required' });
    }

    // Check duplicate code
    const existing = await prisma.batch.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (existing) {
      return res.status(409).json({ success: false, message: 'Batch code already exists' });
    }

    const batch = await prisma.batch.create({
      data: {
        name,
        code: code.toUpperCase(),
        description,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        programId,
      },
    });

    res.status(201).json({ success: true, data: batch, message: 'Batch created successfully' });
  } catch (error) {
    console.error('Create batch error:', error);
    res.status(500).json({ success: false, message: 'Failed to create batch' });
  }
};

/**
 * PUT /api/batches/:id
 * Update batch
 */
const updateBatch = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, startDate, endDate, isActive } = req.body;

    const batch = await prisma.batch.findUnique({ where: { id } });
    if (!batch) {
      return res.status(404).json({ success: false, message: 'Batch not found' });
    }

    const updated = await prisma.batch.update({
      where: { id },
      data: {
        ...(name && { name }),
        description,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        ...(isActive !== undefined && { isActive }),
      },
    });

    res.json({ success: true, data: updated, message: 'Batch updated successfully' });
  } catch (error) {
    console.error('Update batch error:', error);
    res.status(500).json({ success: false, message: 'Failed to update batch' });
  }
};

/**
 * DELETE /api/batches/:id
 * Delete batch
 */
const deleteBatch = async (req, res) => {
  try {
    const { id } = req.params;

    const batch = await prisma.batch.findUnique({ where: { id } });
    if (!batch) {
      return res.status(404).json({ success: false, message: 'Batch not found' });
    }

    await prisma.batch.delete({ where: { id } });

    res.json({ success: true, message: 'Batch deleted successfully' });
  } catch (error) {
    console.error('Delete batch error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete batch' });
  }
};

/**
 * GET /api/batches/:id/learners
 * Get batch learners
 */
const getLearners = async (req, res) => {
  try {
    const { id } = req.params;
    const { search = '', availableOnly = 'false' } = req.query;

    if (availableOnly === 'true') {
      // Find learners who are NOT enrolled in this batch
      const enrolled = await prisma.batchEnrollment.findMany({
        where: { batchId: id },
        select: { userId: true },
      });
      const enrolledUserIds = enrolled.map((e) => e.userId);

      const availableUsers = await prisma.user.findMany({
        where: {
          role: 'STUDENT',
          id: { notIn: enrolledUserIds },
          ...(search && {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
            ],
          }),
        },
        take: 50,
        select: { id: true, name: true, email: true, avatar: true },
      });

      return res.json({ success: true, data: availableUsers });
    }

    // Otherwise return currently enrolled learners
    const enrollments = await prisma.batchEnrollment.findMany({
      where: {
        batchId: id,
        user: {
          ...(search && {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
            ],
          }),
        },
      },
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true } },
      },
      orderBy: { enrolledAt: 'desc' },
    });

    res.json({ success: true, data: enrollments });
  } catch (error) {
    console.error('Get learners error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch batch learners' });
  }
};

/**
 * POST /api/batches/:id/learners
 * Enroll learner
 */
const enrollLearner = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, message: 'userId is required' });
    }

    const existing = await prisma.batchEnrollment.findUnique({
      where: { batchId_userId: { batchId: id, userId } },
    });

    if (existing) {
      return res.status(409).json({ success: false, message: 'Learner already enrolled in this batch' });
    }

    const enrollment = await prisma.batchEnrollment.create({
      data: {
        batchId: id,
        userId,
      },
      include: {
        user: { select: { name: true, email: true } },
      },
    });

    res.status(201).json({ success: true, data: enrollment, message: 'Learner enrolled successfully' });
  } catch (error) {
    console.error('Enroll learner error:', error);
    res.status(500).json({ success: false, message: 'Failed to enroll learner' });
  }
};

/**
 * DELETE /api/batches/:id/learners/:userId
 * Unenroll learner
 */
const unenrollLearner = async (req, res) => {
  try {
    const { id, userId } = req.params;

    const enrollment = await prisma.batchEnrollment.findUnique({
      where: { batchId_userId: { batchId: id, userId } },
    });

    if (!enrollment) {
      return res.status(404).json({ success: false, message: 'Enrollment not found' });
    }

    await prisma.batchEnrollment.delete({
      where: { id: enrollment.id },
    });

    res.json({ success: true, message: 'Learner unenrolled successfully' });
  } catch (error) {
    console.error('Unenroll learner error:', error);
    res.status(500).json({ success: false, message: 'Failed to unenroll learner' });
  }
};

/**
 * GET /api/batches/:id/announcements
 * Get Announcements
 */
const getAnnouncements = async (req, res) => {
  try {
    const { id } = req.params;

    const announcements = await prisma.batchAnnouncement.findMany({
      where: { batchId: id },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: announcements });
  } catch (error) {
    console.error('Get announcements error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch announcements' });
  }
};

/**
 * POST /api/batches/:id/announcements
 * Create Announcement
 */
const createAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Title and content are required' });
    }

    const announcement = await prisma.batchAnnouncement.create({
      data: {
        title,
        content,
        batchId: id,
      },
    });

    res.status(201).json({ success: true, data: announcement, message: 'Announcement posted successfully' });
  } catch (error) {
    console.error('Create announcement error:', error);
    res.status(500).json({ success: false, message: 'Failed to create announcement' });
  }
};

/**
 * GET /api/batches/:id/analytics
 * Get Batch Analytics
 */
const getBatchAnalytics = async (req, res) => {
  try {
    const { id } = req.params;

    const [enrollmentCount, semesterCount, courseCount, surveys] = await Promise.all([
      prisma.batchEnrollment.count({ where: { batchId: id } }),
      prisma.semester.count({ where: { batchId: id } }),
      prisma.course.count({ where: { semester: { batchId: id } } }),
      prisma.survey.findMany({
        where: { batchId: id },
        include: {
          _count: { select: { responses: true } },
          questions: { select: { id: true } },
        },
      }),
    ]);

    // Calculate survey response rates
    const surveyStats = surveys.map((s) => {
      const responseCount = s._count.responses;
      const rate = enrollmentCount > 0 ? Math.round((responseCount / enrollmentCount) * 100) : 0;
      return {
        id: s.id,
        title: s.title,
        responses: responseCount,
        questions: s.questions.length,
        completionRate: rate,
      };
    });

    res.json({
      success: true,
      data: {
        enrollmentCount,
        semesterCount,
        courseCount,
        surveyStats,
      },
    });
  } catch (error) {
    console.error('Get batch analytics error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch batch analytics' });
  }
};

module.exports = {
  getBatches,
  createBatch,
  updateBatch,
  deleteBatch,
  getLearners,
  enrollLearner,
  unenrollLearner,
  getAnnouncements,
  createAnnouncement,
  getBatchAnalytics,
};
