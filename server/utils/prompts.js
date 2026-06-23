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
  "matchPercentage": 75,
  "atsScore": 80,
  "missingSkills": ["Skill 1", "Skill 2"],
  "matchedSkills": ["Skill 3", "Skill 4"],
  "recommendedSkills": ["Skill 5"],
  "improvementSuggestions": ["Suggestion 1", "Suggestion 2"]
}
`;

module.exports = {
  jdAnalysisPrompt,
  mcqGenerationPrompt,
  interviewQuestionsPrompt,
  mockInterviewEvalPrompt,
  resumeAnalysisPrompt,
};
