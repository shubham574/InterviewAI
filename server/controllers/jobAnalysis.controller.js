const JobAnalysis = require('../models/JobAnalysis');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { analyzeJobDescription } = require('../services/jdAnalysis.service');

// @desc    Analyze job description
// @route   POST /api/job-analysis
// @access  Private
exports.analyzeJob = asyncHandler(async (req, res, next) => {
  const { jobRole, jobDescription, experienceLevel } = req.body;

  if (!jobRole || !jobDescription || !experienceLevel) {
    return next(new ApiError(400, 'Please provide job role, description and experience level'));
  }

  // Call Gemini AI service
  const aiResult = await analyzeJobDescription(jobRole, jobDescription, experienceLevel);

  // Save to database
  const analysis = await JobAnalysis.create({
    userId: req.auth.userId,
    jobRole,
    jobDescription,
    experienceLevel,
    technicalSkills: aiResult.technicalSkills,
    softSkills: aiResult.softSkills,
    priorityTopics: aiResult.priorityTopics,
    keywords: aiResult.keywords,
    roadmap: aiResult.roadmap,
  });

  res.status(201).json({
    success: true,
    data: analysis,
  });
});

// @desc    Get all analyses for user
// @route   GET /api/job-analysis
// @access  Private
exports.getAnalyses = asyncHandler(async (req, res, next) => {
  const analyses = await JobAnalysis.find({ userId: req.auth.userId }).sort('-createdAt');

  res.status(200).json({
    success: true,
    count: analyses.length,
    data: analyses,
  });
});

// @desc    Get single analysis
// @route   GET /api/job-analysis/:id
// @access  Private
exports.getAnalysis = asyncHandler(async (req, res, next) => {
  const analysis = await JobAnalysis.findById(req.params.id);

  if (!analysis) {
    return next(new ApiError(404, 'Analysis not found'));
  }

  // Make sure user owns analysis
  if (analysis.userId.toString() !== req.auth.userId) {
    return next(new ApiError(401, 'Not authorized to access this analysis'));
  }

  res.status(200).json({
    success: true,
    data: analysis,
  });
});

// @desc    Delete analysis
// @route   DELETE /api/job-analysis/:id
// @access  Private
exports.deleteAnalysis = asyncHandler(async (req, res, next) => {
  const analysis = await JobAnalysis.findById(req.params.id);

  if (!analysis) {
    return next(new ApiError(404, 'Analysis not found'));
  }

  // Make sure user owns analysis
  if (analysis.userId.toString() !== req.auth.userId) {
    return next(new ApiError(401, 'Not authorized to delete this analysis'));
  }

  await analysis.deleteOne();

  res.status(200).json({
    success: true,
    data: {},
  });
});
