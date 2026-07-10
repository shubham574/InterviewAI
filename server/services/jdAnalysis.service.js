const { generateContent } = require('./gemini.service');
const { jdAnalysisPrompt } = require('../utils/prompts');

const analyzeJobDescription = async (jobRole, jobDescription, experienceLevel, customApiKey = null) => {
  const prompt = jdAnalysisPrompt(jobRole, jobDescription, experienceLevel);
  const result = await generateContent(prompt, customApiKey);
  return result;
};

module.exports = {
  analyzeJobDescription,
};
