const Assessment = require('../models/Assessment');
const MockInterview = require('../models/MockInterview');
const JobAnalysis = require('../models/JobAnalysis');
const MCQ = require('../models/MCQ');
const InterviewQuestion = require('../models/InterviewQuestion');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

// @desc    Get combined history
// @route   GET /api/history
// @access  Private
exports.getHistory = asyncHandler(async (req, res, next) => {
  const userId = req.auth.userId;
  const { type = 'all', page = 1, limit = 20 } = req.query;
  const skip = (page - 1) * limit;

  let results = [];

  const addType = (items, typeName) => {
    return items.map(item => ({
      ...item.toObject(),
      historyType: typeName
    }));
  };

  if (type === 'all' || type === 'analysis') {
    const items = await JobAnalysis.find({ userId }).lean();
    results.push(...addType(items, 'analysis'));
  }

  if (type === 'all' || type === 'mcq') {
    const items = await MCQ.find({ userId }).select('-questions').lean();
    results.push(...addType(items, 'mcq'));
  }

  if (type === 'all' || type === 'assessment') {
    const items = await Assessment.find({ userId }).lean();
    results.push(...addType(items, 'assessment'));
  }

  if (type === 'all' || type === 'interview') {
    const items = await InterviewQuestion.find({ userId }).select('-questions').lean();
    results.push(...addType(items, 'interview'));
  }

  if (type === 'all' || type === 'mock') {
    const items = await MockInterview.find({ userId }).select('-questions -responses').lean();
    results.push(...addType(items, 'mock'));
  }

  // Sort by date descending
  results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // Pagination
  const paginatedResults = results.slice(skip, skip + Number(limit));

  res.status(200).json({
    success: true,
    count: results.length,
    pagination: {
      total: results.length,
      page: Number(page),
      pages: Math.ceil(results.length / limit)
    },
    data: paginatedResults
  });
});

// @desc    Delete history item
// @route   DELETE /api/history/:type/:id
// @access  Private
exports.deleteHistoryItem = asyncHandler(async (req, res, next) => {
  const { type, id } = req.params;
  const userId = req.auth.userId;

  let model;
  switch (type) {
    case 'analysis': model = JobAnalysis; break;
    case 'mcq': model = MCQ; break;
    case 'assessment': model = Assessment; break;
    case 'interview': model = InterviewQuestion; break;
    case 'mock': model = MockInterview; break;
    default: return next(new ApiError(400, 'Invalid history type'));
  }

  const item = await model.findOneAndDelete({ _id: id, userId });

  if (!item) {
    return next(new ApiError(404, 'Item not found or unauthorized'));
  }

  res.status(200).json({ success: true, data: {} });
});
