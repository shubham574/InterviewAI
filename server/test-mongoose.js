require('dotenv').config();
const mongoose = require('mongoose');
const MCQ = require('./models/MCQ');
const InterviewQuestion = require('./models/InterviewQuestion');

async function test() {
  try {
    const mcqSet = new MCQ({
      userId: 'test_user',
      jobRole: 'Frontend Developer',
      difficulty: 'medium',
      count: 1,
      questions: [
        {
          question: "What is the primary purpose of a React component?",
          options: [
            "To manage database connections.",
            "To define a reusable UI piece.",
            "To handle server-side logic.",
            "To compile JavaScript code."
          ],
          correctAnswer: 1,
          explanation: "...",
          topic: "React Fundamentals",
          difficulty: "easy"
        }
      ]
    });
    
    await mcqSet.validate();
    console.log("MCQ Validated successfully");
  } catch (err) {
    console.error("MCQ Validation Error:", err.message);
  }

  try {
    const intSet = new InterviewQuestion({
      userId: 'test_user',
      jobRole: 'Frontend Developer',
      category: 'technical',
      questions: [
        {
          question: "What is the primary purpose of a React component?",
          idealAnswer: "...",
          keyPoints: ["point1"],
          commonMistakes: ["mistake1"]
        }
      ]
    });
    
    await intSet.validate();
    console.log("Interview Validated successfully");
  } catch (err) {
    console.error("Interview Validation Error:", err.message);
  }
}

test();
