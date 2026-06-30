const prisma = require('../config/prisma');

/**
 * GET /api/courses
 * Fetch courses accessible to the user
 */
const getCourses = async (req, res) => {
  try {
    const role = req.user.role;
    let whereClause = {};

    if (role === 'STUDENT') {
      // Students see ALL published courses with their enrollment status
      whereClause = { isPublished: true };
    } else if (role === 'INSTRUCTOR') {
      whereClause = { instructorId: req.user.id };
    } else if (role === 'INSTITUTE_ADMIN') {
      const institute = await prisma.institute.findFirst({ where: { adminId: req.user.id } });
      if (institute) whereClause = { universityId: institute.universityId };
    } else if (role === 'UNIVERSITY_ADMIN') {
      const uni = await prisma.university.findFirst({ where: { adminId: req.user.id } });
      if (uni) whereClause = { universityId: uni.id };
    }

    const courses = await prisma.course.findMany({
      where: whereClause,
      include: {
        instructor: { select: { name: true, avatar: true } },
        semester: { select: { name: true, batch: { select: { name: true } } } },
        _count: { select: { enrollments: true, assignments: true } },
        ...(role === 'STUDENT' && {
          enrollments: {
            where: { userId: req.user.id },
            select: { id: true, status: true, progress: true }
          }
        })
      },
      orderBy: { createdAt: 'desc' }
    });

    // For students, flag each course with enrollment status
    const data = role === 'STUDENT'
      ? courses.map(c => ({
          ...c,
          isEnrolled: c.enrollments && c.enrollments.length > 0,
          myEnrollment: c.enrollments?.[0] || null,
        }))
      : courses;

    res.json({ success: true, data });
  } catch (error) {
    console.error('getCourses error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch courses' });
  }
};

/**
 * POST /api/courses/:id/enroll
 * Student self-enrolls in a course
 */
const enrollSelf = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check course exists and is published
    const course = await prisma.course.findUnique({ where: { id } });
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    if (!course.isPublished) return res.status(403).json({ success: false, message: 'Course is not published' });

    // Upsert enrollment
    const enrollment = await prisma.enrollment.upsert({
      where: { userId_courseId: { userId, courseId: id } },
      update: { status: 'ACTIVE' },
      create: { userId, courseId: id, status: 'ACTIVE' },
    });

    res.json({ success: true, data: enrollment, message: 'Enrolled successfully' });
  } catch (error) {
    console.error('enrollSelf error:', error);
    res.status(500).json({ success: false, message: 'Failed to enroll' });
  }
};


/**
 * GET /api/courses/:id
 * Get full course details
 */
const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        instructor: { select: { name: true, email: true, avatar: true } },
        outcomes: true,
        agent: true
      }
    });
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    res.json({ success: true, data: course });
  } catch (error) {
    console.error('getCourseById error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch course' });
  }
};

// --- OUTCOMES ---
const getOutcomes = async (req, res) => {
  try {
    const outcomes = await prisma.courseOutcome.findMany({ where: { courseId: req.params.id } });
    res.json({ success: true, data: outcomes });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching outcomes' });
  }
};

const createOutcome = async (req, res) => {
  try {
    const outcome = await prisma.courseOutcome.create({
      data: { description: req.body.description, courseId: req.params.id }
    });
    res.json({ success: true, data: outcome });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating outcome' });
  }
};

const deleteOutcome = async (req, res) => {
  try {
    await prisma.courseOutcome.delete({ where: { id: req.params.outcomeId } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting outcome' });
  }
};

// --- ANNOUNCEMENTS ---
const getAnnouncements = async (req, res) => {
  try {
    const anns = await prisma.courseAnnouncement.findMany({ where: { courseId: req.params.id }, orderBy: { createdAt: 'desc' } });
    res.json({ success: true, data: anns });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching announcements' });
  }
};

const createAnnouncement = async (req, res) => {
  try {
    const { title, content } = req.body;
    const ann = await prisma.courseAnnouncement.create({
      data: { title, content, courseId: req.params.id }
    });
    res.json({ success: true, data: ann });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating announcement' });
  }
};

const deleteAnnouncement = async (req, res) => {
  try {
    await prisma.courseAnnouncement.delete({ where: { id: req.params.annId } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting announcement' });
  }
};

// --- ASSIGNMENTS ---
const getAssignments = async (req, res) => {
  try {
    const assignments = await prisma.assignment.findMany({ 
      where: { courseId: req.params.id },
      include: { rubric: true, _count: { select: { submissions: true } } },
      orderBy: { dueDate: 'asc' }
    });
    res.json({ success: true, data: assignments });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching assignments' });
  }
};

const createAssignment = async (req, res) => {
  try {
    const { title, description, dueDate, points, rubricCriteriaJson } = req.body;
    const assignment = await prisma.assignment.create({
      data: {
        title, description, dueDate: dueDate ? new Date(dueDate) : null, points, courseId: req.params.id,
        ...(rubricCriteriaJson && { rubric: { create: { criteriaJson: rubricCriteriaJson } } })
      },
      include: { rubric: true }
    });
    res.json({ success: true, data: assignment });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating assignment' });
  }
};

// --- SUBMISSIONS ---
const submitAssignment = async (req, res) => {
  try {
    const { content, fileUrl } = req.body;
    const submission = await prisma.submission.upsert({
      where: { assignmentId_userId: { assignmentId: req.params.assignmentId, userId: req.user.id } },
      update: { content, fileUrl, submittedAt: new Date() },
      create: { content, fileUrl, assignmentId: req.params.assignmentId, userId: req.user.id }
    });
    res.json({ success: true, data: submission });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error submitting assignment' });
  }
};

const gradeSubmission = async (req, res) => {
  try {
    const { grade, feedback } = req.body;
    const submission = await prisma.submission.update({
      where: { id: req.params.submissionId },
      data: { grade, feedback }
    });
    res.json({ success: true, data: submission });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error grading submission' });
  }
};

// --- DISCUSSIONS ---
const getTopics = async (req, res) => {
  try {
    const topics = await prisma.discussionTopic.findMany({ 
      where: { courseId: req.params.id },
      include: { author: { select: { name: true, avatar: true } }, _count: { select: { posts: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: topics });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching topics' });
  }
};

const createTopic = async (req, res) => {
  try {
    const { title, content } = req.body;
    const topic = await prisma.discussionTopic.create({
      data: { title, content, courseId: req.params.id, authorId: req.user.id },
      include: { author: { select: { name: true, avatar: true } }, _count: { select: { posts: true } } }
    });
    res.json({ success: true, data: topic });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating topic' });
  }
};

const getTopicPosts = async (req, res) => {
  try {
    const posts = await prisma.discussionPost.findMany({
      where: { topicId: req.params.topicId },
      include: { author: { select: { name: true, avatar: true } } },
      orderBy: { createdAt: 'asc' }
    });
    res.json({ success: true, data: posts });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching posts' });
  }
};

const createPost = async (req, res) => {
  try {
    const { content } = req.body;
    const post = await prisma.discussionPost.create({
      data: { content, topicId: req.params.topicId, authorId: req.user.id },
      include: { author: { select: { name: true, avatar: true } } }
    });
    res.json({ success: true, data: post });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating post' });
  }
};

// --- AGENT ---
const getAgent = async (req, res) => {
  try {
    const agent = await prisma.courseAgent.findUnique({ where: { courseId: req.params.id } });
    res.json({ success: true, data: agent });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching agent' });
  }
};

const updateAgent = async (req, res) => {
  try {
    const { name, systemPrompt, isActive } = req.body;
    const agent = await prisma.courseAgent.upsert({
      where: { courseId: req.params.id },
      update: { name, systemPrompt, isActive },
      create: { name, systemPrompt, isActive, courseId: req.params.id }
    });
    res.json({ success: true, data: agent });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating agent' });
  }
};

const chatWithAgent = async (req, res) => {
  try {
    const { message } = req.body;
    const agent = await prisma.courseAgent.findUnique({ where: { courseId: req.params.id } });
    if (!agent || !agent.isActive) {
      return res.status(400).json({ success: false, message: 'Agent is not available for this course.' });
    }
    
    // MOCK RESPONSE FOR INTELLIGENT AGENT
    const response = `[AI Assistant ${agent.name}]: I received your message "${message}". This is a simulated intelligent response based on the course context.`;
    
    res.json({ success: true, data: { response } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error chatting with agent' });
  }
};

// --- ANALYTICS ---
const getCourseAnalytics = async (req, res) => {
  try {
    const id = req.params.id;
    // Compute some mock analytics based on DB stats
    const totalEnrollments = await prisma.enrollment.count({ where: { courseId: id } });
    const assignments = await prisma.assignment.findMany({ where: { courseId: id }, include: { _count: { select: { submissions: true } } } });
    
    let totalSubmissions = 0;
    assignments.forEach(a => { totalSubmissions += a._count.submissions; });
    
    res.json({
      success: true,
      data: {
        totalEnrollments,
        totalAssignments: assignments.length,
        totalSubmissions,
        averageEngagement: Math.floor(Math.random() * 40) + 60, // Mock
        completionRate: Math.floor(Math.random() * 30) + 70 // Mock
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching analytics' });
  }
};

module.exports = {
  getCourses, getCourseById, enrollSelf,
  getOutcomes, createOutcome, deleteOutcome,
  getAnnouncements, createAnnouncement, deleteAnnouncement,
  getAssignments, createAssignment, submitAssignment, gradeSubmission,
  getTopics, createTopic, getTopicPosts, createPost,
  getAgent, updateAgent, chatWithAgent,
  getCourseAnalytics
};
