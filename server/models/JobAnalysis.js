const mongoose = require('mongoose');

const JobAnalysisSchema = new mongoose.Schema(
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
    jobDescription: {
      type: String,
      required: true,
    },
    experienceLevel: {
      type: String,
      enum: ['Fresher', '1-3 Years', '3-5 Years', '5-8 Years', '8+ Years'],
      required: true,
    },
    technicalSkills: [
      {
        name: String,
        proficiency: String,
        category: String,
      },
    ],
    softSkills: [String],
    priorityTopics: [
      {
        topic: String,
        importance: String,
        description: String,
      },
    ],
    keywords: [String],
    roadmap: {
      type: mongoose.Schema.Types.Mixed, // flexible object for weekly breakdown
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('JobAnalysis', JobAnalysisSchema);
