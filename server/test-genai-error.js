const { GoogleGenAI } = require('@google/genai');

async function test() {
  const ai = new GoogleGenAI({ apiKey: "INVALID_KEY_JUST_TESTING_ERROR_NAME" });
  try {
    await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: "Hello",
      config: {
        responseMimeType: "application/json",
      }
    });
  } catch (error) {
    console.log("Error name:", error.name);
    console.log("Error message:", error.message);
    console.log("Error keys:", Object.keys(error));
  }
}
test();
