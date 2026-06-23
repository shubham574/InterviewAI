const { generateContent } = require('./gemini.service');
const { mockInterviewEvalPrompt } = require('../utils/prompts');

const evaluateAnswer = async (question, userAnswer) => {
  const prompt = mockInterviewEvalPrompt(question, userAnswer);
  const result = await generateContent(prompt);
  return result;
};

module.exports = {
  evaluateAnswer,
};
