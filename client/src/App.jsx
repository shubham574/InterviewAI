import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

// Components
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';
import ErrorBoundary from './components/common/ErrorBoundary';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import JobAnalysis from './pages/JobAnalysis';
import MCQGenerator from './pages/MCQGenerator';
import AssessmentTest from './pages/AssessmentTest';
import InterviewQuestions from './pages/InterviewQuestions';
import MockInterview from './pages/MockInterview';
import ResumeAnalyzer from './pages/ResumeAnalyzer';
import History from './pages/History';
import Profile from './pages/Profile';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Router>
          <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login/*" element={<Login />} />
            <Route path="/register/*" element={<Register />} />

            {/* Protected Routes inside Layout */}
            <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/job-analysis" element={<JobAnalysis />} />
              <Route path="/mcq-generator" element={<MCQGenerator />} />
              <Route path="/assessment/:id" element={<AssessmentTest />} />
              <Route path="/interview-questions" element={<InterviewQuestions />} />
              <Route path="/mock-interview" element={<MockInterview />} />
              <Route path="/resume-analyzer" element={<ResumeAnalyzer />} />
              <Route path="/history" element={<History />} />
              <Route path="/profile/*" element={<Profile />} />
            </Route>
          </Routes>
        </Router>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
