const MockInterview = require('../models/MockInterview');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { generateInterviewQuestions } = require('../services/interviewGen.service');
const { evaluateAnswer } = require('../services/mockEvaluation.service');

// @desc    Start new mock interview
// @route   POST /api/mock-interview/start
// @access  Private
exports.startInterview = asyncHandler(async (req, res, next) => {
  const { jobRole, totalQuestions = 10 } = req.body;

  if (!jobRole) {
    return next(new ApiError(400, 'Please provide job role'));
  }

  // We need to generate questions first
  // Let's use a mixed category approach
  const customApiKey = req.headers['x-gemini-api-key'];
  const aiResult = await generateInterviewQuestions(
    jobRole, 
    ['general frontend', 'backend', 'soft skills'], // generic for mock
    'mixed technical and HR', 
    totalQuestions,
    customApiKey
  );

  const questions = aiResult.questions.map(q => ({
    question: q.question,
    category: 'Mixed', // Simplified
  }));

  const mockInterview = await MockInterview.create({
    userId: req.auth.userId,
    jobRole,
    totalQuestions,
    questions,
  });

  res.status(201).json({
    success: true,
    data: mockInterview,
  });
});

// @desc    Submit answer for evaluation
// @route   POST /api/mock-interview/:id/answer
// @access  Private
exports.submitAnswer = asyncHandler(async (req, res, next) => {
  const { questionIndex, userAnswer } = req.body;
  const mockInterviewId = req.params.id;

  if (questionIndex === undefined || !userAnswer) {
    return next(new ApiError(400, 'Please provide questionIndex and userAnswer'));
  }

  const interview = await MockInterview.findById(mockInterviewId);

  if (!interview) {
    return next(new ApiError(404, 'Mock interview not found'));
  }

  if (interview.userId.toString() !== req.auth.userId) {
    return next(new ApiError(401, 'Not authorized'));
  }

  if (interview.status === 'completed') {
    return next(new ApiError(400, 'Interview already completed'));
  }

  const question = interview.questions[questionIndex].question;
  
  // Call AI for evaluation
  const customApiKey = req.headers['x-gemini-api-key'];
  const evaluation = await evaluateAnswer(question, userAnswer, customApiKey);

  // Add response to array
  interview.responses.push({
    questionIndex,
    userAnswer,
    aiEvaluation: evaluation,
  });

  await interview.save();

  res.status(200).json({
    success: true,
    data: evaluation,
  });
});

// @desc    Complete interview and calculate final scores
// @route   POST /api/mock-interview/:id/complete
// @access  Private
exports.completeInterview = asyncHandler(async (req, res, next) => {
  const interview = await MockInterview.findById(req.params.id);

  if (!interview) return next(new ApiError(404, 'Not found'));
  if (interview.userId.toString() !== req.auth.userId) return next(new ApiError(401, 'Not authorized'));

  const responses = interview.responses;
  
  if (responses.length === 0) {
    return next(new ApiError(400, 'Cannot complete empty interview'));
  }

  // Calculate averages — AI returns scores 0-10, convert to 0-100%
  let totalScoreSum = 0;
  let allStrengths = [];
  let allWeaknesses = [];

  responses.forEach(resp => {
    // overallScore from Gemini is 0-10
    totalScoreSum += (resp.aiEvaluation.overallScore || 0);
    if (Array.isArray(resp.aiEvaluation.strengths)) {
      allStrengths.push(...resp.aiEvaluation.strengths);
    }
    if (Array.isArray(resp.aiEvaluation.improvements)) {
      allWeaknesses.push(...resp.aiEvaluation.improvements);
    }
  });

  // Convert to 0-100 percentage
  const averageScore = Math.round((totalScoreSum / responses.length) * 10);

  const uniqueStrengths = [...new Set(allStrengths)].slice(0, 5);
  const uniqueWeaknesses = [...new Set(allWeaknesses)].slice(0, 5);

  interview.status = 'completed';
  interview.overallFeedback = {
    totalScore: totalScoreSum,
    averageScore,
    strengths: uniqueStrengths,
    weaknesses: uniqueWeaknesses,
    recommendations: uniqueWeaknesses.length > 0
      ? `Focus on improving: ${uniqueWeaknesses.slice(0, 2).join(' and ')}.`
      : 'Keep practicing to maintain your performance!',
  };

  await interview.save();

  // Return the FULL interview document so frontend has questions + responses
  res.status(200).json({
    success: true,
    data: interview,
  });
});

// @desc    Get single mock interview
// @route   GET /api/mock-interview/:id
// @access  Private
exports.getInterview = asyncHandler(async (req, res, next) => {
  const interview = await MockInterview.findById(req.params.id);
  
  if (!interview) return next(new ApiError(404, 'Not found'));
  if (interview.userId.toString() !== req.auth.userId) return next(new ApiError(401, 'Not authorized'));

  res.status(200).json({ success: true, data: interview });
});

// @desc    Get all mock interviews
// @route   GET /api/mock-interview
// @access  Private
exports.getInterviews = asyncHandler(async (req, res, next) => {
  const interviews = await MockInterview.find({ userId: req.auth.userId }).sort('-createdAt');
  res.status(200).json({ success: true, count: interviews.length, data: interviews });
});
