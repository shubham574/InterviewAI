const Assessment = require('../models/Assessment');
const MCQ = require('../models/MCQ');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

// @desc    Submit assessment
// @route   POST /api/assessments
// @access  Private
exports.submitAssessment = asyncHandler(async (req, res, next) => {
  const { mcqSetId, answers, timeTaken } = req.body;

  if (!mcqSetId || !answers || timeTaken === undefined) {
    return next(new ApiError(400, 'Please provide mcqSetId, answers, and timeTaken'));
  }

  const mcqSet = await MCQ.findById(mcqSetId);

  if (!mcqSet) {
    return next(new ApiError(404, 'MCQ set not found'));
  }

  // Calculate score
  let correctAnswers = 0;
  const processedAnswers = answers.map((answer) => {
    const question = mcqSet.questions[answer.questionIndex];
    const isCorrect = answer.selectedAnswer === question.correctAnswer;
    if (isCorrect) correctAnswers++;
    
    return {
      questionIndex: answer.questionIndex,
      selectedAnswer: answer.selectedAnswer,
      isCorrect,
    };
  });

  const totalQuestions = mcqSet.questions.length;
  const incorrectAnswers = totalQuestions - correctAnswers;
  const accuracy = Math.round((correctAnswers / totalQuestions) * 100);
  // Score out of 100
  const score = Math.round((correctAnswers / totalQuestions) * 100);

  const assessment = await Assessment.create({
    userId: req.auth.userId,
    mcqSetId,
    jobRole: mcqSet.jobRole,
    score,
    totalQuestions,
    correctAnswers,
    incorrectAnswers,
    accuracy,
    timeTaken,
    answers: processedAnswers,
  });

  res.status(201).json({
    success: true,
    data: assessment,
  });
});

// @desc    Get all assessments for user
// @route   GET /api/assessments
// @access  Private
exports.getAssessments = asyncHandler(async (req, res, next) => {
  const assessments = await Assessment.find({ userId: req.auth.userId })
    .populate('mcqSetId', 'difficulty count')
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    count: assessments.length,
    data: assessments,
  });
});

// @desc    Get single assessment
// @route   GET /api/assessments/:id
// @access  Private
exports.getAssessment = asyncHandler(async (req, res, next) => {
  const assessment = await Assessment.findById(req.params.id).populate('mcqSetId');

  if (!assessment) {
    return next(new ApiError(404, 'Assessment not found'));
  }

  // Make sure user owns it
  if (assessment.userId.toString() !== req.auth.userId) {
    return next(new ApiError(401, 'Not authorized to access this assessment'));
  }

  res.status(200).json({
    success: true,
    data: assessment,
  });
});
