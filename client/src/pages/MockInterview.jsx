import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { FiVideo, FiMic, FiCheckCircle, FiPlay, FiStopCircle, FiArrowRight } from 'react-icons/fi';
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
import Modal from '../components/ui/Modal';
import { getGradeColor } from '../utils/helpers';

// Helper component for speech recognition (simulated for now, would use Web Speech API in production)
const AudioRecorder = ({ isRecording, onStop, text, setText }) => {
  useEffect(() => {
    let interval;
    if (isRecording) {
      // Simulate real-time transcription filling for demo purposes
      // In a real app, use `window.SpeechRecognition`
      interval = setInterval(() => {
        // Just a visual cue that it's "recording" - we expect user to type or use actual dictation
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  return (
    <div className="w-full relative">
      <Input
        id="answer"
        textarea
        rows={6}
        placeholder={isRecording ? "Listening..." : "Type your answer here or click the mic to use voice dictation..."}
        value={text}
        onChange={(e) => setText(e.target.value)}
        className={isRecording ? 'border-error/50 focus:border-error focus:ring-error/20' : ''}
      />
      
      {isRecording && (
        <div className="absolute top-2 right-2 flex items-center space-x-2 bg-error/10 text-error px-2 py-1 rounded text-xs animate-pulse">
          <div className="w-2 h-2 rounded-full bg-error" />
          <span>Recording</span>
        </div>
      )}
    </div>
  );
};

const MockInterview = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [jobRole, setJobRole] = useState(location.state?.jobRole || '');
  const [totalQuestions, setTotalQuestions] = useState('5');
  const [activeInterview, setActiveInterview] = useState(null);
  
  // Interview state
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [finalResults, setFinalResults] = useState(null);

  // Fetch past interviews
  const { data: pastInterviews, isLoading: isPastLoading } = useApiQuery(
    'mockInterviews', 
    API.MOCK.LIST
  );

  // Start Interview mutation
  const startMutation = useApiMutation(API.MOCK.START, 'post', {
    onSuccess: (data) => {
      setActiveInterview(data.data);
      setCurrentQIndex(0);
      setCurrentAnswer('');
    }
  });

  // Submit Answer mutation
  const answerMutation = useApiMutation('', 'post', {
    onSuccess: (data) => {
      // Update local interview state with the new response
      const updatedInterview = { ...activeInterview };
      
      // Check if responses array exists, if not initialize it
      if (!updatedInterview.responses) {
        updatedInterview.responses = [];
      }
      
      updatedInterview.responses.push({
        questionIndex: currentQIndex,
        userAnswer: currentAnswer,
        aiEvaluation: data.data
      });
      
      setActiveInterview(updatedInterview);
      setIsEvaluating(false);
      
      // Move to next question or finish
      if (currentQIndex < activeInterview.questions.length - 1) {
        setCurrentQIndex(prev => prev + 1);
        setCurrentAnswer('');
      } else {
        completeInterview();
      }
    },
    onError: () => {
      setIsEvaluating(false);
    }
  });

  // Complete Interview mutation
  const completeMutation = useApiMutation('', 'post', {
    onSuccess: (data) => {
      setFinalResults(data.data);
      setShowResultModal(true);
    }
  });

  const handleStart = (e) => {
    e.preventDefault();
    if (!jobRole) return;
    
    startMutation.mutate({
      jobRole,
      totalQuestions: Number(totalQuestions)
    });
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // In a real app, start/stop Web Speech API here
  };

  const handleSubmitAnswer = () => {
    if (!currentAnswer.trim()) return;
    if (isRecording) setIsRecording(false);
    
    setIsEvaluating(true);
    answerMutation.mutate(null, {
      url: API.MOCK.ANSWER(activeInterview._id),
      payload: {
        questionIndex: currentQIndex,
        userAnswer: currentAnswer
      }
    });
  };

  const completeInterview = () => {
    completeMutation.mutate(null, {
      url: API.MOCK.COMPLETE(activeInterview._id)
    });
  };

  const finishAndGoToDashboard = () => {
    navigate('/dashboard');
  };

  // Render Result view if interview is complete and we have results
  if (finalResults) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <SEOHead title={`Mock Interview Results: ${finalResults.jobRole}`} />
        
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-text-primary">Mock Interview Results</h1>
          <Button variant="secondary" onClick={finishAndGoToDashboard}>Back to Dashboard</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Overall Score */}
          <Card className="col-span-1 flex flex-col items-center justify-center p-8 text-center border-t-4 border-t-primary">
            <h3 className="text-lg font-medium text-text-secondary mb-4">Overall Performance</h3>
            <div className="w-32 h-32 rounded-full border-8 flex items-center justify-center mb-4"
              style={{ borderColor: finalResults.overallFeedback?.averageScore >= 80 ? '#10b981' : finalResults.overallFeedback?.averageScore >= 60 ? '#f59e0b' : '#ef4444' }}
            >
              <span className="text-4xl font-bold text-text-primary">{finalResults.overallFeedback?.averageScore}%</span>
            </div>
            <p className="text-text-primary font-medium">
              {finalResults.overallFeedback?.averageScore >= 80 ? 'Outstanding!' : 
               finalResults.overallFeedback?.averageScore >= 60 ? 'Good effort!' : 'Keep practicing!'}
            </p>
          </Card>

          {/* Strengths & Weaknesses */}
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

        {/* Recommendations */}
        <Card className="p-6 bg-primary/5 border-primary/20">
          <h3 className="text-lg font-bold text-text-primary mb-2">AI Recommendations</h3>
          <p className="text-text-secondary">{finalResults.overallFeedback?.recommendations}</p>
        </Card>

        {/* Detailed Q&A Review */}
        <h3 className="text-2xl font-bold text-text-primary mt-10 mb-4">Detailed Question Review</h3>
        <div className="space-y-6 pb-10">
          {finalResults.questions.map((q, i) => {
            const response = finalResults.responses.find(r => r.questionIndex === i);
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
                  <div className="bg-surface p-3 rounded text-center border border-border">
                    <span className="text-xs text-text-muted block">Technical</span>
                    <span className={`font-bold ${getGradeColor(response.aiEvaluation?.technicalAccuracy)}`}>
                      {response.aiEvaluation?.technicalAccuracy}/100
                    </span>
                  </div>
                  <div className="bg-surface p-3 rounded text-center border border-border">
                    <span className="text-xs text-text-muted block">Communication</span>
                    <span className={`font-bold ${getGradeColor(response.aiEvaluation?.communicationClarity)}`}>
                      {response.aiEvaluation?.communicationClarity}/100
                    </span>
                  </div>
                  <div className="bg-surface p-3 rounded text-center border border-border">
                    <span className="text-xs text-text-muted block">Confidence</span>
                    <span className={`font-bold ${getGradeColor(response.aiEvaluation?.confidenceScore)}`}>
                      {response.aiEvaluation?.confidenceScore}/100
                    </span>
                  </div>
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

  // Active Interview View
  if (activeInterview) {
    const currentQ = activeInterview.questions[currentQIndex];

    return (
      <div className="max-w-4xl mx-auto w-full min-h-[calc(100vh-8rem)] flex flex-col">
        <SEOHead title={`Interview: ${activeInterview.jobRole}`} />
        
        {/* Header Progress */}
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
              animate={{ width: `${((currentQIndex) / activeInterview.questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <Card className="flex-1 flex flex-col mb-6" padding="p-0">
          <div className="flex-1 flex flex-col p-6 md:p-10 h-full">
            <div className="mb-8">
              <Badge variant="secondary" className="mb-4">
              {currentQ.category}
            </Badge>
            <h3 className="text-2xl md:text-3xl font-medium text-text-primary leading-tight">
              {currentQ.question}
            </h3>
          </div>

          <div className="flex-1 flex flex-col justify-end">
            {isEvaluating ? (
              <div className="flex flex-col items-center justify-center p-8 bg-surface-hover rounded-xl border border-border">
                <Loader size="md" />
                <p className="mt-4 text-text-primary font-medium">AI is evaluating your response...</p>
                <p className="text-sm text-text-muted mt-1">Analyzing technical accuracy and communication.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <AudioRecorder 
                  isRecording={isRecording} 
                  onStop={() => setIsRecording(false)} 
                  text={currentAnswer}
                  setText={setCurrentAnswer}
                />
                
                <div className="flex justify-between items-center pt-2">
                  <Button 
                    variant={isRecording ? "danger" : "secondary"}
                    onClick={toggleRecording}
                    icon={isRecording ? FiStopCircle : FiMic}
                  >
                    {isRecording ? "Stop Recording" : "Dictate Answer"}
                  </Button>

                  <Button 
                    variant="primary" 
                    onClick={handleSubmitAnswer}
                    disabled={currentAnswer.trim().length < 10 || isEvaluating}
                    icon={FiArrowRight}
                  >
                    {currentQIndex === activeInterview.questions.length - 1 ? "Finish Interview" : "Submit & Next"}
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

  // Setup / Start View
  return (
    <div className="flex flex-col lg:flex-row gap-6 min-h-[calc(100vh-8rem)]">
      <SEOHead title="Mock Interview" />
      
      {/* Left side - Form */}
      <div className="w-full lg:w-1/3 flex flex-col space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Mock Interview</h1>
          <p className="text-text-secondary mt-1">Practice with an AI interviewer. Speak or type your answers and get instant feedback.</p>
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

        {/* Info card */}
        <Card className="bg-surface-hover/50 border-none">
          <h4 className="font-bold text-text-primary mb-2 flex items-center">
            <FiVideo className="mr-2 text-primary" /> How it works
          </h4>
          <ul className="space-y-2 text-sm text-text-secondary">
            <li>• AI generates contextual questions for your role</li>
            <li>• Type or speak your answers naturally</li>
            <li>• AI evaluates technical accuracy & confidence</li>
            <li>• Get a detailed report with strengths & weaknesses</li>
          </ul>
        </Card>
      </div>

      {/* Right side - Loading or Empty State */}
      <div className="w-full lg:w-2/3 flex flex-col">
        {startMutation.isPending ? (
          <Card className="flex-1 flex flex-col items-center justify-center min-h-[500px]">
            <Loader size="lg" />
            <h3 className="text-xl font-bold mt-6 text-text-primary">Preparing your interview...</h3>
            <p className="text-text-secondary mt-2 text-center max-w-md">
              The AI is reviewing the role requirements and preparing customized questions. Get ready!
            </p>
          </Card>
        ) : (
          <Card className="flex-1 flex flex-col min-h-[500px]">
            <h3 className="text-xl font-bold text-text-primary mb-6 border-b border-border pb-4">Past Interviews</h3>
            
            {isPastLoading ? (
              <div className="flex-1 flex justify-center items-center"><Loader /></div>
            ) : pastInterviews?.data?.length > 0 ? (
              <div className="space-y-4 flex-1 overflow-y-auto pr-2 scrollbar-thin">
                {pastInterviews.data.map(interview => (
                  <div key={interview._id} className="p-4 rounded-xl border border-border bg-surface-hover flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-text-primary">{interview.jobRole}</h4>
                      <p className="text-sm text-text-muted mt-1">
                        {new Date(interview.createdAt).toLocaleDateString()} • {interview.questions?.length} Questions
                      </p>
                    </div>
                    <div className="text-right flex items-center">
                      {interview.status === 'completed' ? (
                        <div className="flex items-center gap-3">
                          <div className="text-right hidden sm:block">
                            <span className="text-xs text-text-muted block">Score</span>
                            <span className={`font-bold ${getGradeColor(interview.overallFeedback?.averageScore || 0)}`}>
                              {interview.overallFeedback?.averageScore || 0}%
                            </span>
                          </div>
                          {/* In a real app we'd have a route to view past mock interviews */}
                          <Badge variant="success">Completed</Badge>
                        </div>
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
