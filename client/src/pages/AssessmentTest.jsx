import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { FiClock, FiCheckCircle, FiXCircle, FiArrowRight, FiArrowLeft, FiFlag } from 'react-icons/fi';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { useApiQuery, useApiMutation } from '../hooks/useApi';
import { API } from '../api/endpoints';
import SEOHead from '../components/common/SEOHead';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Loader from '../components/ui/Loader';
import Modal from '../components/ui/Modal';
import AnimatedCounter from '../components/ui/AnimatedCounter';
import { formatTime, getGradeColor } from '../utils/helpers';

const AssessmentTest = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Test State
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [markedForReview, setMarkedForReview] = useState(new Set());
  const [timeLeft, setTimeLeft] = useState(0);
  const [isTestStarted, setIsTestStarted] = useState(false);
  const [isTestFinished, setIsTestFinished] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [assessmentResult, setAssessmentResult] = useState(null);

  // Fetch MCQ Set
  const { data: mcqSetData, isLoading, error } = useApiQuery(
    ['mcqSet', id],
    API.MCQ.GET(id),
    {
      enabled: !!id,
      showErrorToast: false, // We'll handle error state manually
    }
  );

  const mcqSet = mcqSetData?.data;

  // Submit Mutation
  const submitMutation = useApiMutation(API.ASSESSMENT.SUBMIT, 'post', {
    onSuccess: (data) => {
      setAssessmentResult(data.data);
      setIsTestFinished(true);
    }
  });

  // Timer Effect
  useEffect(() => {
    let timer;
    if (isTestStarted && !isTestFinished && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            autoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isTestStarted, isTestFinished, timeLeft]);

  // Start Test Setup
  const handleStartTest = () => {
    if (!mcqSet) return;
    // Set time: 1.5 minutes per question
    const totalSeconds = mcqSet.questions.length * 90;
    setTimeLeft(totalSeconds);
    setIsTestStarted(true);
  };

  const handleSelectOption = (qIndex, oIndex) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [qIndex]: oIndex
    }));
  };

  const toggleMarkForReview = (qIndex) => {
    setMarkedForReview(prev => {
      const newSet = new Set(prev);
      if (newSet.has(qIndex)) {
        newSet.delete(qIndex);
      } else {
        newSet.add(qIndex);
      }
      return newSet;
    });
  };

  const autoSubmit = () => {
    submitTest();
  };

  const submitTest = () => {
    setShowSubmitModal(false);
    
    // Format answers array for backend
    const answersArray = Object.keys(selectedAnswers).map(qIdx => ({
      questionIndex: parseInt(qIdx),
      selectedAnswer: selectedAnswers[qIdx]
    }));

    // Calculate time taken
    const totalTimeAssigned = mcqSet.questions.length * 90;
    const timeTaken = totalTimeAssigned - timeLeft;

    submitMutation.mutate({
      mcqSetId: id,
      answers: answersArray,
      timeTaken
    });
  };

  // Error State
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-2xl font-bold text-text-primary mb-4">Assessment Not Found</h2>
        <p className="text-text-secondary mb-6">This MCQ set may have been deleted or you don't have access.</p>
        <Button onClick={() => navigate('/mcq-generator')}>Go to MCQ Generator</Button>
      </div>
    );
  }

  // Loading State
  if (isLoading || !mcqSet) return <Loader fullScreen />;

  // Start Screen
  if (!isTestStarted && !isTestFinished) {
    return (
      <div className="max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center">
        <SEOHead title={`Assessment: ${mcqSet.jobRole}`} />
        <Card padding="p-8 md:p-12" className="w-full relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-primary" />
          <h1 className="text-3xl font-bold text-text-primary mb-2">Assessment Test</h1>
          <h2 className="text-xl text-primary font-medium mb-8">{mcqSet.jobRole}</h2>
          
          <div className="grid grid-cols-2 gap-4 mb-10 text-left max-w-sm mx-auto">
            <div className="bg-surface-hover p-4 rounded-xl border border-border">
              <p className="text-text-secondary text-sm">Total Questions</p>
              <p className="text-2xl font-bold text-text-primary">{mcqSet.questions.length}</p>
            </div>
            <div className="bg-surface-hover p-4 rounded-xl border border-border">
              <p className="text-text-secondary text-sm">Time Limit</p>
              <p className="text-2xl font-bold text-text-primary">{Math.round(mcqSet.questions.length * 1.5)} Mins</p>
            </div>
          </div>

          <div className="bg-warning/10 border border-warning/20 p-4 rounded-lg text-left mb-8 inline-block">
            <h4 className="font-bold text-warning flex items-center mb-1">
              <FiClock className="mr-2" /> Important Instructions
            </h4>
            <ul className="text-sm text-text-secondary space-y-1 list-disc pl-5 mt-2">
              <li>The test will automatically submit when time runs out.</li>
              <li>Do not refresh the page or you will lose your progress.</li>
              <li>You can navigate back and forth between questions.</li>
              <li>Use the 'Mark for Review' flag for questions you want to revisit.</li>
            </ul>
          </div>

          <Button size="lg" onClick={handleStartTest} fullWidth className="max-w-sm">
            Start Assessment Now
          </Button>
        </Card>
      </div>
    );
  }

  // Results Screen
  if (isTestFinished && assessmentResult) {
    const pieData = [
      { name: 'Correct', value: assessmentResult.correctAnswers, color: '#10b981' }, // Success
      { name: 'Incorrect', value: assessmentResult.incorrectAnswers, color: '#ef4444' }, // Error
      { name: 'Unanswered', value: assessmentResult.totalQuestions - (assessmentResult.correctAnswers + assessmentResult.incorrectAnswers), color: '#64748b' } // Muted
    ];

    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <SEOHead title={`Results: ${assessmentResult.jobRole}`} />
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* Score Card */}
          <Card variant="gradient" className="flex-1 text-center p-8">
            <h2 className="text-xl font-bold text-text-primary mb-6">Assessment Results</h2>
            <div className="relative w-48 h-48 mx-auto mb-4">
              <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                {/* Background Circle */}
                <path
                  className="text-primary/20"
                  strokeWidth="3"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                {/* Progress Circle */}
                <motion.path
                  className="text-primary drop-shadow-sm"
                  strokeWidth="3"
                  strokeDasharray={`${assessmentResult.score}, 100`}
                  stroke="currentColor"
                  fill="none"
                  strokeLinecap="round"
                  initial={{ strokeDasharray: "0, 100" }}
                  animate={{ strokeDasharray: `${assessmentResult.score}, 100` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-text-primary">
                <span className="text-4xl font-bold">
                  <AnimatedCounter value={assessmentResult.score} />%
                </span>
                <span className="text-sm opacity-80 mt-1">Score</span>
              </div>
            </div>
            
            <p className="text-lg font-medium text-text-secondary mt-4">
              {assessmentResult.score >= 80 ? 'Excellent job! You are well prepared.' : 
               assessmentResult.score >= 60 ? 'Good effort, but room for improvement.' : 
               'Keep practicing to improve your score.'}
            </p>
          </Card>

          {/* Stats Grid */}
          <div className="flex-1 grid grid-cols-2 gap-4">
            <Card className="flex flex-col justify-center text-center">
              <span className="text-text-secondary text-sm">Time Taken</span>
              <span className="text-2xl font-bold text-text-primary mt-1">{formatTime(assessmentResult.timeTaken)}</span>
            </Card>
            <Card className="flex flex-col justify-center text-center">
              <span className="text-text-secondary text-sm">Accuracy</span>
              <span className="text-2xl font-bold text-text-primary mt-1">{assessmentResult.accuracy}%</span>
            </Card>
            <Card className="flex flex-col justify-center text-center border-b-4 border-b-success">
              <span className="text-text-secondary text-sm">Correct</span>
              <span className="text-2xl font-bold text-success mt-1">{assessmentResult.correctAnswers}</span>
            </Card>
            <Card className="flex flex-col justify-center text-center border-b-4 border-b-error">
              <span className="text-text-secondary text-sm">Incorrect</span>
              <span className="text-2xl font-bold text-error mt-1">{assessmentResult.incorrectAnswers}</span>
            </Card>
          </div>
        </div>

        {/* Detailed Review */}
        <Card>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-text-primary">Detailed Review</h3>
            <Button variant="secondary" onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
          </div>
          
          <div className="space-y-6">
            {mcqSet.questions.map((q, qIndex) => {
              // Find user answer in result
              const answerData = assessmentResult.answers.find(a => a.questionIndex === qIndex);
              const userAnswerIndex = answerData?.selectedAnswer;
              const isCorrect = answerData?.isCorrect;
              const isUnanswered = userAnswerIndex === undefined;

              return (
                <div key={qIndex} className="p-5 border border-border rounded-xl bg-surface-hover">
                  <div className="flex items-start mb-4">
                    <div className="mt-1 mr-3 flex-shrink-0">
                      {isCorrect ? (
                        <FiCheckCircle className="text-success w-6 h-6" />
                      ) : isUnanswered ? (
                        <div className="w-6 h-6 rounded-full border-2 border-text-muted flex items-center justify-center text-text-muted text-xs">-</div>
                      ) : (
                        <FiXCircle className="text-error w-6 h-6" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-lg font-medium text-text-primary">
                        <span className="text-text-muted mr-2">{qIndex + 1}.</span>
                        {q.question}
                      </h4>
                      <Badge variant="default" className="mt-2">{q.topic || 'General'}</Badge>
                    </div>
                  </div>

                  <div className="ml-9 space-y-2 mb-4">
                    {q.options.map((opt, oIndex) => {
                      const isOptionCorrect = oIndex === q.correctAnswer;
                      const isOptionSelected = oIndex === userAnswerIndex;
                      
                      let optClass = "p-3 rounded-lg border border-gray-200 bg-white text-text-secondary text-sm flex justify-between";
                      
                      if (isOptionCorrect) {
                        optClass = "p-3 rounded-lg border border-success bg-success/10 text-success font-medium flex justify-between";
                      } else if (isOptionSelected && !isOptionCorrect) {
                        optClass = "p-3 rounded-lg border border-error bg-error/10 text-error font-medium flex justify-between";
                      }

                      return (
                        <div key={oIndex} className={optClass}>
                          <span>{String.fromCharCode(65 + oIndex)}. {opt}</span>
                          <div className="flex gap-2">
                            {isOptionSelected && <span className="text-xs uppercase bg-black/20 px-2 py-0.5 rounded">Your Answer</span>}
                            {isOptionCorrect && <span className="text-xs uppercase bg-black/20 px-2 py-0.5 rounded">Correct</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="ml-9 p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <p className="text-sm font-bold text-text-primary mb-1">Explanation:</p>
                    <p className="text-sm text-text-secondary">{q.explanation}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    );
  }

  // Active Test Screen
  const currentQuestion = mcqSet.questions[currentQuestionIdx];

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-8rem)]">
      <SEOHead title={`Testing: ${mcqSet.jobRole}`} />
      
      {/* Submit Confirmation Modal */}
      <Modal isOpen={showSubmitModal} onClose={() => setShowSubmitModal(false)} title="Submit Assessment">
        <div className="py-4 text-center">
          <p className="text-text-primary mb-6 text-lg">Are you sure you want to submit your assessment?</p>
          
          <div className="flex justify-center gap-6 mb-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-success">{Object.keys(selectedAnswers).length}</div>
              <div className="text-xs text-text-muted">Answered</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-warning">{markedForReview.size}</div>
              <div className="text-xs text-text-muted">Marked</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-text-secondary">
                {mcqSet.questions.length - Object.keys(selectedAnswers).length}
              </div>
              <div className="text-xs text-text-muted">Unanswered</div>
            </div>
          </div>

          <div className="flex gap-4">
            <Button variant="secondary" fullWidth onClick={() => setShowSubmitModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" fullWidth onClick={submitTest} loading={submitMutation.isPending}>
              Yes, Submit
            </Button>
          </div>
        </div>
      </Modal>

      {/* Main Question Area */}
      <div className="w-full lg:w-3/4 flex flex-col">
        {/* Top Bar */}
        <div className="glass rounded-t-xl border-b border-border p-4 flex justify-between items-center z-10 sticky top-0">
          <div className="flex items-center">
            <Badge variant="primary" className="text-sm px-3 py-1 mr-4">
              Question {currentQuestionIdx + 1} of {mcqSet.questions.length}
            </Badge>
            {markedForReview.has(currentQuestionIdx) && (
              <Badge variant="warning" className="flex items-center gap-1">
                <FiFlag /> Marked for Review
              </Badge>
            )}
          </div>
          <div className="flex items-center text-text-primary font-bold bg-surface px-4 py-2 rounded-lg border border-border shadow-inner">
            <FiClock className={`mr-2 ${timeLeft < 60 ? 'text-error animate-pulse' : 'text-primary'}`} />
            <span className={timeLeft < 60 ? 'text-error' : ''}>{formatTime(timeLeft)}</span>
          </div>
        </div>

        {/* Question Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-surface border-x border-border">
          <h2 className="text-xl md:text-2xl font-medium text-text-primary mb-8 leading-relaxed">
            {currentQuestion.question}
          </h2>

          <div className="space-y-4">
            {currentQuestion.options.map((opt, oIndex) => {
              const isSelected = selectedAnswers[currentQuestionIdx] === oIndex;
              return (
                <button
                  key={oIndex}
                  onClick={() => handleSelectOption(currentQuestionIdx, oIndex)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-center ${
                    isSelected 
                      ? 'border-primary bg-primary/10 text-text-primary' 
                      : 'border-border bg-surface hover:border-primary/50 text-text-secondary hover:bg-surface-hover'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 flex-shrink-0 ${
                    isSelected ? 'border-primary' : 'border-text-muted'
                  }`}>
                    {isSelected && <div className="w-3 h-3 rounded-full bg-primary" />}
                  </div>
                  <span className="text-lg">{opt}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="glass rounded-b-xl border-t border-border p-4 flex justify-between items-center z-10 sticky bottom-0">
          <Button 
            variant="secondary" 
            onClick={() => toggleMarkForReview(currentQuestionIdx)}
            icon={FiFlag}
            className={markedForReview.has(currentQuestionIdx) ? '!text-warning !border-warning/50' : ''}
          >
            {markedForReview.has(currentQuestionIdx) ? 'Unmark' : 'Mark for Review'}
          </Button>

          <div className="flex gap-3">
            <Button 
              variant="secondary" 
              onClick={() => setCurrentQuestionIdx(prev => prev - 1)}
              disabled={currentQuestionIdx === 0}
              icon={FiArrowLeft}
            >
              <span className="hidden sm:inline">Previous</span>
            </Button>
            
            {currentQuestionIdx < mcqSet.questions.length - 1 ? (
              <Button 
                variant="primary" 
                onClick={() => setCurrentQuestionIdx(prev => prev + 1)}
              >
                <span className="hidden sm:inline mr-2">Next</span>
                <FiArrowRight />
              </Button>
            ) : (
              <Button 
                variant="primary" 
                onClick={() => setShowSubmitModal(true)}
                className="bg-gradient-to-r from-success to-emerald-400"
              >
                Submit Test
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Right Sidebar - Question Palette */}
      <Card className="w-full lg:w-1/4 h-full flex flex-col p-0 overflow-hidden hidden md:flex">
        <div className="p-4 border-b border-border bg-surface-hover">
          <h3 className="font-bold text-text-primary mb-4">Question Palette</h3>
          
          {/* Legend */}
          <div className="grid grid-cols-2 gap-2 text-xs text-text-secondary">
            <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-success mr-2" /> Answered</div>
            <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-warning mr-2" /> Marked</div>
            <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-surface border border-border mr-2" /> Not Answered</div>
            <div className="flex items-center"><div className="w-3 h-3 rounded-full border-2 border-primary mr-2" /> Current</div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
          <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-4 gap-2">
            {mcqSet.questions.map((_, idx) => {
              const isAnswered = selectedAnswers[idx] !== undefined;
              const isMarked = markedForReview.has(idx);
              const isCurrent = currentQuestionIdx === idx;
              
              let btnClass = "w-10 h-10 rounded-lg flex items-center justify-center font-medium text-sm transition-all ";
              
              if (isCurrent) {
                btnClass += "border-2 border-primary ";
              } else {
                btnClass += "border border-border ";
              }

              if (isMarked) {
                btnClass += "bg-warning/20 text-warning ";
              } else if (isAnswered) {
                btnClass += "bg-success/20 text-success ";
              } else {
                btnClass += "bg-surface text-text-secondary hover:bg-surface-hover ";
              }

              return (
                <button
                  key={idx}
                  onClick={() => setCurrentQuestionIdx(idx)}
                  className={btnClass}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-4 border-t border-border bg-surface-hover mt-auto">
          <Button fullWidth onClick={() => setShowSubmitModal(true)} variant="danger" className="!bg-error/20 !text-error hover:!bg-error/30 !border-error/30">
            End Assessment
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default AssessmentTest;
