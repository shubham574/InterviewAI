const mongoose = require('mongoose');

const LiveInterviewSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    jobRole: {
      type: String,
      required: true,
    },
    jobDescription: {
      type: String,
      required: true,
    },
    totalQuestions: {
      type: Number,
      required: true,
      default: 5,
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
        difficulty: String,
        keyPoints: [String],
      },
    ],
    // Each turn = one attempt at one question
    turns: [
      {
        questionIndex: Number,
        attempt: Number,           // 1 or 2
        userAnswer: String,
        score: Number,
        isPassing: Boolean,
        action: String,            // "next" | "retry" | "followup"
        shristiResponse: String,   // what Shristi said aloud
        feedback: String,          // internal feedback for results
        strengths: [String],
        improvements: [String],
      },
    ],
    overallFeedback: {
      averageScore: Number,
      totalTurns: Number,
      strengths: [String],
      weaknesses: [String],
      recommendations: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('LiveInterview', LiveInterviewSchema);
