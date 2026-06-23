const mongoose = require('mongoose');

const MCQSchema = new mongoose.Schema(
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
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard', 'mixed'],
      required: true,
    },
    count: {
      type: Number,
      required: true,
    },
    questions: [
      {
        question: String,
        options: [String],
        correctAnswer: Number, // Index of correct option (0-3)
        explanation: String,
        topic: String,
        difficulty: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('MCQ', MCQSchema);
