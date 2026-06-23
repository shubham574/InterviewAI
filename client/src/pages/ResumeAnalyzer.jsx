import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { FiUploadCloud, FiFileText, FiCheck, FiAlertTriangle, FiX } from 'react-icons/fi';
import { useApiMutation } from '../hooks/useApi';
import { API } from '../api/endpoints';
import SEOHead from '../components/common/SEOHead';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Loader from '../components/ui/Loader';
import { getGradeColor } from '../utils/helpers';
import { showError } from '../components/ui/Toast';

const ResumeAnalyzer = () => {
  const [jobDescription, setJobDescription] = useState('');
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const fileInputRef = useRef(null);

  // Analyze mutation
  const analyzeMutation = useApiMutation(API.RESUME.ANALYZE, 'post', {
    successMessage: 'Resume analyzed successfully!',
    onSuccess: (data) => {
      setAnalysisResult(data.data);
    }
  });

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      validateAndSetFile(droppedFile);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    if (selectedFile.type !== 'application/pdf') {
      showError('Please upload a PDF file');
      return;
    }
    
    if (selectedFile.size > 5 * 1024 * 1024) {
      showError('File size must be less than 5MB');
      return;
    }
    
    setFile(selectedFile);
  };

  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAnalyze = (e) => {
    e.preventDefault();
    
    if (!file) {
      return showError('Please upload your resume');
    }
    
    if (!jobDescription.trim()) {
      return showError('Please paste the job description');
    }

    const formData = new FormData();
    formData.append('resume', file);
    formData.append('jobDescription', jobDescription);

    analyzeMutation.mutate(formData);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 min-h-[calc(100vh-8rem)]">
      <SEOHead title="Resume Analyzer" />
      
      {/* Left side - Form */}
      <div className="w-full lg:w-1/3 flex flex-col space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Resume Match</h1>
          <p className="text-text-secondary mt-1">Compare your resume against a JD to see your match score and missing skills.</p>
        </div>

        <Card className="flex-1 flex flex-col">
          <form onSubmit={handleAnalyze} className="space-y-6 flex-1 flex flex-col">
            
            {/* File Upload Zone */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-secondary block">Upload Resume (PDF)</label>
              
              {!file ? (
                <div 
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                    isDragging ? 'border-primary bg-primary/5' : 'border-border bg-surface-hover hover:border-primary/50'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept="application/pdf" 
                    className="hidden" 
                  />
                  <FiUploadCloud className={`w-12 h-12 mb-3 ${isDragging ? 'text-primary' : 'text-text-muted'}`} />
                  <p className="text-sm font-medium text-text-primary mb-1">Click to upload or drag and drop</p>
                  <p className="text-xs text-text-muted">PDF only (max 5MB)</p>
                </div>
              ) : (
                <div className="border border-border rounded-xl p-4 bg-surface-hover flex items-center justify-between">
                  <div className="flex items-center overflow-hidden">
                    <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center text-primary mr-3 flex-shrink-0">
                      <FiFileText className="w-5 h-5" />
                    </div>
                    <div className="truncate">
                      <p className="text-sm font-medium text-text-primary truncate">{file.name}</p>
                      <p className="text-xs text-text-muted">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <button 
                    type="button" 
                    onClick={removeFile}
                    className="p-2 text-text-muted hover:text-error hover:bg-error/10 rounded-lg transition-colors ml-2"
                  >
                    <FiX />
                  </button>
                </div>
              )}
            </div>

            <div className="flex-1 flex flex-col">
              <Input
                id="jd"
                label="Job Description"
                placeholder="Paste the full job description here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                textarea
                rows={10}
                className="flex-1"
                required
              />
            </div>

            <Button 
              type="submit" 
              fullWidth 
              size="lg"
              loading={analyzeMutation.isPending}
              disabled={!file || !jobDescription}
              className="mt-auto"
            >
              Analyze Match
            </Button>
          </form>
        </Card>
      </div>

      {/* Right side - Results */}
      <div className="w-full lg:w-2/3 flex flex-col">
        {analyzeMutation.isPending ? (
          <Card className="flex-1 flex flex-col items-center justify-center min-h-[500px]">
            <Loader size="lg" />
            <h3 className="text-xl font-bold mt-6 text-text-primary">Scanning Resume...</h3>
            <p className="text-text-secondary mt-2 text-center max-w-md">
              Our AI is analyzing your resume against the job description to calculate an ATS match score.
            </p>
          </Card>
        ) : analysisResult ? (
          <div className="flex flex-col h-full space-y-6 animate-fade-in pb-10">
            {/* Header / Overall Score */}
            <Card variant="gradient" className="p-8">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="w-32 h-32 rounded-full border-8 flex items-center justify-center flex-shrink-0 bg-background/20"
                  style={{ borderColor: analysisResult.matchScore >= 80 ? '#10b981' : analysisResult.matchScore >= 60 ? '#f59e0b' : '#ef4444' }}
                >
                  <span className="text-4xl font-bold text-text-primary">{analysisResult.matchScore}%</span>
                </div>
                
                <div>
                  <h2 className="text-2xl font-bold text-text-primary mb-2">Resume Match Score</h2>
                  <p className="text-text-secondary leading-relaxed text-lg">
                    {analysisResult.summary}
                  </p>
                  
                  <div className="mt-4 flex gap-2">
                    <Badge variant={analysisResult.matchScore >= 80 ? 'success' : 'warning'}>
                      {analysisResult.matchScore >= 80 ? 'Highly Recommended to Apply' : 'Update Resume First'}
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Matched Skills */}
              <Card>
                <h3 className="text-lg font-bold text-success mb-4 flex items-center">
                  <span className="w-8 h-8 rounded bg-success/20 flex items-center justify-center mr-3">
                    <FiCheck />
                  </span>
                  Matched Skills
                </h3>
                
                {analysisResult.matchedSkills?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {analysisResult.matchedSkills.map((skill, idx) => (
                      <Badge key={idx} variant="success">{skill}</Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-text-muted">No key skills from the JD found in your resume.</p>
                )}
              </Card>

              {/* Missing Skills */}
              <Card>
                <h3 className="text-lg font-bold text-error mb-4 flex items-center">
                  <span className="w-8 h-8 rounded bg-error/20 flex items-center justify-center mr-3">
                    <FiAlertTriangle />
                  </span>
                  Missing Skills
                </h3>
                
                {analysisResult.missingSkills?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {analysisResult.missingSkills.map((skill, idx) => (
                      <Badge key={idx} variant="error">{skill}</Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-text-muted">Great! You have all the key skills.</p>
                )}
              </Card>
            </div>

            {/* Recommendations */}
            <Card>
              <h3 className="text-lg font-bold text-text-primary mb-4 border-b border-border pb-4">
                How to improve your resume
              </h3>
              <ul className="space-y-4">
                {analysisResult.recommendations?.map((rec, idx) => (
                  <li key={idx} className="flex items-start text-text-secondary bg-surface-hover p-4 rounded-lg border border-border">
                    <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs mr-3 flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        ) : (
          <div className="flex-1 flex flex-col justify-center items-center text-text-muted h-full min-h-[500px]">
            <div className="w-20 h-20 rounded-full bg-surface-hover flex items-center justify-center mb-6">
              <FiFileText className="w-10 h-10 opacity-30" />
            </div>
            <h3 className="text-xl font-medium mb-2">Check your ATS Score</h3>
            <p className="text-center max-w-md">
              Upload your resume and the job description to see how well you match the role and get tips to optimize your resume before applying.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeAnalyzer;
