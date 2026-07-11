const LiveInterview = require('../models/LiveInterview');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { generateLiveQuestions, evaluateLiveAnswer } = require('../services/liveInterview.service');

// @desc    Start a new live interview session
// @route   POST /api/live-interview/start
// @access  Private
exports.startInterview = asyncHandler(async (req, res, next) => {
  const { userName, jobRole, jobDescription, totalQuestions = 5 } = req.body;

  if (!userName || !jobRole || !jobDescription) {
    return next(new ApiError(400, 'Please provide userName, jobRole, and jobDescription'));
  }

  const customApiKey = req.headers['x-gemini-api-key'];

  // Generate questions tailored to the JD
  const aiResult = await generateLiveQuestions(
    jobRole,
    jobDescription,
    totalQuestions,
    customApiKey
  );

  const questions = (aiResult.questions || []).map((q) => ({
    question: q.question,
    category: q.category || 'General',
    difficulty: q.difficulty || 'Medium',
    keyPoints: q.keyPoints || [],
  }));

  const session = await LiveInterview.create({
    userId: req.auth.userId,
    userName,
    jobRole,
    jobDescription,
    totalQuestions: questions.length,
    questions,
  });

  res.status(201).json({
    success: true,
    data: session,
  });
});

// @desc    Submit answer for current turn; get Shristi's response + action
// @route   POST /api/live-interview/:id/turn
// @access  Private
exports.submitTurn = asyncHandler(async (req, res, next) => {
  const { questionIndex, userAnswer, attempt = 1, previousAnswer = null } = req.body;
  const sessionId = req.params.id;

  if (questionIndex === undefined || !userAnswer) {
    return next(new ApiError(400, 'Please provide questionIndex and userAnswer'));
  }

  const session = await LiveInterview.findById(sessionId);
  if (!session) return next(new ApiError(404, 'Live interview session not found'));
  if (session.userId.toString() !== req.auth.userId) return next(new ApiError(401, 'Not authorized'));
  if (session.status === 'completed') return next(new ApiError(400, 'Interview already completed'));

  const question = session.questions[questionIndex];
  if (!question) return next(new ApiError(400, 'Invalid question index'));

  const customApiKey = req.headers['x-gemini-api-key'];

  // Get Shristi's evaluation
  const evaluation = await evaluateLiveAnswer(
    question.question,
    userAnswer,
    session.jobRole,
    attempt,
    previousAnswer,
    customApiKey
  );

  // Force "next" action if on attempt 2+ regardless of score (prevent infinite retry)
  if (attempt >= 2 && evaluation.action === 'retry') {
    evaluation.action = 'next';
    evaluation.shristiResponse =
      `I appreciate your effort. Let's move on to the next question. ` +
      (evaluation.shristiResponse || '');
  }

  // Record the turn
  session.turns.push({
    questionIndex,
    attempt,
    userAnswer,
    score: evaluation.score || 0,
    isPassing: evaluation.isPassing || false,
    action: evaluation.action || 'next',
    shristiResponse: evaluation.shristiResponse || '',
    feedback: evaluation.feedback || '',
    strengths: evaluation.strengths || [],
    improvements: evaluation.improvements || [],
  });

  await session.save();

  res.status(200).json({
    success: true,
    data: {
      score: evaluation.score,
      isPassing: evaluation.isPassing,
      action: evaluation.action,
      shristiResponse: evaluation.shristiResponse,
      feedback: evaluation.feedback,
      strengths: evaluation.strengths,
      improvements: evaluation.improvements,
    },
  });
});

// @desc    Complete the live interview and compute overall score
// @route   POST /api/live-interview/:id/complete
// @access  Private
exports.completeInterview = asyncHandler(async (req, res, next) => {
  const session = await LiveInterview.findById(req.params.id);
  if (!session) return next(new ApiError(404, 'Not found'));
  if (session.userId.toString() !== req.auth.userId) return next(new ApiError(401, 'Not authorized'));

  const { turns } = session;
  if (turns.length === 0) return next(new ApiError(400, 'No answers recorded'));

  // Calculate aggregate stats from all passing turns (best attempt per question)
  const questionMap = {};
  turns.forEach((t) => {
    const key = t.questionIndex;
    if (!questionMap[key] || t.score > questionMap[key].score) {
      questionMap[key] = t;
    }
  });

  const bestTurns = Object.values(questionMap);
  const totalScore = bestTurns.reduce((sum, t) => sum + (t.score || 0), 0);
  const averageScore = Math.round((totalScore / bestTurns.length) * 10); // convert 0-10 → 0-100

  const allStrengths = bestTurns.flatMap((t) => t.strengths || []);
  const allWeaknesses = bestTurns.flatMap((t) => t.improvements || []);

  const uniqueStrengths = [...new Set(allStrengths)].slice(0, 5);
  const uniqueWeaknesses = [...new Set(allWeaknesses)].slice(0, 5);

  session.status = 'completed';
  session.overallFeedback = {
    averageScore,
    totalTurns: turns.length,
    strengths: uniqueStrengths,
    weaknesses: uniqueWeaknesses,
    recommendations:
      uniqueWeaknesses.length > 0
        ? `Focus on improving: ${uniqueWeaknesses.slice(0, 2).join(' and ')}.`
        : 'Excellent performance! Keep practicing to stay sharp.',
  };

  await session.save();

  res.status(200).json({
    success: true,
    data: session,
  });
});

// @desc    Get all live interview sessions for the user
// @route   GET /api/live-interview
// @access  Private
exports.getInterviews = asyncHandler(async (req, res, next) => {
  const sessions = await LiveInterview.find({ userId: req.auth.userId }).sort('-createdAt');
  res.status(200).json({ success: true, count: sessions.length, data: sessions });
});

// @desc    Get a single live interview session
// @route   GET /api/live-interview/:id
// @access  Private
exports.getInterview = asyncHandler(async (req, res, next) => {
  const session = await LiveInterview.findById(req.params.id);
  if (!session) return next(new ApiError(404, 'Not found'));
  if (session.userId.toString() !== req.auth.userId) return next(new ApiError(401, 'Not authorized'));
  res.status(200).json({ success: true, data: session });
});
