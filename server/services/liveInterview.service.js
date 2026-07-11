const { generateContent } = require('./gemini.service');
const { liveInterviewQuestionsPrompt, liveAnswerEvalPrompt } = require('../utils/prompts');

/**
 * Generate JD-tailored interview questions for a live session
 */
const generateLiveQuestions = async (jobRole, jobDescription, count, customApiKey = null) => {
  const prompt = liveInterviewQuestionsPrompt(jobRole, jobDescription, count);
  const result = await generateContent(prompt, customApiKey);
  return result;
};

/**
 * Evaluate a live answer and get Shristi's adaptive response
 */
const evaluateLiveAnswer = async (
  question,
  userAnswer,
  jobRole,
  attempt,
  previousAnswer = null,
  customApiKey = null
) => {
  const prompt = liveAnswerEvalPrompt(question, userAnswer, jobRole, attempt, previousAnswer);
  const result = await generateContent(prompt, customApiKey);
  return result;
};

module.exports = {
  generateLiveQuestions,
  evaluateLiveAnswer,
};
