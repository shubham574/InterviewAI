const { GoogleGenAI } = require('@google/genai');
const { GEMINI_API_KEY } = require('../config/env');

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

const generateContent = async (prompt, retries = 3) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });
      
      return JSON.parse(response.text);
    } catch (error) {
      console.error(`Gemini API Attempt ${attempt} failed: ${error.message}`);
      if (attempt === retries) {
        throw new Error('Failed to generate content from AI after multiple attempts.');
      }
      // Wait for 1 second before retrying
      await new Promise(res => setTimeout(res, 1000));
    }
  }
};

module.exports = {
  generateContent,
};
