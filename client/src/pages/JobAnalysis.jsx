import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { FiBriefcase, FiFileText, FiChevronDown, FiChevronUp, FiCheckCircle, FiBookOpen, FiList, FiVideo, FiX } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';
import { useApiMutation, useApiQuery } from '../hooks/useApi';
import { API } from '../api/endpoints';
import { EXPERIENCE_LEVELS } from '../utils/constants';
import SEOHead from '../components/common/SEOHead';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Loader from '../components/ui/Loader';
import Modal from '../components/ui/Modal';

const StudyMaterialModal = ({ isOpen, onClose, topic, jobRole }) => {
  const [content, setContent] = useState('');
  
  const generateMutation = useApiMutation(API.STUDY.GENERATE, 'post', {
    onSuccess: (data) => {
      setContent(data.data);
    }
  });

  useEffect(() => {
    if (isOpen && topic && !content) {
      generateMutation.mutate({ topic, jobRole });
    }
  }, [isOpen, topic]);

  return (
    <Modal isOpen={isOpen} onClose={() => { onClose(); setContent(''); }} title={`Study Guide: ${topic}`} size="lg">
      <div className="p-6 max-h-[70vh] overflow-y-auto">
        {generateMutation.isPending ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader size="lg" />
            <p className="mt-4 text-text-secondary">Generating AI study material...</p>
          </div>
        ) : content ? (
          <div className="prose prose-indigo max-w-none text-text-primary">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        ) : (
          <p className="text-error">Failed to generate content.</p>
        )}
      </div>
    </Modal>
  );
};

const JobAnalysis = () => {
  const [jobRole, setJobRole] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('1-3 Years');
  const [activeAnalysis, setActiveAnalysis] = useState(null);
  const [expandedWeek, setExpandedWeek] = useState(null);
  
  const [studyModalOpen, setStudyModalOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState('');
  const navigate = useNavigate();

  // Fetch past analyses
  const { data: pastAnalyses, isLoading: isPastLoading } = useApiQuery(
    'jobAnalyses', 
    API.JOB_ANALYSIS.LIST
  );

  // Analyze mutation
  const analyzeMutation = useApiMutation(API.JOB_ANALYSIS.ANALYZE, 'post', {
    successMessage: 'Analysis complete!',
    invalidateQueries: ['jobAnalyses'],
    onSuccess: (data) => {
      setActiveAnalysis(data.data);
    }
  });

  const handleAnalyze = (e) => {
    e.preventDefault();
    if (!jobRole || !jobDescription) return;
    
    analyzeMutation.mutate({
      jobRole,
      jobDescription,
      experienceLevel
    });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 min-h-[calc(100vh-8rem)]">
      <SEOHead title="Job Analysis" />
      
      {/* Left side - Form */}
      <div className="w-full lg:w-1/3 flex flex-col space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Job Analysis</h1>
          <p className="text-text-secondary mt-1">Paste a job description to extract key skills and build a prep roadmap.</p>
        </div>

        <Card className="flex-1">
          <form onSubmit={handleAnalyze} className="space-y-5 h-full flex flex-col">
            <Input
              id="jobRole"
              label="Job Role / Title"
              placeholder="e.g., Senior React Developer"
              value={jobRole}
              onChange={(e) => setJobRole(e.target.value)}
              icon={FiBriefcase}
              required
            />

            <Select
              id="experience"
              label="Your Experience Level"
              options={EXPERIENCE_LEVELS}
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value)}
              required
            />

            <div className="flex-1 flex flex-col">
              <Input
                id="jd"
                label="Job Description"
                placeholder="Paste the full job description here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                icon={FiFileText}
                textarea
                rows={12}
                className="flex-1"
                required
              />
            </div>

            <Button 
              type="submit" 
              fullWidth 
              loading={analyzeMutation.isPending}
              disabled={!jobRole || !jobDescription}
              className="mt-auto"
            >
              Analyze Job Description
            </Button>
          </form>
        </Card>
      </div>

      {/* Right side - Results or History */}
      <div className="w-full lg:w-2/3 flex flex-col">
        {analyzeMutation.isPending ? (
          <Card className="flex-1 flex flex-col items-center justify-center min-h-[500px]">
            <Loader size="lg" />
            <h3 className="text-xl font-bold mt-6 text-text-primary">Analyzing Job Description...</h3>
            <p className="text-text-secondary mt-2 text-center max-w-md">
              Our AI is extracting skills, prioritizing topics, and building your custom learning roadmap. This usually takes 10-15 seconds.
            </p>
          </Card>
        ) : activeAnalysis ? (
          <div className="space-y-6 animate-fade-in">
            {/* Header info */}
            <Card variant="gradient" padding="p-8">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-text-primary mb-2">{activeAnalysis.jobRole}</h2>
                  <Badge variant="primary" className="mr-2">{activeAnalysis.experienceLevel}</Badge>
                  <span className="text-sm text-text-muted">Analyzed recently</span>
                </div>
                <Button variant="secondary" size="sm" onClick={() => setActiveAnalysis(null)}>
                  New Analysis
                </Button>
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Technical Skills */}
              <Card>
                <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center">
                  <span className="w-8 h-8 rounded bg-primary/20 text-primary flex items-center justify-center mr-3">💻</span>
                  Technical Skills
                </h3>
                <div className="space-y-4">
                  {['Expert', 'Intermediate', 'Beginner'].map(level => {
                    const skills = activeAnalysis.technicalSkills?.filter(s => s.proficiency?.includes(level) || s.proficiency === level) || [];
                    if (skills.length === 0) return null;
                    
                    return (
                      <div key={level}>
                        <h4 className="text-sm font-medium text-text-secondary mb-2">{level}</h4>
                        <div className="flex flex-wrap gap-2">
                          {skills.map((skill, idx) => (
                            <Badge key={idx} variant="primary">{skill.name}</Badge>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* Fallback if no proficiency levels were cleanly parsed */}
                  {activeAnalysis.technicalSkills?.length > 0 && 
                   !activeAnalysis.technicalSkills.some(s => ['Expert', 'Intermediate', 'Beginner'].some(l => s.proficiency?.includes(l))) && (
                    <div className="flex flex-wrap gap-2">
                      {activeAnalysis.technicalSkills.map((skill, idx) => (
                        <Badge key={idx} variant="primary">{skill.name || skill}</Badge>
                      ))}
                    </div>
                  )}
                </div>
              </Card>

              {/* Soft Skills & Keywords */}
              <div className="space-y-6">
                <Card>
                  <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center">
                    <span className="w-8 h-8 rounded bg-secondary/20 text-secondary flex items-center justify-center mr-3">🤝</span>
                    Soft Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {activeAnalysis.softSkills?.map((skill, idx) => (
                      <Badge key={idx} variant="secondary">{skill}</Badge>
                    ))}
                  </div>
                </Card>

                <Card>
                  <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center">
                    <span className="w-8 h-8 rounded bg-orange-500/20 text-orange-500 flex items-center justify-center mr-3">🔑</span>
                    ATS Keywords
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {activeAnalysis.keywords?.map((keyword, idx) => (
                      <Badge key={idx} variant="default">{keyword}</Badge>
                    ))}
                  </div>
                </Card>
              </div>
            </div>

            {/* Priority Topics */}
            <Card>
              <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center">
                <span className="w-8 h-8 rounded bg-error/20 text-error flex items-center justify-center mr-3">🎯</span>
                Priority Interview Topics
              </h3>
              <div className="space-y-4">
                {activeAnalysis.priorityTopics?.map((topic, idx) => (
                  <div key={idx} className="p-4 bg-surface-hover rounded-xl border border-border">
                    <div className="flex items-start mb-3">
                      <div className={`mt-1 mr-3 w-2 h-2 rounded-full flex-shrink-0 ${
                        topic.importance?.toLowerCase() === 'high' ? 'bg-error' : 
                        topic.importance?.toLowerCase() === 'medium' ? 'bg-warning' : 'bg-success'
                      }`} />
                      <div>
                        <h4 className="font-bold text-text-primary">{topic.topic}</h4>
                        <p className="text-sm text-text-secondary mt-1">{topic.description}</p>
                      </div>
                    </div>
                    
                    {/* Action Buttons for Unified Workflow */}
                    <div className="flex flex-wrap gap-2 mt-3 ml-5">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-primary bg-primary/5 hover:bg-primary/10 border border-primary/20"
                        onClick={() => { setSelectedTopic(topic.topic); setStudyModalOpen(true); }}
                      >
                        <FiBookOpen className="mr-1.5" /> Study Material
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        className="text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200"
                        onClick={() => navigate('/mcq-generator', { state: { jobRole: activeAnalysis.jobRole, skills: topic.topic } })}
                      >
                        <FiList className="mr-1.5" /> Take MCQ
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        className="text-purple-600 bg-purple-50 hover:bg-purple-100 border border-purple-200"
                        onClick={() => navigate('/mock-interview', { state: { jobRole: `${activeAnalysis.jobRole} (${topic.topic})` } })}
                      >
                        <FiVideo className="mr-1.5" /> Mock Interview
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Roadmap */}
            {activeAnalysis.roadmap && typeof activeAnalysis.roadmap === 'object' && (
              <Card>
                <h3 className="text-lg font-bold text-text-primary mb-6 flex items-center">
                  <span className="w-8 h-8 rounded bg-emerald-500/20 text-emerald-500 flex items-center justify-center mr-3">🗺️</span>
                  Preparation Roadmap
                </h3>
                <div className="space-y-3">
                  {Object.entries(activeAnalysis.roadmap).map(([week, topics], idx) => (
                    <div key={idx} className="border border-border rounded-lg overflow-hidden bg-surface-hover">
                      <button 
                        className="w-full flex justify-between items-center p-4 hover:bg-surface transition-colors"
                        onClick={() => setExpandedWeek(expandedWeek === week ? null : week)}
                      >
                        <h4 className="font-bold text-text-primary capitalize">{week.replace(/([A-Z])/g, ' $1').trim()}</h4>
                        {expandedWeek === week ? <FiChevronUp /> : <FiChevronDown />}
                      </button>
                      <AnimatePresence>
                        {expandedWeek === week && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden bg-surface"
                          >
                            <div className="p-4 border-t border-border">
                              <ul className="space-y-2">
                                {Array.isArray(topics) ? topics.map((topic, tIdx) => (
                                  <li key={tIdx} className="flex items-start text-sm text-text-secondary">
                                    <FiCheckCircle className="text-success mt-0.5 mr-2 flex-shrink-0" />
                                    <span>{topic}</span>
                                  </li>
                                )) : (
                                  <li className="text-sm text-text-secondary">{String(topics)}</li>
                                )}
                              </ul>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        ) : (
          <Card className="flex-1 flex flex-col min-h-[500px]">
            <h3 className="text-xl font-bold text-text-primary mb-6">Recent Analyses</h3>
            
            {isPastLoading ? (
              <div className="flex-1 flex justify-center items-center"><Loader /></div>
            ) : pastAnalyses?.data?.length > 0 ? (
              <div className="space-y-4 flex-1 overflow-y-auto pr-2 scrollbar-thin">
                {pastAnalyses.data.map(analysis => (
                  <div 
                    key={analysis._id} 
                    className="p-4 rounded-xl border border-border bg-surface-hover hover:border-primary/50 cursor-pointer transition-colors"
                    onClick={() => setActiveAnalysis(analysis)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-text-primary">{analysis.jobRole}</h4>
                      <Badge variant="default">{new Date(analysis.createdAt).toLocaleDateString()}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-3">
                      {analysis.technicalSkills?.slice(0, 3).map((skill, idx) => (
                        <span key={idx} className="text-xs px-2 py-1 rounded bg-surface text-text-secondary">
                          {skill.name || skill}
                        </span>
                      ))}
                      {analysis.technicalSkills?.length > 3 && (
                        <span className="text-xs px-2 py-1 rounded bg-surface text-text-muted">
                          +{analysis.technicalSkills.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex flex-col justify-center items-center text-text-muted">
                <div className="w-16 h-16 rounded-full bg-surface-hover flex items-center justify-center mb-4">
                  <FiBriefcase className="w-8 h-8 opacity-50" />
                </div>
                <p>No past analyses found.</p>
                <p className="text-sm mt-2">Paste a job description to get started.</p>
              </div>
            )}
          </Card>
        )}
      </div>
      
      {/* Study Material Modal */}
      {studyModalOpen && activeAnalysis && (
        <StudyMaterialModal 
          isOpen={studyModalOpen} 
          onClose={() => setStudyModalOpen(false)} 
          topic={selectedTopic} 
          jobRole={activeAnalysis.jobRole} 
        />
      )}
    </div>
  );
};

export default JobAnalysis;
