const { generateContent } = require('./gemini.service');
const { interviewQuestionsPrompt } = require('../utils/prompts');

const generateInterviewQuestions = async (jobRole, skills, category, count) => {
  const prompt = interviewQuestionsPrompt(jobRole, skills, category, count);
  const result = await generateContent(prompt);
  return result;
};

module.exports = {
  generateInterviewQuestions,
};
