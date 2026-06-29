const prisma = require('../config/prisma');

// ─────────────── UNITS ───────────────

const getUnits = async (req, res) => {
  try {
    const { courseId } = req.params;
    const units = await prisma.courseUnit.findMany({
      where: { courseId },
      orderBy: { order: 'asc' },
      include: {
        quizzes: {
          include: { _count: { select: { questions: true, attempts: true } } }
        }
      }
    });
    res.json({ success: true, data: units });
  } catch (error) {
    console.error('getUnits error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch units' });
  }
};

const getUnit = async (req, res) => {
  try {
    const { unitId } = req.params;
    const unit = await prisma.courseUnit.findUnique({
      where: { id: unitId },
      include: {
        quizzes: {
          include: {
            questions: { orderBy: { order: 'asc' } },
            _count: { select: { attempts: true } }
          }
        }
      }
    });
    if (!unit) return res.status(404).json({ success: false, message: 'Unit not found' });
    res.json({ success: true, data: unit });
  } catch (error) {
    console.error('getUnit error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch unit' });
  }
};

const createUnit = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, description } = req.body;
    if (!title) return res.status(400).json({ success: false, message: 'Title is required' });

    // Get max order
    const maxOrder = await prisma.courseUnit.aggregate({
      where: { courseId },
      _max: { order: true }
    });

    const unit = await prisma.courseUnit.create({
      data: {
        title,
        description,
        courseId,
        order: (maxOrder._max.order ?? -1) + 1,
        htmlContent: '',
        cssContent: '',
        jsContent: ''
      }
    });
    res.status(201).json({ success: true, data: unit });
  } catch (error) {
    console.error('createUnit error:', error);
    res.status(500).json({ success: false, message: 'Failed to create unit' });
  }
};

const updateUnit = async (req, res) => {
  try {
    const { unitId } = req.params;
    const { title, description, htmlContent, cssContent, jsContent, isPublished, order } = req.body;

    const unit = await prisma.courseUnit.update({
      where: { id: unitId },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(htmlContent !== undefined && { htmlContent }),
        ...(cssContent !== undefined && { cssContent }),
        ...(jsContent !== undefined && { jsContent }),
        ...(isPublished !== undefined && { isPublished }),
        ...(order !== undefined && { order })
      }
    });
    res.json({ success: true, data: unit });
  } catch (error) {
    console.error('updateUnit error:', error);
    res.status(500).json({ success: false, message: 'Failed to update unit' });
  }
};

const deleteUnit = async (req, res) => {
  try {
    const { unitId } = req.params;
    await prisma.courseUnit.delete({ where: { id: unitId } });
    res.json({ success: true });
  } catch (error) {
    console.error('deleteUnit error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete unit' });
  }
};

// ─────────────── QUIZZES ───────────────

const getQuizzes = async (req, res) => {
  try {
    const { unitId } = req.params;
    const quizzes = await prisma.quiz.findMany({
      where: { unitId },
      include: {
        questions: { orderBy: { order: 'asc' } },
        _count: { select: { attempts: true } }
      },
      orderBy: { createdAt: 'asc' }
    });
    res.json({ success: true, data: quizzes });
  } catch (error) {
    console.error('getQuizzes error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch quizzes' });
  }
};

const createQuiz = async (req, res) => {
  try {
    const { unitId } = req.params;
    const { title, description, timeLimit, maxAttempts } = req.body;
    if (!title) return res.status(400).json({ success: false, message: 'Title is required' });

    const quiz = await prisma.quiz.create({
      data: {
        title,
        description,
        unitId,
        timeLimit: timeLimit ? parseInt(timeLimit) : null,
        maxAttempts: maxAttempts ? parseInt(maxAttempts) : 1
      },
      include: { questions: true, _count: { select: { attempts: true } } }
    });
    res.status(201).json({ success: true, data: quiz });
  } catch (error) {
    console.error('createQuiz error:', error);
    res.status(500).json({ success: false, message: 'Failed to create quiz' });
  }
};

const updateQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { title, description, timeLimit, maxAttempts, isPublished } = req.body;
    const quiz = await prisma.quiz.update({
      where: { id: quizId },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(timeLimit !== undefined && { timeLimit: timeLimit ? parseInt(timeLimit) : null }),
        ...(maxAttempts !== undefined && { maxAttempts: parseInt(maxAttempts) }),
        ...(isPublished !== undefined && { isPublished })
      },
      include: { questions: true, _count: { select: { attempts: true } } }
    });
    res.json({ success: true, data: quiz });
  } catch (error) {
    console.error('updateQuiz error:', error);
    res.status(500).json({ success: false, message: 'Failed to update quiz' });
  }
};

const deleteQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    await prisma.quiz.delete({ where: { id: quizId } });
    res.json({ success: true });
  } catch (error) {
    console.error('deleteQuiz error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete quiz' });
  }
};

// ─────────────── QUESTIONS ───────────────

const createQuestion = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { type, questionText, optionsJson, correctAnswer, points } = req.body;

    if (!type || !questionText) {
      return res.status(400).json({ success: false, message: 'type and questionText are required' });
    }
    if (!['MCQ', 'SAQ'].includes(type)) {
      return res.status(400).json({ success: false, message: 'type must be MCQ or SAQ' });
    }

    const maxOrder = await prisma.quizQuestion.aggregate({
      where: { quizId },
      _max: { order: true }
    });

    const question = await prisma.quizQuestion.create({
      data: {
        type,
        questionText,
        optionsJson: optionsJson ? JSON.stringify(optionsJson) : null,
        correctAnswer,
        points: points ? parseInt(points) : 1,
        order: (maxOrder._max.order ?? -1) + 1,
        quizId
      }
    });
    res.status(201).json({ success: true, data: question });
  } catch (error) {
    console.error('createQuestion error:', error);
    res.status(500).json({ success: false, message: 'Failed to create question' });
  }
};

const updateQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;
    const { type, questionText, optionsJson, correctAnswer, points, order } = req.body;
    const question = await prisma.quizQuestion.update({
      where: { id: questionId },
      data: {
        ...(type !== undefined && { type }),
        ...(questionText !== undefined && { questionText }),
        ...(optionsJson !== undefined && { optionsJson: JSON.stringify(optionsJson) }),
        ...(correctAnswer !== undefined && { correctAnswer }),
        ...(points !== undefined && { points: parseInt(points) }),
        ...(order !== undefined && { order })
      }
    });
    res.json({ success: true, data: question });
  } catch (error) {
    console.error('updateQuestion error:', error);
    res.status(500).json({ success: false, message: 'Failed to update question' });
  }
};

const deleteQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;
    await prisma.quizQuestion.delete({ where: { id: questionId } });
    res.json({ success: true });
  } catch (error) {
    console.error('deleteQuestion error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete question' });
  }
};

// ─────────────── ATTEMPTS ───────────────

const submitAttempt = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { answers } = req.body; // [{ questionId, answerText }]
    const userId = req.user.id;

    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: { questions: true }
    });
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });

    // Check attempt count
    const existingAttempts = await prisma.quizAttempt.count({
      where: { quizId, userId, status: { in: ['SUBMITTED', 'GRADED'] } }
    });
    if (existingAttempts >= quiz.maxAttempts) {
      return res.status(400).json({ success: false, message: 'Maximum attempts reached' });
    }

    // Auto-grade MCQs, flag SAQs for manual grading
    let score = 0;
    let maxScore = 0;
    let hasSAQ = false;

    const answersData = (answers || []).map(({ questionId, answerText }) => {
      const question = quiz.questions.find(q => q.id === questionId);
      if (!question) return null;

      maxScore += question.points;
      let isCorrect = null;
      let pointsAwarded = null;

      if (question.type === 'MCQ') {
        isCorrect = answerText === question.correctAnswer;
        pointsAwarded = isCorrect ? question.points : 0;
        score += pointsAwarded;
      } else {
        hasSAQ = true; // SAQ needs manual grading
      }

      return { questionId, answerText: String(answerText || ''), isCorrect, pointsAwarded };
    }).filter(Boolean);

    const attempt = await prisma.quizAttempt.create({
      data: {
        quizId,
        userId,
        score: hasSAQ ? null : score,
        maxScore,
        status: hasSAQ ? 'SUBMITTED' : 'GRADED',
        submittedAt: new Date(),
        answers: {
          create: answersData
        }
      },
      include: { answers: { include: { question: true } } }
    });

    res.status(201).json({ success: true, data: attempt });
  } catch (error) {
    console.error('submitAttempt error:', error);
    res.status(500).json({ success: false, message: 'Failed to submit attempt' });
  }
};

const getAttempts = async (req, res) => {
  try {
    const { quizId } = req.params;
    const role = req.user.role;
    const userId = req.user.id;

    const where = { quizId };
    // Students only see their own attempts
    if (role === 'STUDENT') where.userId = userId;

    const attempts = await prisma.quizAttempt.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true } },
        answers: { include: { question: { select: { type: true, questionText: true, correctAnswer: true, points: true } } } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: attempts });
  } catch (error) {
    console.error('getAttempts error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch attempts' });
  }
};

const gradeAnswer = async (req, res) => {
  try {
    const { answerId } = req.params;
    const { pointsAwarded, feedback } = req.body;

    const answer = await prisma.quizAnswer.update({
      where: { id: answerId },
      data: {
        pointsAwarded: parseFloat(pointsAwarded),
        isCorrect: parseFloat(pointsAwarded) > 0,
        feedback
      }
    });

    // Recalculate attempt total score
    const attempt = await prisma.quizAttempt.findUnique({
      where: { id: answer.attemptId },
      include: { answers: true }
    });

    const allGraded = attempt.answers.every(a => a.pointsAwarded !== null);
    const totalScore = attempt.answers.reduce((sum, a) => sum + (a.pointsAwarded || 0), 0);

    await prisma.quizAttempt.update({
      where: { id: answer.attemptId },
      data: {
        score: allGraded ? totalScore : attempt.score,
        status: allGraded ? 'GRADED' : 'SUBMITTED'
      }
    });

    res.json({ success: true, data: answer });
  } catch (error) {
    console.error('gradeAnswer error:', error);
    res.status(500).json({ success: false, message: 'Failed to grade answer' });
  }
};

module.exports = {
  getUnits, getUnit, createUnit, updateUnit, deleteUnit,
  getQuizzes, createQuiz, updateQuiz, deleteQuiz,
  createQuestion, updateQuestion, deleteQuestion,
  submitAttempt, getAttempts, gradeAnswer
};
