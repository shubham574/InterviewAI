const { GoogleGenAI } = require('@google/genai');
const { GEMINI_API_KEY } = require('../config/env');

const generateContent = async (prompt, customApiKey = null, retries = 3) => {
  const apiKey = customApiKey || GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('No Gemini API key configured. Please add a custom API key or set the GEMINI_API_KEY environment variable.');
  }

  const ai = new GoogleGenAI({ apiKey });

  let lastError;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          maxOutputTokens: 8192,
        }
      });

      const text = response.text;
      try {
        return JSON.parse(text);
      } catch (parseError) {
        // Try to extract JSON from markdown code blocks if needed
        const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (jsonMatch) return JSON.parse(jsonMatch[1]);
        throw new Error('AI returned invalid JSON: ' + text.substring(0, 200));
      }
    } catch (error) {
      lastError = error;
      console.error(`Gemini API Attempt ${attempt} failed: ${error.message}`);

      // Don't retry on auth/key errors - they won't resolve on retry
      if (error.message && (
        error.message.includes('API_KEY_INVALID') ||
        error.message.includes('PERMISSION_DENIED') ||
        error.message.includes('invalid api key') ||
        error.message.toLowerCase().includes('api key')
      )) {
        throw new Error(`Invalid Gemini API Key: ${error.message}`);
      }

      if (attempt < retries) {
        await new Promise(res => setTimeout(res, 1000 * attempt));
      }
    }
  }

  throw new Error(`Failed to generate content from AI after ${retries} attempts. Last error: ${lastError?.message || 'Unknown error'}`);
};

module.exports = {
  generateContent,
};
