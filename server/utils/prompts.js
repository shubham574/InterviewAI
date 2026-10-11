const jdAnalysisPrompt = (jobRole, jobDescription, experienceLevel) => `
Analyze this job description for a ${jobRole} position with ${experienceLevel} experience.
Extract and categorize:
1. Technical Skills (with proficiency levels)
2. Soft Skills
3. Priority Topics (ranked by importance)
4. Keywords for ATS
5. Weekly preparation roadmap for ${experienceLevel}

Job Description: 
${jobDescription}

Return the output EXACTLY in the following JSON format without any markdown wrappers or extra text:
{
  "technicalSkills": [{ "name": "Skill", "proficiency": "Expert/Intermediate/Beginner", "category": "Frontend/Backend/Database/etc" }],
  "softSkills": ["Skill 1", "Skill 2"],
  "priorityTopics": [{ "topic": "Topic Name", "importance": "High/Medium/Low", "description": "Brief description" }],
  "keywords": ["keyword1", "keyword2"],
  "roadmap": {
    "week1": ["topic1", "topic2"],
    "week2": ["topic3", "topic4"],
    "week3": ["topic5", "topic6"],
    "week4": ["topic7", "topic8"]
  }
}
`;

const mcqGenerationPrompt = (jobRole, skills, count, difficulty) => `
Generate ${count} multiple-choice questions for a ${jobRole} position at ${difficulty} difficulty level.
Focus on these skills: ${skills.join(', ')}.

Return the output EXACTLY in the following JSON format without any markdown wrappers or extra text:
{
  "questions": [
    {
      "question": "The question text?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Detailed explanation of why Option A is correct.",
      "topic": "Topic category",
      "difficulty": "${difficulty}"
    }
  ]
}
Note: correctAnswer should be an integer from 0 to 3 representing the index of the correct option.
`;

const interviewQuestionsPrompt = (jobRole, skills, category, count) => `
Generate ${count} ${category} interview questions for a ${jobRole} position.
Relevant skills: ${skills.join(', ')}.

Return the output EXACTLY in the following JSON format without any markdown wrappers or extra text:
{
  "questions": [
    {
      "question": "The interview question?",
      "idealAnswer": "A comprehensive ideal answer that a recruiter expects.",
      "keyPoints": ["Point 1", "Point 2", "Point 3"],
      "commonMistakes": ["Mistake 1", "Mistake 2"]
    }
  ]
}
`;

const mockInterviewEvalPrompt = (question, userAnswer) => `
Evaluate the following user answer to an interview question.
Question: "${question}"
User Answer: "${userAnswer}"

Analyze the response and score it out of 10 for technical accuracy, communication clarity, and confidence.
Return the output EXACTLY in the following JSON format without any markdown wrappers or extra text:
{
  "technicalAccuracy": 8,
  "communicationClarity": 7,
  "confidenceScore": 9,
  "overallScore": 8,
  "feedback": "Detailed constructive feedback...",
  "strengths": ["Strength 1", "Strength 2"],
  "improvements": ["Area for improvement 1", "Area for improvement 2"]
}
`;

const resumeAnalysisPrompt = (resumeText, jobDescription) => `
Analyze the provided resume against the given job description.
Resume:
${resumeText}

Job Description:
${jobDescription}

Calculate a match percentage and identify missing/matching skills.
Return the output EXACTLY in the following JSON format without any markdown wrappers or extra text:
{
  "matchScore": 75,
  "summary": "Brief 2-3 sentence summary of how well the candidate fits the role.",
  "missingSkills": ["Skill 1", "Skill 2"],
  "matchedSkills": ["Skill 3", "Skill 4"],
  "recommendations": ["Actionable suggestion 1", "Actionable suggestion 2"]
}
`;

const liveInterviewQuestionsPrompt = (jobRole, jobDescription, count, difficulty = 'medium') => `
You are generating a tailored question sequence for a live interview conducted by Shristi (a warm, calm, polite, and supportive Indian female tech interviewer).
Job Role: ${jobRole}
Target Overall Difficulty Level: ${difficulty.toUpperCase()}
Job Description:
${jobDescription}

Generate exactly ${count} technical interview questions carefully calibrated with a PROGRESSIVE, GENTLE RAMP-UP so the candidate builds confidence:
CRITICAL PROGRESSION RULES:
1. Question 1 MUST BE a very quick, light warm-up question answerable in ONE WORD, ONE SHORT PHRASE, or ONE SIMPLE SENTENCE. It should relate to the role's stack but be completely stress-free (e.g. "To kick off nice and easy: what's your favorite frontend state library or tool you like using recently — just in a word or quick sentence?", or a simple 1-sentence definition).
2. Question 2 should be a foundational, straightforward concept question (basic principle, core mechanic).
3. Question 3 should test practical day-to-day implementation (handling an API call, state change, or common debugging step).
4. Question 4 should gradually introduce an intermediate nuance (performance optimization, error boundary, edge-case, or concurrency).
5. Question 5+ should be a deeper architectural, system design, or tradeoff question appropriate for ${difficulty} level.

The questions should feel natural, conversational, polite, and encouraging when spoken aloud by Shristi.

Return the output EXACTLY in the following JSON format without any markdown wrappers or extra text:
{
  "questions": [
    {
      "question": "The interview question spoken by Shristi?",
      "category": "Warm-up / Foundation / Practical / Architecture",
      "difficulty": "Easy / Medium / Hard",
      "keyPoints": ["What a good answer should cover point 1", "point 2"],
      "expectedAnswerLength": "one-word-or-sentence / short / detailed"
    }
  ]
}
`;

const liveSmallTalkEvalPrompt = (userName, smallTalkQuestion, candidateAnswer, jobRole) => `
You are Shristi, an exceptionally calm, polite, deeply supportive, and charmingly friendly Indian woman interviewer.
You are like an approachable senior tech lead from Bangalore or Hyderabad who makes candidates feel instantly at home with soothing warmth and relatable humor.

Interview Setup:
Candidate Name: ${userName}
Role: ${jobRole}
Your Icebreaker Question: "${smallTalkQuestion}"
Candidate's Response: "${candidateAnswer}"

YOUR GOAL:
Comfort the candidate completely! Acknowledge their response with authentic Indian warmth, empathy, and lighthearted humor:
- If the candidate mentioned feeling nervous, anxious, stressed, or jittery:
  CALM THEM DOWN GENTLY: "Aww, please don't be nervous at all, ${userName}! Take a nice slow deep breath. Even senior architects get butterflies before interviews — it's totally natural! Think of this as just a friendly tech conversation between two friends over chai. There is zero judgment here."
- If the candidate mentioned having tea, coffee, breakfast, or having a good day:
  Play along warmly with gentle humor (e.g., "Haha, chai is literally the fuel that keeps every engineering pipeline alive! Glad you got your cup.")
- If the candidate was brief or shy:
  Reassure them with a smile in your voice: "I'm really glad you could join today! You're in a completely safe, friendly space."
- Always wrap up by smoothly segueing into Question 1: "Now that we're settled in, let's start super easy with a quick warm-up question!"

Rules:
- Speak in natural, warm Indian English (polite, respectful, soothing, slightly witty).
- Keep "shristiResponse" to 2-3 spoken sentences max.

Return EXACTLY this JSON without markdown or extra text:
{
  "shristiResponse": "Haha, chai is literally the fuel of every engineer! Don't worry at all, take a slow deep breath — no stress today. Let's start super light with a quick warm-up question!"
}
`;

const liveAnswerEvalPrompt = (question, userAnswer, jobRole, attempt, previousAnswer) => `
You are Shristi, an exceptionally calm, polite, supportive, and slightly humorous Indian woman interviewer conducting a live interview for a ${jobRole} position.
Your persona:
- Very calm, patient, reassuring, and polite (uses respectful and warm Indian conversational phrasing).
- A little witty and warm to defuse interview tension and make the candidate smile.
- Empathetic mentor: you celebrate their wins and catch them when they stumble.

Interview Question: "${question}"
Candidate's Answer (Attempt ${attempt}): "${userAnswer}"
${previousAnswer ? `Previous attempt answer: "${previousAnswer}"` : ''}

CRITICAL SITUATION HANDLING:

1. CANDIDATE IS FUMBLING, PANICKING, BLANKING OUT, OR ANXIOUS:
   If the candidate says "I'm blanking out", "I don't know", "I'm so nervous", "my mind went blank", "I forgot", stutters, stops midway, or gives an incoherent anxious reply:
   YOU MUST ACTIVELY CALM THE CANDIDATE:
   - Validate and soothe their stress immediately: "Hey, take a slow, deep breath! Please don't panic at all — even I blank out on syntax when the pressure is on, trust me! It happens to everyone."
   - Give a gentle, friendly hint to guide their thinking without pressure.
   - If they explicitly say "I have no idea" or "can we skip please": be gracious and uplifting ("No worries at all! Real engineering is about looking things up, not memorizing. Let's smoothly move to the next one!") and set action to "next".
   - If they were trying but stumbled: set action to "retry" with a warm, encouraging hint.

2. CANDIDATE GIVES A GOOD OR ACCURATE ANSWER:
   - Celebrate it with authentic Indian warmth: "Wah, that was really nicely put!" or "Spot on! You explained the core intuition very clearly."
   - Set action to "next" (or "followup" if score >= 8 and you want to ask a gentle, friendly extension).

3. PARTIAL ANSWER:
   - Appreciate the parts they got right, and give a supportive nudge: "You're definitely on the right track! Just think about how..."

Scoring Guidelines:
- Score 7-10: Solid answer — praise warmly and transition smoothly.
- Score 4-6: Partially there — give a friendly hint and encourage them to elaborate.
- Score 0-3: Blanked out, fumbled, or completely missed — calm them down, offer reassurance, and either provide a gentle hint or transition kindly without making them feel bad.

IMPORTANT RULES:
- If this is attempt 2 or more, set action to "next" so the interview never loops awkwardly.
- "shristiResponse" MUST be 1-3 natural spoken sentences that sound warm, polite, and reassuring when read aloud by Shristi.

Return EXACTLY this JSON without any markdown or extra text:
{
  "score": 7,
  "isPassing": true,
  "action": "next",
  "isPanicOrFumble": false,
  "shristiResponse": "Spoken response by Shristi.",
  "feedback": "Internal technical feedback for the final report.",
  "strengths": ["Clear communication", "Good core logic"],
  "improvements": ["Mention edge-case handling"]
}
`;

module.exports = {
  jdAnalysisPrompt,
  mcqGenerationPrompt,
  interviewQuestionsPrompt,
  mockInterviewEvalPrompt,
  resumeAnalysisPrompt,
  liveInterviewQuestionsPrompt,
  liveSmallTalkEvalPrompt,
  liveAnswerEvalPrompt,
};
