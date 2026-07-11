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

const liveInterviewQuestionsPrompt = (jobRole, jobDescription, count) => `
You are generating interview questions for a live AI interview session.
Job Role: ${jobRole}
Job Description:
${jobDescription}

Generate exactly ${count} interview questions that are specifically tailored to this job description and role.
Focus strictly on deep technical questions to evaluate the candidate's core technical competencies, coding knowledge, system design, or domain expertise related to the job description. Do NOT include behavioral, soft skills, or generic scenario-based questions.

Return the output EXACTLY in the following JSON format without any markdown wrappers or extra text:
{
  "questions": [
    {
      "question": "The interview question?",
      "category": "Technical / Behavioral / Situational",
      "difficulty": "Easy / Medium / Hard",
      "keyPoints": ["What a good answer should cover point 1", "point 2"]
    }
  ]
}
`;

const liveAnswerEvalPrompt = (question, userAnswer, jobRole, attempt, previousAnswer) => `
You are Shristi, a professional and empathetic AI interviewer conducting a live interview for a ${jobRole} position.
Your personality: warm, encouraging but honest, professional.

Interview Question: "${question}"
Candidate's Answer (Attempt ${attempt}): "${userAnswer}"
${previousAnswer ? `Previous attempt answer: "${previousAnswer}"` : ''}

Evaluate the answer and respond naturally as Shristi would in a real interview.

Scoring criteria:
- Score 7-10: Answer is good — acknowledge and move on
- Score 4-6: Partially correct — give a gentle hint and ask to elaborate
- Score 0-3: Poor/off-topic — be kind but redirect with a more specific prompt

IMPORTANT RULES:
- If this is attempt 2 or more AND score < 7, set action to "next" regardless (don't keep retrying forever)
- "shristiResponse" must be a natural spoken sentence Shristi says out loud (1-3 sentences max, conversational)
- For "retry": shristiResponse should give a specific hint without giving the answer away
- For "next": shristiResponse should acknowledge the answer and transition naturally
- For "followup": only use if score >= 7 but you want to dig deeper (optional)

Return EXACTLY this JSON without any markdown or extra text:
{
  "score": 7,
  "isPassing": true,
  "action": "next",
  "shristiResponse": "Great answer! You covered the key points well. Let's move on to the next question.",
  "feedback": "Detailed internal feedback for the results page (not spoken aloud)",
  "strengths": ["strength 1", "strength 2"],
  "improvements": ["area to improve 1"]
}
`;

module.exports = {
  jdAnalysisPrompt,
  mcqGenerationPrompt,
  interviewQuestionsPrompt,
  mockInterviewEvalPrompt,
  resumeAnalysisPrompt,
  liveInterviewQuestionsPrompt,
  liveAnswerEvalPrompt,
};
