const prisma = require('../config/prisma');

/**
 * GET /api/surveys
 * Get surveys of a batch
 */
const getSurveys = async (req, res) => {
  try {
    const { batchId } = req.query;

    if (!batchId) {
      return res.status(400).json({ success: false, message: 'batchId is required' });
    }

    const surveys = await prisma.survey.findMany({
      where: { batchId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { questions: true, responses: true } },
      },
    });

    res.json({ success: true, data: surveys });
  } catch (error) {
    console.error('Get surveys error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch surveys' });
  }
};

/**
 * GET /api/surveys/:id
 * Get single survey with questions
 */
const getSurvey = async (req, res) => {
  try {
    const { id } = req.params;

    const survey = await prisma.survey.findUnique({
      where: { id },
      include: {
        questions: true,
        responses: {
          include: {
            user: { select: { id: true, name: true, email: true } },
            answers: {
              include: { question: { select: { text: true, type: true } } },
            },
          },
        },
      },
    });

    if (!survey) {
      return res.status(404).json({ success: false, message: 'Survey not found' });
    }

    res.json({ success: true, data: survey });
  } catch (error) {
    console.error('Get survey error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch survey details' });
  }
};

/**
 * POST /api/surveys
 * Create survey
 */
const createSurvey = async (req, res) => {
  try {
    const { title, description, batchId } = req.body;

    if (!title || !batchId) {
      return res.status(400).json({ success: false, message: 'Title and batchId are required' });
    }

    const survey = await prisma.survey.create({
      data: {
        title,
        description,
        batchId,
      },
    });

    res.status(201).json({ success: true, data: survey, message: 'Survey created successfully' });
  } catch (error) {
    console.error('Create survey error:', error);
    res.status(500).json({ success: false, message: 'Failed to create survey' });
  }
};

/**
 * DELETE /api/surveys/:id
 * Delete survey
 */
const deleteSurvey = async (req, res) => {
  try {
    const { id } = req.params;

    const survey = await prisma.survey.findUnique({ where: { id } });
    if (!survey) {
      return res.status(404).json({ success: false, message: 'Survey not found' });
    }

    await prisma.survey.delete({ where: { id } });

    res.json({ success: true, message: 'Survey deleted successfully' });
  } catch (error) {
    console.error('Delete survey error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete survey' });
  }
};

/**
 * POST /api/surveys/:id/questions
 * Add question to survey
 */
const addQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { text, type, options, isRequired = true } = req.body;

    if (!text || !type) {
      return res.status(400).json({ success: false, message: 'Text and type are required' });
    }

    const question = await prisma.surveyQuestion.create({
      data: {
        text,
        type,
        options: options || null,
        isRequired,
        surveyId: id,
      },
    });

    res.status(201).json({ success: true, data: question, message: 'Question added successfully' });
  } catch (error) {
    console.error('Add question error:', error);
    res.status(500).json({ success: false, message: 'Failed to add question to survey' });
  }
};

/**
 * DELETE /api/surveys/questions/:questionId
 * Delete question from survey
 */
const deleteQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;

    const question = await prisma.surveyQuestion.findUnique({ where: { id: questionId } });
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    await prisma.surveyQuestion.delete({ where: { id: questionId } });

    res.json({ success: true, message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Delete question error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete question' });
  }
};

/**
 * POST /api/surveys/:id/responses
 * Submit survey response
 */
const submitResponse = async (req, res) => {
  try {
    const { id } = req.params; // Survey ID
    const { answers } = req.body; // Array of { questionId, answer }

    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ success: false, message: 'Answers array is required' });
    }

    // Check duplicate response
    const existing = await prisma.surveyResponse.findUnique({
      where: { surveyId_userId: { surveyId: id, userId: req.user.id } },
    });

    if (existing) {
      return res.status(409).json({ success: false, message: 'You have already submitted a response to this survey' });
    }

    // Create the response and answers in a transaction
    const response = await prisma.$transaction(async (tx) => {
      const resp = await tx.surveyResponse.create({
        data: {
          surveyId: id,
          userId: req.user.id,
        },
      });

      const answersData = answers.map((ans) => ({
        responseId: resp.id,
        questionId: ans.questionId,
        answer: String(ans.answer),
      }));

      await tx.surveyAnswer.createMany({
        data: answersData,
      });

      return resp;
    });

    res.status(201).json({ success: true, data: response, message: 'Survey response submitted successfully' });
  } catch (error) {
    console.error('Submit response error:', error);
    res.status(500).json({ success: false, message: 'Failed to submit survey response' });
  }
};

module.exports = {
  getSurveys,
  getSurvey,
  createSurvey,
  deleteSurvey,
  addQuestion,
  deleteQuestion,
  submitResponse,
};
