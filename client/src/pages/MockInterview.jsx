import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { FiVideo, FiMic, FiMicOff, FiCheckCircle, FiPlay, FiStopCircle, FiArrowRight, FiAlertCircle } from 'react-icons/fi';
import { useApiMutation, useApiQuery } from '../hooks/useApi';
import { API } from '../api/endpoints';
import { MOCK_QUESTION_COUNTS } from '../utils/constants';
import SEOHead from '../components/common/SEOHead';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Loader from '../components/ui/Loader';
import { getGradeColor } from '../utils/helpers';
import api from '../api/axios';
import { useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';

// ─── Real Web Speech API Recorder ───────────────────────────────────────────
const useVoiceRecorder = (setText) => {
  const recognitionRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;        // Keep recording until stopped
    recognition.interimResults = true;    // Show partial results while speaking
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let transcript = '';
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setText(transcript);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        toast.error('Microphone access denied. Please allow microphone in your browser settings.');
      }
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
    return () => recognition.abort();
  }, [setText]);

  const toggleRecording = useCallback(() => {
    if (!recognitionRef.current) return;
    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (e) {
        console.error('Recognition start error:', e);
      }
    }
  }, [isRecording]);

  return { isRecording, isSupported, toggleRecording };
};

// ─── Answer Input with voice indicator ──────────────────────────────────────
const AnswerInput = ({ text, setText, isRecording }) => (
  <div className="w-full relative">
    <textarea
      id="answer"
      rows={6}
      placeholder={
        isRecording
          ? '🎙️ Listening... speak your answer clearly'
          : 'Type your answer here, or click "Dictate Answer" to use your voice...'
      }
      value={text}
      onChange={(e) => setText(e.target.value)}
      className={`w-full px-4 py-3 rounded-xl border-2 bg-surface text-text-primary placeholder-text-muted resize-none transition-all duration-200 outline-none text-base leading-relaxed ${
        isRecording
          ? 'border-error focus:border-error ring-2 ring-error/20'
          : 'border-border focus:border-primary focus:ring-2 focus:ring-primary/20'
      }`}
    />
    {isRecording && (
      <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-error/10 text-error px-2 py-1 rounded-lg text-xs font-medium animate-pulse pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-error inline-block" />
        Recording
      </div>
    )}
  </div>
);

// ─── Main Component ──────────────────────────────────────────────────────────
const MockInterview = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { getToken } = useAuth();

  const [jobRole, setJobRole] = useState(location.state?.jobRole || '');
  const [totalQuestions, setTotalQuestions] = useState('5');
  const [activeInterview, setActiveInterview] = useState(null);

  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [finalResults, setFinalResults] = useState(null);

  const { isRecording, isSupported, toggleRecording } = useVoiceRecorder(setCurrentAnswer);

  // ── Fetch past interviews ──────────────────────────────────────────────────
  const { data: pastInterviews, isLoading: isPastLoading } = useApiQuery(
    'mockInterviews',
    API.MOCK.LIST
  );

  // ── Start interview ────────────────────────────────────────────────────────
  const startMutation = useApiMutation(API.MOCK.START, 'post', {
    onSuccess: (data) => {
      setActiveInterview(data.data);
      setCurrentQIndex(0);
      setCurrentAnswer('');
    },
  });

  const handleStart = (e) => {
    e.preventDefault();
    if (!jobRole) return;
    startMutation.mutate({ jobRole, totalQuestions: Number(totalQuestions) });
  };

  // ── Submit answer (calls /:id/answer directly via axios) ───────────────────
  const handleSubmitAnswer = async () => {
    if (!currentAnswer.trim() || currentAnswer.trim().length < 10) return;

    // Stop voice recording if active
    if (isRecording) toggleRecording();

    setIsEvaluating(true);
    try {
      const token = await getToken();
      const { data } = await api.post(
        API.MOCK.ANSWER(activeInterview._id),
        { questionIndex: currentQIndex, userAnswer: currentAnswer },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Attach response to local state
      const updatedInterview = {
        ...activeInterview,
        responses: [
          ...(activeInterview.responses || []),
          {
            questionIndex: currentQIndex,
            userAnswer: currentAnswer,
            aiEvaluation: data.data,
          },
        ],
      };
      setActiveInterview(updatedInterview);

      // Move to next question or complete
      if (currentQIndex < activeInterview.questions.length - 1) {
        setCurrentQIndex((prev) => prev + 1);
        setCurrentAnswer('');
      } else {
        await handleComplete(updatedInterview);
      }
    } catch (err) {
      console.error('Submit answer error:', err);
      toast.error(
        err.response?.data?.error || 'Failed to evaluate your answer. Please try again.'
      );
    } finally {
      setIsEvaluating(false);
    }
  };

  // ── Complete interview ─────────────────────────────────────────────────────
  const handleComplete = async (interviewData) => {
    try {
      const token = await getToken();
      const { data } = await api.post(
        API.MOCK.COMPLETE((interviewData || activeInterview)._id),
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFinalResults(data.data);
    } catch (err) {
      console.error('Complete interview error:', err);
      toast.error('Failed to generate final results. Please try again.');
    }
  };

  // ── Results screen ─────────────────────────────────────────────────────────
  if (finalResults) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <SEOHead title={`Mock Interview Results: ${finalResults.jobRole}`} />

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-text-primary">Mock Interview Results</h1>
          <Button variant="secondary" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="col-span-1 flex flex-col items-center justify-center p-8 text-center border-t-4 border-t-primary">
            <h3 className="text-lg font-medium text-text-secondary mb-4">Overall Performance</h3>
            <div
              className="w-32 h-32 rounded-full border-8 flex items-center justify-center mb-4"
              style={{
                borderColor:
                  finalResults.overallFeedback?.averageScore >= 80
                    ? '#10b981'
                    : finalResults.overallFeedback?.averageScore >= 60
                    ? '#f59e0b'
                    : '#ef4444',
              }}
            >
              <span className="text-4xl font-bold text-text-primary">
                {finalResults.overallFeedback?.averageScore}%
              </span>
            </div>
            <p className="text-text-primary font-medium">
              {finalResults.overallFeedback?.averageScore >= 80
                ? 'Outstanding!'
                : finalResults.overallFeedback?.averageScore >= 60
                ? 'Good effort!'
                : 'Keep practicing!'}
            </p>
          </Card>

          <Card className="col-span-2 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
              <div>
                <h3 className="text-lg font-bold text-success mb-3 flex items-center">
                  <span className="text-2xl mr-2">🌟</span> Key Strengths
                </h3>
                <ul className="space-y-2">
                  {finalResults.overallFeedback?.strengths?.map((s, i) => (
                    <li key={i} className="flex items-start text-sm text-text-secondary">
                      <FiCheckCircle className="text-success mt-1 mr-2 flex-shrink-0" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-bold text-warning mb-3 flex items-center">
                  <span className="text-2xl mr-2">📈</span> Areas for Improvement
                </h3>
                <ul className="space-y-2">
                  {finalResults.overallFeedback?.weaknesses?.map((w, i) => (
                    <li key={i} className="flex items-start text-sm text-text-secondary">
                      <div className="w-1.5 h-1.5 rounded-full bg-warning mt-2 mr-2 flex-shrink-0" />
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-6 bg-primary/5 border-primary/20">
          <h3 className="text-lg font-bold text-text-primary mb-2">AI Recommendations</h3>
          <p className="text-text-secondary">{finalResults.overallFeedback?.recommendations}</p>
        </Card>

        <h3 className="text-2xl font-bold text-text-primary mt-10 mb-4">Detailed Question Review</h3>
        <div className="space-y-6 pb-10">
          {finalResults.questions?.map((q, i) => {
            const response = finalResults.responses?.find((r) => r.questionIndex === i);
            if (!response) return null;
            return (
              <Card key={i} className="p-6">
                <h4 className="text-lg font-medium text-text-primary mb-4">
                  <span className="text-primary font-bold mr-2">Q{i + 1}.</span>
                  {q.question}
                </h4>

                <div className="bg-surface-hover p-4 rounded-lg border border-border mb-4">
                  <span className="text-xs uppercase font-bold text-text-muted mb-2 block">Your Answer:</span>
                  <p className="text-text-secondary italic">"{response.userAnswer}"</p>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  {[
                    { label: 'Technical', key: 'technicalAccuracy' },
                    { label: 'Communication', key: 'communicationClarity' },
                    { label: 'Confidence', key: 'confidenceScore' },
                  ].map(({ label, key }) => (
                    <div key={key} className="bg-surface p-3 rounded text-center border border-border">
                      <span className="text-xs text-text-muted block">{label}</span>
                      <span className={`font-bold ${getGradeColor((response.aiEvaluation?.[key] || 0) * 10)}`}>
                        {response.aiEvaluation?.[key] ?? '–'}/10
                      </span>
                    </div>
                  ))}
                </div>

                <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                  <span className="text-xs uppercase font-bold text-primary mb-2 block">AI Feedback:</span>
                  <p className="text-sm text-text-secondary">{response.aiEvaluation?.feedback}</p>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  // ── Active Interview screen ────────────────────────────────────────────────
  if (activeInterview) {
    const currentQ = activeInterview.questions[currentQIndex];
    const isLastQuestion = currentQIndex === activeInterview.questions.length - 1;

    return (
      <div className="max-w-4xl mx-auto w-full min-h-[calc(100vh-8rem)] flex flex-col">
        <SEOHead title={`Interview: ${activeInterview.jobRole}`} />

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-bold text-text-primary">{activeInterview.jobRole} Interview</h2>
            <span className="text-sm font-medium text-text-secondary">
              Question {currentQIndex + 1} of {activeInterview.questions.length}
            </span>
          </div>
          <div className="w-full bg-surface-hover rounded-full h-2">
            <motion.div
              className="bg-primary h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(currentQIndex / activeInterview.questions.length) * 100}%` }}
            />
          </div>
        </div>

        <Card className="flex-1 flex flex-col mb-6" padding="p-0">
          <div className="flex-1 flex flex-col p-6 md:p-10">
            {/* Question */}
            <div className="mb-8">
              <Badge variant="secondary" className="mb-4">
                {currentQ.category}
              </Badge>
              <h3 className="text-2xl md:text-3xl font-medium text-text-primary leading-tight">
                {currentQ.question}
              </h3>
            </div>

            {/* Answer area */}
            <div className="flex-1 flex flex-col justify-end">
              {isEvaluating ? (
                <div className="flex flex-col items-center justify-center p-10 bg-surface-hover rounded-xl border border-border">
                  <Loader size="md" />
                  <p className="mt-4 text-text-primary font-medium">AI is evaluating your response...</p>
                  <p className="text-sm text-text-muted mt-1">Analysing technical accuracy and communication.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <AnswerInput text={currentAnswer} setText={setCurrentAnswer} isRecording={isRecording} />

                  {/* Voice not supported warning */}
                  {!isSupported && (
                    <div className="flex items-center gap-2 text-xs text-warning">
                      <FiAlertCircle />
                      Voice dictation is not supported in this browser. Please use Chrome or Edge and type your answer.
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-2">
                    <Button
                      variant={isRecording ? 'danger' : 'secondary'}
                      onClick={toggleRecording}
                      icon={isRecording ? FiStopCircle : FiMic}
                      disabled={!isSupported}
                    >
                      {isRecording ? 'Stop Recording' : 'Dictate Answer'}
                    </Button>

                    <Button
                      variant="primary"
                      onClick={handleSubmitAnswer}
                      disabled={currentAnswer.trim().length < 10 || isEvaluating}
                      icon={FiArrowRight}
                    >
                      {isLastQuestion ? 'Finish Interview' : 'Submit & Next'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // ── Setup / Start View ────────────────────────────────────────────────────
  return (
    <div className="flex flex-col lg:flex-row gap-6 min-h-[calc(100vh-8rem)]">
      <SEOHead title="Mock Interview" />

      {/* Left – form */}
      <div className="w-full lg:w-1/3 flex flex-col space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Mock Interview</h1>
          <p className="text-text-secondary mt-1">
            Practice with an AI interviewer. Speak or type your answers and get instant feedback.
          </p>
        </div>

        <Card>
          <form onSubmit={handleStart} className="space-y-5">
            <Input
              id="jobRole"
              label="Target Role"
              placeholder="e.g., Full Stack Engineer"
              value={jobRole}
              onChange={(e) => setJobRole(e.target.value)}
              required
            />

            <Select
              id="totalQuestions"
              label="Number of Questions"
              options={MOCK_QUESTION_COUNTS}
              value={totalQuestions}
              onChange={(e) => setTotalQuestions(e.target.value)}
              required
            />

            <Button
              type="submit"
              fullWidth
              loading={startMutation.isPending}
              disabled={!jobRole}
              icon={FiPlay}
              className="mt-4"
            >
              Start Interview
            </Button>
          </form>
        </Card>

        <Card className="bg-surface-hover/50 border-none">
          <h4 className="font-bold text-text-primary mb-2 flex items-center">
            <FiVideo className="mr-2 text-primary" /> How it works
          </h4>
          <ul className="space-y-2 text-sm text-text-secondary">
            <li>• AI generates contextual questions for your role</li>
            <li>• Type or speak your answers naturally</li>
            <li>• AI evaluates technical accuracy &amp; confidence</li>
            <li>• Get a detailed report with strengths &amp; weaknesses</li>
          </ul>
        </Card>
      </div>

      {/* Right – past interviews */}
      <div className="w-full lg:w-2/3 flex flex-col">
        {startMutation.isPending ? (
          <Card className="flex-1 flex flex-col items-center justify-center min-h-[500px]">
            <Loader size="lg" />
            <h3 className="text-xl font-bold mt-6 text-text-primary">Preparing your interview...</h3>
            <p className="text-text-secondary mt-2 text-center max-w-md">
              The AI is reviewing the role requirements and preparing customised questions. Get ready!
            </p>
          </Card>
        ) : (
          <Card className="flex-1 flex flex-col min-h-[500px]">
            <h3 className="text-xl font-bold text-text-primary mb-6 border-b border-border pb-4">
              Past Interviews
            </h3>

            {isPastLoading ? (
              <div className="flex-1 flex justify-center items-center">
                <Loader />
              </div>
            ) : pastInterviews?.data?.length > 0 ? (
              <div className="space-y-4 flex-1 overflow-y-auto pr-2 scrollbar-thin">
                {pastInterviews.data.map((interview) => (
                  <div
                    key={interview._id}
                    className="p-4 rounded-xl border border-border bg-surface-hover flex justify-between items-center"
                  >
                    <div>
                      <h4 className="font-bold text-text-primary">{interview.jobRole}</h4>
                      <p className="text-sm text-text-muted mt-1">
                        {new Date(interview.createdAt).toLocaleDateString()} •{' '}
                        {interview.questions?.length} Questions
                      </p>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      {interview.status === 'completed' ? (
                        <>
                          <div className="text-right hidden sm:block">
                            <span className="text-xs text-text-muted block">Score</span>
                            <span className={`font-bold ${getGradeColor(interview.overallFeedback?.averageScore || 0)}`}>
                              {interview.overallFeedback?.averageScore || 0}%
                            </span>
                          </div>
                          <Badge variant="success">Completed</Badge>
                        </>
                      ) : (
                        <Badge variant="warning">Incomplete</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex flex-col justify-center items-center text-text-muted">
                <div className="w-16 h-16 rounded-full bg-surface-hover flex items-center justify-center mb-4">
                  <FiMic className="w-8 h-8 opacity-50" />
                </div>
                <p>No past interviews found.</p>
                <p className="text-sm mt-2">Start a new mock interview to practice.</p>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
};

export default MockInterview;
