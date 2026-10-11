const Assessment = require('../models/Assessment');
const MockInterview = require('../models/MockInterview');
const LiveInterview = require('../models/LiveInterview');
const JobAnalysis = require('../models/JobAnalysis');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get dashboard stats
// @route   GET /api/dashboard/stats
// @access  Private
exports.getStats = asyncHandler(async (req, res, next) => {
  const userId = req.auth.userId;

  // Execute all queries concurrently with lean projection for fastest response
  const [assessments, mockInterviews, liveInterviews, analyses] = await Promise.all([
    Assessment.find({ userId })
      .select('_id score jobRole createdAt')
      .sort('-createdAt')
      .lean(),
    MockInterview.find({ userId })
      .select('_id jobRole status overallFeedback.averageScore createdAt')
      .sort('-createdAt')
      .lean(),
    LiveInterview.find({ userId })
      .select('_id jobRole status overallFeedback.averageScore difficulty createdAt')
      .sort('-createdAt')
      .lean(),
    JobAnalysis.find({ userId })
      .select('_id jobRole createdAt')
      .sort('-createdAt')
      .lean(),
  ]);

  // 1. Basic Counts
  const totalAssessments = assessments.length;
  const totalMockInterviews = mockInterviews.length + liveInterviews.length;
  const totalAnalyses = analyses.length;

  // 2. Average Assessment Score
  let averageScore = 0;
  if (assessments.length > 0) {
    const totalScore = assessments.reduce((acc, curr) => acc + (curr.score || 0), 0);
    averageScore = Math.round(totalScore / assessments.length);
  }

  // 3. Interview Readiness (Combined metric of assessments, mocks, and live interviews)
  const completedMocks = mockInterviews.filter(m => m.status === 'completed' && m.overallFeedback?.averageScore != null);
  const completedLive = liveInterviews.filter(l => l.status === 'completed' && l.overallFeedback?.averageScore != null);
  const allCompletedInterviews = [...completedMocks, ...completedLive];

  let averageInterviewScore = 0;
  if (allCompletedInterviews.length > 0) {
    const totalInterviewScore = allCompletedInterviews.reduce(
      (acc, curr) => acc + (curr.overallFeedback?.averageScore || 0),
      0
    );
    averageInterviewScore = Math.round(totalInterviewScore / allCompletedInterviews.length);
  }

  // Weighted readiness score: 40% Assessments + 60% Practical Interviews
  let readinessScore = 0;
  if (assessments.length > 0 && allCompletedInterviews.length > 0) {
    readinessScore = Math.round((averageScore * 0.4) + (averageInterviewScore * 0.6));
  } else if (allCompletedInterviews.length > 0) {
    readinessScore = averageInterviewScore;
  } else if (assessments.length > 0) {
    readinessScore = averageScore;
  }

  // 4. Topic Performance (Derived or baseline)
  const topicPerformance = [
    { topic: 'System Design', score: Math.min(100, Math.max(40, readinessScore - 5)) },
    { topic: 'Data Structures', score: Math.min(100, Math.max(50, averageScore + 5)) },
    { topic: 'Core Technical', score: Math.min(100, Math.max(45, readinessScore + 8)) },
    { topic: 'Communication', score: Math.min(100, Math.max(55, averageInterviewScore || 70)) },
  ];

  // 5. Recent Activity (merged & sorted)
  const activities = [];

  assessments.slice(0, 3).forEach(a => activities.push({
    id: a._id,
    type: 'assessment',
    title: `Assessment: ${a.jobRole}`,
    date: a.createdAt,
    score: a.score
  }));

  mockInterviews.slice(0, 3).forEach(m => activities.push({
    id: m._id,
    type: 'mock_interview',
    title: `Mock Interview: ${m.jobRole}`,
    date: m.createdAt,
    status: m.status,
    score: m.overallFeedback?.averageScore
  }));

  liveInterviews.slice(0, 3).forEach(l => activities.push({
    id: l._id,
    type: 'live_interview',
    title: `Live Session: ${l.jobRole}`,
    date: l.createdAt,
    status: l.status,
    score: l.overallFeedback?.averageScore
  }));

  analyses.slice(0, 3).forEach(ja => activities.push({
    id: ja._id,
    type: 'job_analysis',
    title: `Job Analysis: ${ja.jobRole}`,
    date: ja.createdAt
  }));

  // Sort activities by date descending
  activities.sort((a, b) => new Date(b.date) - new Date(a.date));

  // Progress over time (Last 10 sessions)
  const progressOverTime = assessments
    .slice(0, 10)
    .map(a => ({
      name: new Date(a.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      score: a.score
    }))
    .reverse();

  res.status(200).json({
    success: true,
    data: {
      stats: {
        totalAssessments,
        totalMockInterviews,
        totalAnalyses,
        averageScore,
        readinessScore,
        completedInterviewsCount: allCompletedInterviews.length
      },
      topicPerformance,
      progressOverTime,
      recentActivity: activities.slice(0, 6)
    }
  });
});
