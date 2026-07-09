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
      questions: null,
    });
    
    await mcqSet.validate();
    console.log("MCQ Validated successfully with null questions");
  } catch (err) {
    console.error("MCQ Validation Error:", err.message);
  }
}
test();
