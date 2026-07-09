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
      count: 10,
      questions: undefined,
    });
    
    await mcqSet.validate();
    console.log("MCQ Validated successfully with undefined questions");
  } catch (err) {
    console.error("MCQ Validation Error:", err.message);
  }

  try {
    const intSet = new InterviewQuestion({
      userId: 'test_user',
      jobRole: 'Frontend Developer',
      category: 'technical',
      questions: undefined,
    });
    
    await intSet.validate();
    console.log("Interview Validated successfully with undefined questions");
  } catch (err) {
    console.error("Interview Validation Error:", err.message);
  }
}

test();
