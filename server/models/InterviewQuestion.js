const mongoose = require('mongoose');

const InterviewQuestionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    jobRole: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['technical', 'scenario', 'coding', 'system-design', 'hr'],
      required: true,
    },
    questions: [
      {
        question: String,
        idealAnswer: String,
        keyPoints: [String],
        commonMistakes: [String],
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('InterviewQuestion', InterviewQuestionSchema);
