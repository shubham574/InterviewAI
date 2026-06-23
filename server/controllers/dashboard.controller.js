const Assessment = require('../models/Assessment');
const MockInterview = require('../models/MockInterview');
const JobAnalysis = require('../models/JobAnalysis');
const MCQ = require('../models/MCQ');
const InterviewQuestion = require('../models/InterviewQuestion');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get dashboard stats
// @route   GET /api/dashboard/stats
// @access  Private
exports.getStats = asyncHandler(async (req, res, next) => {
  const userId = req.auth.userId;

  // 1. Basic Counts
  const totalAssessments = await Assessment.countDocuments({ userId });
  const totalMockInterviews = await MockInterview.countDocuments({ userId });
  const totalAnalyses = await JobAnalysis.countDocuments({ userId });

  // 2. Average Score across assessments
  const assessments = await Assessment.find({ userId });
  let averageScore = 0;
  if (assessments.length > 0) {
    const totalScore = assessments.reduce((acc, curr) => acc + curr.score, 0);
    averageScore = Math.round(totalScore / assessments.length);
  }

  // 3. Interview Readiness (Combined metric)
  const mockInterviews = await MockInterview.find({ userId, status: 'completed' });
  let averageMockScore = 0;
  if (mockInterviews.length > 0) {
    const totalMock = mockInterviews.reduce((acc, curr) => acc + (curr.overallFeedback?.averageScore || 0), 0);
    averageMockScore = Math.round(totalMock / mockInterviews.length);
  }
  
  // Weights: 40% MCQ Assessment, 60% Mock Interview
  const readinessScore = Math.round((averageScore * 0.4) + (averageMockScore * 0.6)) || averageScore || averageMockScore || 0;

  // 4. Topic Performance
  // In a real scenario, we'd aggregate across assessment topic correctness
  const topicPerformance = [
    { topic: 'React', score: 85 },
    { topic: 'JavaScript', score: 70 },
    { topic: 'Node.js', score: 90 },
    { topic: 'System Design', score: 60 }
  ]; // Mock data for now, would aggregate actual assessment answers usually

  // 5. Recent Activity
  const activities = [];
  
  // Get recent from each collection
  const recentAssessments = await Assessment.find({ userId }).sort('-createdAt').limit(2);
  recentAssessments.forEach(a => activities.push({
    id: a._id,
    type: 'assessment',
    title: `Assessment: ${a.jobRole}`,
    date: a.createdAt,
    score: a.score
  }));

  const recentMocks = await MockInterview.find({ userId }).sort('-createdAt').limit(2);
  recentMocks.forEach(m => activities.push({
    id: m._id,
    type: 'mock_interview',
    title: `Mock Interview: ${m.jobRole}`,
    date: m.createdAt,
    status: m.status
  }));

  const recentAnalyses = await JobAnalysis.find({ userId }).sort('-createdAt').limit(2);
  recentAnalyses.forEach(ja => activities.push({
    id: ja._id,
    type: 'job_analysis',
    title: `Job Analysis: ${ja.jobRole}`,
    date: ja.createdAt
  }));

  // Sort combined activities by date descending
  activities.sort((a, b) => new Date(b.date) - new Date(a.date));

  // Progress over time (Mock data for line chart)
  const progressOverTime = assessments.map(a => ({
    name: new Date(a.createdAt).toLocaleDateString(),
    score: a.score
  })).reverse().slice(0, 10); // Last 10

  res.status(200).json({
    success: true,
    data: {
      stats: {
        totalAssessments,
        totalMockInterviews,
        totalAnalyses,
        averageScore,
        readinessScore
      },
      topicPerformance,
      progressOverTime,
      recentActivity: activities.slice(0, 5) // Top 5 overall
    }
  });
});
