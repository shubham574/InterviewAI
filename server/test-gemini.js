require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function test() {
  const prompt = `
Generate 1 multiple-choice questions for a Software Engineer position at easy difficulty level.
Focus on these skills: React.

Return the output EXACTLY in the following JSON format without any markdown wrappers or extra text:
{
  "questions": [
    {
      "question": "The question text?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Detailed explanation of why Option A is correct.",
      "topic": "Topic category",
      "difficulty": "easy"
    }
  ]
}
Note: correctAnswer should be an integer from 0 to 3 representing the index of the correct option.
  `;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });
    console.log("RAW TEXT:");
    console.log(response.text);
  } catch (err) {
    console.error(err);
  }
}
test();
