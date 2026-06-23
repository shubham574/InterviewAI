const MCQ = require('../models/MCQ');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { generateMCQs } = require('../services/mcqGeneration.service');

// @desc    Generate new MCQs
// @route   POST /api/mcqs/generate
// @access  Private
exports.generateMCQSet = asyncHandler(async (req, res, next) => {
  const { jobRole, skills, count, difficulty } = req.body;

  if (!jobRole || !skills || !count || !difficulty) {
    return next(new ApiError(400, 'Please provide job role, skills, count, and difficulty'));
  }

  // Call Gemini AI service
  const aiResult = await generateMCQs(jobRole, skills, count, difficulty);

  // Save to database
  const mcqSet = await MCQ.create({
    userId: req.auth.userId,
    jobRole,
    difficulty,
    count,
    questions: aiResult.questions,
  });

  res.status(201).json({
    success: true,
    data: mcqSet,
  });
});

// @desc    Get all MCQ sets for user
// @route   GET /api/mcqs
// @access  Private
exports.getMCQSets = asyncHandler(async (req, res, next) => {
  const mcqSets = await MCQ.find({ userId: req.auth.userId })
    .select('-questions') // Don't send questions for list view
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    count: mcqSets.length,
    data: mcqSets,
  });
});

// @desc    Get single MCQ set
// @route   GET /api/mcqs/:id
// @access  Private
exports.getMCQSet = asyncHandler(async (req, res, next) => {
  const mcqSet = await MCQ.findById(req.params.id);

  if (!mcqSet) {
    return next(new ApiError(404, 'MCQ set not found'));
  }

  // Make sure user owns it
  if (mcqSet.userId.toString() !== req.auth.userId) {
    return next(new ApiError(401, 'Not authorized to access this MCQ set'));
  }

  res.status(200).json({
    success: true,
    data: mcqSet,
  });
});

// @desc    Delete MCQ set
// @route   DELETE /api/mcqs/:id
// @access  Private
exports.deleteMCQSet = asyncHandler(async (req, res, next) => {
  const mcqSet = await MCQ.findById(req.params.id);

  if (!mcqSet) {
    return next(new ApiError(404, 'MCQ set not found'));
  }

  if (mcqSet.userId.toString() !== req.auth.userId) {
    return next(new ApiError(401, 'Not authorized to delete this MCQ set'));
  }

  await mcqSet.deleteOne();

  res.status(200).json({
    success: true,
    data: {},
  });
});
