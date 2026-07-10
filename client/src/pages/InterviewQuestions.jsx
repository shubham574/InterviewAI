import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FiMessageSquare, FiChevronDown, FiChevronUp, FiClock, FiCheck, FiDownload } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';
import html2pdf from 'html2pdf.js';
import { useApiMutation, useApiQuery } from '../hooks/useApi';
import { API } from '../api/endpoints';
import { QUESTION_CATEGORIES } from '../utils/constants';
import SEOHead from '../components/common/SEOHead';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Loader from '../components/ui/Loader';

const InterviewQuestions = () => {
  const [jobRole, setJobRole] = useState('');
  const [skills, setSkills] = useState('');
  const [category, setCategory] = useState('technical');
  const [count, setCount] = useState('10');
  const [activeSet, setActiveSet] = useState(null);
  const [expandedQuestion, setExpandedQuestion] = useState(null);

  // Fetch past question sets
  const { data: pastSets, isLoading: isPastLoading } = useApiQuery(
    'questionSets', 
    API.INTERVIEW.LIST
  );

  // Generate mutation
  const generateMutation = useApiMutation(API.INTERVIEW.GENERATE, 'post', {
    successMessage: 'Questions generated successfully!',
    invalidateQueries: ['questionSets'],
    onSuccess: (data) => {
      setActiveSet(data.data);
      setExpandedQuestion(null);
    }
  });

  const handleGenerate = (e) => {
    e.preventDefault();
    if (!jobRole || !skills) return;
    
    generateMutation.mutate({
      jobRole,
      skills: skills.split(',').map(s => s.trim()).filter(Boolean),
      category,
      count: Number(count)
    });
  };

  const toggleQuestion = (index) => {
    setExpandedQuestion(expandedQuestion === index ? null : index);
  };

  const viewSavedSet = async (id) => {
    try {
      const res = await fetch(API.INTERVIEW.GET(id), {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      setActiveSet(data.data);
      setExpandedQuestion(null);
    } catch (err) {
      console.error(err);
    }
  };

  const [isDownloading, setIsDownloading] = useState(false);
  const pdfContainerRef = useRef(null);

  const handleDownloadPDF = async () => {
    if (!activeSet) return;
    setIsDownloading(true);
    
    const element = pdfContainerRef.current;
    
    const opt = {
      margin:       10,
      filename:     `${activeSet.jobRole}_Interview_Questions.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, logging: false },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // Need a slight delay to allow the DOM to update and render the hidden container if needed
    setTimeout(async () => {
      try {
        // Temporarily make the hidden container block so html2canvas can read it
        element.style.display = 'block';
        await html2pdf().set(opt).from(element).save();
      } catch (err) {
        console.error("PDF generation failed", err);
      } finally {
        element.style.display = 'none';
        setIsDownloading(false);
      }
    }, 100);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 min-h-[calc(100vh-8rem)]">
      <SEOHead title="Interview Questions" />
      
      {/* Left side - Form */}
      <div className="w-full lg:w-1/3 flex flex-col space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Interview Questions</h1>
          <p className="text-text-secondary mt-1">Generate role-specific interview questions with ideal answers and key points.</p>
        </div>

        <Card>
          <form onSubmit={handleGenerate} className="space-y-5">
            <Input
              id="jobRole"
              label="Target Role"
              placeholder="e.g., Backend Developer"
              value={jobRole}
              onChange={(e) => setJobRole(e.target.value)}
              required
            />

            <Input
              id="skills"
              label="Specific Skills / Topics (comma separated)"
              placeholder="Node.js, Express, MongoDB, API Design"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <Select
                id="category"
                label="Question Category"
                options={QUESTION_CATEGORIES}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              />

              <Select
                id="count"
                label="Number of Questions"
                options={[5, 10, 15, 20]}
                value={count}
                onChange={(e) => setCount(e.target.value)}
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
        {!activeSet && !generateMutation.isPending && (
          <Card className="flex-1 flex flex-col min-h-[300px]">
            <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center">
              <FiClock className="mr-2" /> Recent Sets
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
                      <h4 className="font-medium text-text-primary truncate" title={set.jobRole}>{set.jobRole}</h4>
                      <span className="text-xs text-text-muted flex-shrink-0 ml-2">{new Date(set.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="default" className="capitalize">{set.category.replace('-', ' ')}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex justify-center items-center text-text-muted text-sm">
                No past question sets.
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
            <h3 className="text-xl font-bold mt-6 text-text-primary">Generating Questions...</h3>
            <p className="text-text-secondary mt-2 text-center max-w-md">
              Our AI is curating the most relevant {category} questions for a {jobRole}.
            </p>
          </Card>
        ) : activeSet ? (
          <div className="flex flex-col h-full space-y-6 animate-fade-in pb-10">
            {/* Header Action Bar */}
            <Card variant="gradient" className="flex items-center justify-between p-6">
              <div>
                <h2 className="text-2xl font-bold text-text-primary">{activeSet.jobRole}</h2>
                <div className="flex gap-2 mt-2">
                  <Badge variant="primary" className="capitalize">{activeSet.category.replace('-', ' ')}</Badge>
                  <Badge variant="default">{activeSet.questions.length} Questions</Badge>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="primary" 
                  onClick={handleDownloadPDF} 
                  loading={isDownloading}
                  icon={FiDownload}
                  className="bg-white/20 hover:bg-white/30 border-none text-white"
                >
                  Download PDF
                </Button>
                <Button variant="secondary" onClick={() => setActiveSet(null)}>
                  Close
                </Button>
              </div>
            </Card>

            {/* Hidden Container for PDF Export (renders everything expanded) */}
            <div 
              ref={pdfContainerRef} 
              style={{ display: 'none', padding: '20px', background: '#fff', color: '#000' }}
              className="pdf-export-container"
            >
              <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>
                {activeSet.jobRole} Interview Questions
              </h1>
              <p style={{ marginBottom: '20px', color: '#666' }}>
                Category: {activeSet.category.replace('-', ' ')}
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {activeSet.questions.map((q, qIndex) => (
                  <div key={qIndex} style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>
                      <span style={{ color: '#4f46e5', marginRight: '8px' }}>Q{qIndex + 1}.</span> 
                      {q.question}
                    </h3>
                    
                    <div style={{ marginBottom: '16px' }}>
                      <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: '#4f46e5', textTransform: 'uppercase', marginBottom: '8px' }}>Ideal Answer</h4>
                      <div style={{ padding: '12px', backgroundColor: '#f5f3ff', borderRadius: '8px', fontSize: '14px', lineHeight: '1.6' }}>
                        <ReactMarkdown className="prose prose-sm max-w-none">
                          {q.idealAnswer}
                        </ReactMarkdown>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '20px' }}>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: '#10b981', textTransform: 'uppercase', marginBottom: '8px' }}>Key Points to Cover</h4>
                        <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {q.keyPoints.map((point, pIdx) => (
                            <li key={pIdx} style={{ fontSize: '14px', display: 'flex', alignItems: 'flex-start' }}>
                              <span style={{ color: '#10b981', marginRight: '8px' }}>•</span>
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div style={{ flex: 1 }}>
                        <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: '#ef4444', textTransform: 'uppercase', marginBottom: '8px' }}>Common Mistakes</h4>
                        <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {q.commonMistakes.map((mistake, mIdx) => (
                            <li key={mIdx} style={{ fontSize: '14px', display: 'flex', alignItems: 'flex-start' }}>
                              <span style={{ color: '#ef4444', marginRight: '8px' }}>•</span>
                              <span>{mistake}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Questions List (UI View) */}
            <div className="space-y-4">
              {activeSet.questions.map((q, qIndex) => (
                <div key={qIndex} className="border border-border rounded-xl bg-surface overflow-hidden">
                  <button 
                    className={`w-full text-left p-5 flex justify-between items-start transition-colors ${
                      expandedQuestion === qIndex ? 'bg-surface-hover' : 'hover:bg-surface-hover'
                    }`}
                    onClick={() => toggleQuestion(qIndex)}
                  >
                    <h3 className="text-lg font-medium text-text-primary pr-6">
                      <span className="text-primary font-bold mr-2">Q{qIndex + 1}.</span> 
                      {q.question}
                    </h3>
                    <div className="mt-1 flex-shrink-0 text-text-muted">
                      {expandedQuestion === qIndex ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
                    </div>
                  </button>
                  
                  <AnimatePresence>
                    {expandedQuestion === qIndex && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-border bg-surface-hover/30"
                      >
                        <div className="p-6 space-y-6">
                          {/* Ideal Answer */}
                          <div>
                            <h4 className="text-sm font-bold text-primary uppercase tracking-wider mb-3">Ideal Answer</h4>
                            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 text-text-secondary leading-relaxed overflow-hidden prose prose-sm dark:prose-invert max-w-none">
                              <ReactMarkdown>{q.idealAnswer}</ReactMarkdown>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Key Points */}
                            <div>
                              <h4 className="text-sm font-bold text-success uppercase tracking-wider mb-3 flex items-center">
                                <FiCheck className="mr-2" /> Key Points to Cover
                              </h4>
                              <ul className="space-y-2">
                                {q.keyPoints.map((point, pIdx) => (
                                  <li key={pIdx} className="flex items-start text-sm text-text-secondary">
                                    <div className="w-1.5 h-1.5 rounded-full bg-success mt-1.5 mr-2 flex-shrink-0" />
                                    <span>{point}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            
                            {/* Common Mistakes */}
                            <div>
                              <h4 className="text-sm font-bold text-error uppercase tracking-wider mb-3 flex items-center">
                                <span className="mr-2 text-lg leading-none">⚠️</span> Common Mistakes
                              </h4>
                              <ul className="space-y-2">
                                {q.commonMistakes.map((mistake, mIdx) => (
                                  <li key={mIdx} className="flex items-start text-sm text-text-secondary">
                                    <div className="w-1.5 h-1.5 rounded-full bg-error mt-1.5 mr-2 flex-shrink-0" />
                                    <span>{mistake}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col justify-center items-center text-text-muted h-full min-h-[500px]">
            <div className="w-20 h-20 rounded-full bg-surface-hover flex items-center justify-center mb-6">
              <FiMessageSquare className="w-10 h-10 opacity-30" />
            </div>
            <h3 className="text-xl font-medium mb-2">Prepare for your specific role</h3>
            <p className="text-center max-w-md">
              Generate behavioral, technical, or scenario-based questions to practice answering effectively.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewQuestions;
