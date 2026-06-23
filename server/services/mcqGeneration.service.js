const { generateContent } = require('./gemini.service');
const { mcqGenerationPrompt } = require('../utils/prompts');

const generateMCQs = async (jobRole, skills, count, difficulty) => {
  const prompt = mcqGenerationPrompt(jobRole, skills, count, difficulty);
  const result = await generateContent(prompt);
  return result;
};

module.exports = {
  generateMCQs,
};
