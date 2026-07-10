const { GoogleGenAI } = require('@google/genai');
const { GEMINI_API_KEY } = require('../config/env');

/**
 * Generate a study guide for a specific topic tailored to a job role
 * @param {string} topic - The topic to generate material for (e.g., 'React Hooks')
 * @param {string} jobRole - The target job role (e.g., 'Senior Frontend Developer')
 * @param {string} customApiKey - Optional custom Gemini API key
 * @returns {Promise<string>} - Markdown formatted study guide
 */
exports.generateStudyMaterial = async (topic, jobRole, customApiKey = null) => {
  const apiKey = customApiKey || GEMINI_API_KEY;
  const ai = new GoogleGenAI({ apiKey });

  try {
    const prompt = `
      You are an expert technical interviewer and senior engineer mentoring a candidate.
      The candidate is preparing for the role of "${jobRole}".
      They need to study the topic: "${topic}".
      
      Create a concise, high-yield study guide for this topic specifically tailored for interview preparation.
      Format the response entirely in cleanly structured Markdown.
      
      Include the following sections:
      1. **Overview**: A brief summary of what this topic is and why it's important for a ${jobRole}.
      2. **Core Concepts**: Bullet points of the most critical concepts they absolutely must understand.
      3. **Common Interview Questions**: 3 common interview questions on this topic, with brief "ideal answer" hints.
      4. **Best Practices / Pitfalls**: 2-3 quick bullet points on things to do or avoid.
      
      Keep it actionable, easy to skim, and highly relevant. Do not include a markdown json codeblock, just return standard markdown text.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    let text = response.text;
    
    // Clean up if it returned markdown block
    text = text.replace(/^```markdown\n/, '').replace(/\n```$/, '');
    
    return text;
  } catch (error) {
    console.error('Error generating study material:', error);
    throw new Error('Failed to generate study material from AI.');
  }
};
