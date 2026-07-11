export const API = {
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    ME: '/auth/me',
    PROFILE: '/auth/profile',
  },
  JOB_ANALYSIS: {
    ANALYZE: '/job-analysis',
    LIST: '/job-analysis',
    GET: (id) => `/job-analysis/${id}`,
  },
  MCQ: {
    GENERATE: '/mcqs/generate',
    LIST: '/mcqs',
    GET: (id) => `/mcqs/${id}`,
  },
  ASSESSMENT: {
    SUBMIT: '/assessments',
    LIST: '/assessments',
    GET: (id) => `/assessments/${id}`,
  },
  INTERVIEW: {
    GENERATE: '/interview/generate',
    LIST: '/interview',
    GET: (id) => `/interview/${id}`,
  },
  MOCK: {
    START: '/mock-interview/start',
    ANSWER: (id) => `/mock-interview/${id}/answer`,
    COMPLETE: (id) => `/mock-interview/${id}/complete`,
    LIST: '/mock-interview',
    GET: (id) => `/mock-interview/${id}`,
  },
  RESUME: {
    ANALYZE: '/resume/analyze',
  },
  DASHBOARD: {
    STATS: '/dashboard/stats',
  },
  HISTORY: {
    LIST: '/history',
    DELETE: (type, id) => `/history/${type}/${id}`,
  },
  STUDY: {
    GENERATE: '/study/generate'
  },
  TRANSCRIBE: '/transcribe',
  TTS: '/transcribe/tts',
  LIVE_INTERVIEW: {
    START: '/live-interview/start',
    TURN: (id) => `/live-interview/${id}/turn`,
    COMPLETE: (id) => `/live-interview/${id}/complete`,
    LIST: '/live-interview',
    GET: (id) => `/live-interview/${id}`,
  },
};
