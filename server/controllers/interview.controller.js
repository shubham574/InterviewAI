const InterviewQuestion = require('../models/InterviewQuestion');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { generateInterviewQuestions } = require('../services/interviewGen.service');

// @desc    Generate interview questions
// @route   POST /api/interview/generate
// @access  Private
exports.generateQuestions = asyncHandler(async (req, res, next) => {
  const { jobRole, skills, category, count = 10 } = req.body;

  if (!jobRole || !skills || !category) {
    return next(new ApiError(400, 'Please provide job role, skills, and category'));
  }

  // Call Gemini AI service
  const aiResult = await generateInterviewQuestions(jobRole, skills, category, count);

  // Save to database
  const questionSet = await InterviewQuestion.create({
    userId: req.user.id,
    jobRole,
    category,
    questions: aiResult.questions,
  });

  res.status(201).json({
    success: true,
    data: questionSet,
  });
});

// @desc    Get all question sets for user
// @route   GET /api/interview
// @access  Private
exports.getQuestionSets = asyncHandler(async (req, res, next) => {
  const sets = await InterviewQuestion.find({ userId: req.user.id })
    .select('-questions') // Exclude questions for list view
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    count: sets.length,
    data: sets,
  });
});

// @desc    Get single question set
// @route   GET /api/interview/:id
// @access  Private
exports.getQuestionSet = asyncHandler(async (req, res, next) => {
  const set = await InterviewQuestion.findById(req.params.id);

  if (!set) {
    return next(new ApiError(404, 'Question set not found'));
  }

  // Make sure user owns it
  if (set.userId.toString() !== req.user.id) {
    return next(new ApiError(401, 'Not authorized to access this question set'));
  }

  res.status(200).json({
    success: true,
    data: set,
  });
});

// @desc    Delete question set
// @route   DELETE /api/interview/:id
// @access  Private
exports.deleteQuestionSet = asyncHandler(async (req, res, next) => {
  const set = await InterviewQuestion.findById(req.params.id);

  if (!set) {
    return next(new ApiError(404, 'Question set not found'));
  }

  if (set.userId.toString() !== req.user.id) {
    return next(new ApiError(401, 'Not authorized to delete this question set'));
  }

  await set.deleteOne();

  res.status(200).json({
    success: true,
    data: {},
  });
});
