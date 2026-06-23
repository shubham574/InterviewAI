const mongoose = require('mongoose');

const MockInterviewSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    jobRole: {
      type: String,
      required: true,
    },
    totalQuestions: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['in-progress', 'completed'],
      default: 'in-progress',
    },
    questions: [
      {
        question: String,
        category: String,
      },
    ],
    responses: [
      {
        questionIndex: Number,
        userAnswer: String,
        aiEvaluation: {
          technicalAccuracy: Number,
          communicationClarity: Number,
          confidenceScore: Number,
          overallScore: Number,
          feedback: String,
          strengths: [String],
          improvements: [String],
        },
      },
    ],
    overallFeedback: {
      totalScore: Number,
      averageScore: Number,
      strengths: [String],
      weaknesses: [String],
      recommendations: [String],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('MockInterview', MockInterviewSchema);
