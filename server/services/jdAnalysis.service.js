const { generateContent } = require('./gemini.service');
const { jdAnalysisPrompt } = require('../utils/prompts');

const analyzeJobDescription = async (jobRole, jobDescription, experienceLevel) => {
  const prompt = jdAnalysisPrompt(jobRole, jobDescription, experienceLevel);
  const result = await generateContent(prompt);
  return result;
};

module.exports = {
  analyzeJobDescription,
};
