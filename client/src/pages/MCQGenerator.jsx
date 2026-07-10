import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { FiList, FiClock, FiPlay, FiCheckCircle, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { useApiMutation, useApiQuery } from '../hooks/useApi';
import { API } from '../api/endpoints';
import { DIFFICULTY_LEVELS, MCQ_COUNTS } from '../utils/constants';
import SEOHead from '../components/common/SEOHead';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Loader from '../components/ui/Loader';
import { getDifficultyColor } from '../utils/helpers';

const MCQGenerator = () => {
  const location = useLocation();
  const [jobRole, setJobRole] = useState(location.state?.jobRole || '');
  const [skills, setSkills] = useState(location.state?.skills || '');
  const [count, setCount] = useState('20');
  const [difficulty, setDifficulty] = useState('medium');
  const [activeMCQSet, setActiveMCQSet] = useState(null);
  const [revealedAnswers, setRevealedAnswers] = useState({});

  const navigate = useNavigate();

  // Fetch past MCQ sets
  const { data: pastSets, isLoading: isPastLoading } = useApiQuery(
    'mcqSets', 
    API.MCQ.LIST
  );

  // Generate mutation
  const generateMutation = useApiMutation(API.MCQ.GENERATE, 'post', {
    successMessage: 'MCQs generated successfully!',
    invalidateQueries: ['mcqSets'],
    onSuccess: (data) => {
      setActiveMCQSet(data.data);
      setRevealedAnswers({}); // Reset revealed
    }
  });

  const handleGenerate = (e) => {
    e.preventDefault();
    if (!jobRole || !skills) return;
    
    generateMutation.mutate({
      jobRole,
      skills: skills.split(',').map(s => s.trim()).filter(Boolean),
      count: Number(count),
      difficulty
    });
  };

  const toggleAnswer = (index) => {
    setRevealedAnswers(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const startAssessment = () => {
    if (activeMCQSet?._id) {
      navigate(`/assessment/${activeMCQSet._id}`);
    }
  };

  const viewSavedSet = async (id) => {
    try {
      // Use the query API hook's fetcher logic via axios to ensure credentials are sent
      const { data } = await import('../api/axios').then(m => m.default.get(API.MCQ.GET(id)));
      setActiveMCQSet(data.data);
      setRevealedAnswers({});
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 min-h-[calc(100vh-8rem)]">
      <SEOHead title="MCQ Generator" />
      
      {/* Left side - Form */}
      <div className="w-full lg:w-1/3 flex flex-col space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">MCQ Generator</h1>
          <p className="text-text-secondary mt-1">Generate custom multiple-choice questions to test your knowledge.</p>
        </div>

        <Card>
          <form onSubmit={handleGenerate} className="space-y-5">
            <Input
              id="jobRole"
              label="Target Role"
              placeholder="e.g., Frontend Developer"
              value={jobRole}
              onChange={(e) => setJobRole(e.target.value)}
              required
            />

            <Input
              id="skills"
              label="Specific Skills / Topics (comma separated)"
              placeholder="React, Redux, JavaScript, CSS"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <Select
                id="count"
                label="Number of Questions"
                options={MCQ_COUNTS}
                value={count}
                onChange={(e) => setCount(e.target.value)}
                required
              />

              <Select
                id="difficulty"
                label="Difficulty"
                options={DIFFICULTY_LEVELS}
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                required
              />
            </div>

            <Button 
              type="submit" 
              fullWidth 
              loading={generateMutation.isPending}
              disabled={!jobRole || !skills}
              className="mt-4"
            >
              Generate Questions
            </Button>
          </form>
        </Card>

        {/* History List */}
        {!activeMCQSet && !generateMutation.isPending && (
          <Card className="flex-1 flex flex-col min-h-[300px]">
            <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center">
              <FiClock className="mr-2" /> Recent Generated Sets
            </h3>
            
            {isPastLoading ? (
              <div className="flex-1 flex justify-center items-center"><Loader size="sm" /></div>
            ) : pastSets?.data?.length > 0 ? (
              <div className="space-y-3 flex-1 overflow-y-auto pr-2 scrollbar-thin max-h-[400px]">
                {pastSets.data.map(set => (
                  <div 
                    key={set._id} 
                    className="p-3 rounded-lg border border-border bg-surface-hover hover:border-primary/50 cursor-pointer transition-colors"
                    onClick={() => viewSavedSet(set._id)}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-medium text-text-primary">{set.jobRole}</h4>
                      <span className="text-xs text-text-muted">{new Date(set.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="default">{set.count} Qs</Badge>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getDifficultyColor(set.difficulty)}`}>
                        {set.difficulty}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex justify-center items-center text-text-muted text-sm">
                No generated sets yet.
              </div>
            )}
          </Card>
        )}
      </div>

      {/* Right side - Results */}
      <div className="w-full lg:w-2/3 flex flex-col">
        {generateMutation.isPending ? (
          <Card className="flex-1 flex flex-col items-center justify-center min-h-[500px]">
            <Loader size="lg" />
            <h3 className="text-xl font-bold mt-6 text-text-primary">Generating MCQs...</h3>
            <p className="text-text-secondary mt-2 text-center max-w-md">
              Our AI is crafting {count} {difficulty} questions tailored for a {jobRole}.
            </p>
          </Card>
        ) : activeMCQSet ? (
          <div className="flex flex-col h-full space-y-6 animate-fade-in">
            {/* Header Action Bar */}
            <Card variant="solid" className="flex items-center justify-between p-4 sticky top-16 z-20 shadow-md">
              <div>
                <h2 className="text-xl font-bold text-text-primary">{activeMCQSet.jobRole} MCQs</h2>
                <div className="flex gap-2 mt-1">
                  <Badge variant="primary">{activeMCQSet.questions.length} Questions</Badge>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${getDifficultyColor(activeMCQSet.difficulty)}`}>
                    {activeMCQSet.difficulty}
                  </span>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="ghost" onClick={() => setActiveMCQSet(null)}>
                  Close
                </Button>
                <Button variant="primary" icon={FiPlay} onClick={startAssessment}>
                  Take Assessment
                </Button>
              </div>
            </Card>

            {/* Questions List for Review */}
            <div className="space-y-6 pb-10">
              {activeMCQSet.questions.map((q, qIndex) => (
                <Card key={qIndex} className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-medium text-text-primary flex">
                      <span className="text-primary font-bold mr-2">{qIndex + 1}.</span> 
                      {q.question}
                    </h3>
                    <Badge variant="default" className="ml-4 flex-shrink-0">{q.topic || 'General'}</Badge>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    {q.options.map((opt, oIndex) => {
                      const isRevealed = revealedAnswers[qIndex];
                      const isCorrect = oIndex === q.correctAnswer;
                      
                      let optClass = "p-3 rounded-lg border border-border bg-surface-hover text-text-secondary text-sm";
                      
                      if (isRevealed && isCorrect) {
                        optClass = "p-3 rounded-lg border border-success bg-success/10 text-success font-medium flex justify-between items-center text-sm";
                        optClass = "p-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-400 opacity-70 text-sm";
                      }
                      
                      return (
                        <div key={oIndex} className={optClass}>
                          <span>{String.fromCharCode(65 + oIndex)}. {opt}</span>
                          {isRevealed && isCorrect && <FiCheckCircle size={18} />}
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-border">
                    <button 
                      className="text-primary text-sm font-medium hover:text-primary-light flex items-center"
                      onClick={() => toggleAnswer(qIndex)}
                    >
                      {revealedAnswers[qIndex] ? <><FiChevronUp className="mr-1" /> Hide Answer</> : <><FiChevronDown className="mr-1" /> View Answer & Explanation</>}
                    </button>
                    
                    <AnimatePresence>
                      {revealedAnswers[qIndex] && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0, mt: 0 }}
                          animate={{ height: 'auto', opacity: 1, mt: 12 }}
                          exit={{ height: 0, opacity: 0, mt: 0 }}
                          className="overflow-hidden bg-primary/5 rounded-lg p-4 border border-primary/20"
                        >
                          <p className="text-sm text-text-primary">
                            <span className="font-bold text-success">Correct Answer: {String.fromCharCode(65 + q.correctAnswer)}</span>
                          </p>
                          <p className="text-sm text-text-secondary mt-2 leading-relaxed">
                            {q.explanation}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col justify-center items-center text-text-muted h-full min-h-[500px]">
            <div className="w-20 h-20 rounded-full bg-surface-hover flex items-center justify-center mb-6">
              <FiList className="w-10 h-10 opacity-30" />
            </div>
            <h3 className="text-xl font-medium mb-2">Ready to test your skills?</h3>
            <p className="text-center max-w-md">
              Fill out the form to generate a custom set of multiple-choice questions. You can review them here or take them as a timed assessment.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MCQGenerator;
