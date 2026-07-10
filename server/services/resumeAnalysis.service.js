const { generateContent } = require('./gemini.service');
const { resumeAnalysisPrompt } = require('../utils/prompts');

const analyzeResume = async (resumeText, jobDescription, customApiKey = null) => {
  const prompt = resumeAnalysisPrompt(resumeText, jobDescription);
  const result = await generateContent(prompt, customApiKey);
  return result;
};

module.exports = {
  analyzeResume,
};
