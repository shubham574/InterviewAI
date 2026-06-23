const { generateContent } = require('./gemini.service');
const { resumeAnalysisPrompt } = require('../utils/prompts');

const analyzeResume = async (resumeText, jobDescription) => {
  const prompt = resumeAnalysisPrompt(resumeText, jobDescription);
  const result = await generateContent(prompt);
  return result;
};

module.exports = {
  analyzeResume,
};
