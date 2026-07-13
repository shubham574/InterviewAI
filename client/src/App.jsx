import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
// Components
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';
import ErrorBoundary from './components/common/ErrorBoundary';
import CustomCursor from './components/ui/CustomCursor';

// Pages
const Landing = React.lazy(() => import('./pages/Landing'));
const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const JobAnalysis = React.lazy(() => import('./pages/JobAnalysis'));
const MCQGenerator = React.lazy(() => import('./pages/MCQGenerator'));
const AssessmentTest = React.lazy(() => import('./pages/AssessmentTest'));
const InterviewQuestions = React.lazy(() => import('./pages/InterviewQuestions'));
const MockInterview = React.lazy(() => import('./pages/MockInterview'));
const ResumeAnalyzer = React.lazy(() => import('./pages/ResumeAnalyzer'));
const History = React.lazy(() => import('./pages/History'));
const Profile = React.lazy(() => import('./pages/Profile'));
const LiveInterview = React.lazy(() => import('./pages/LiveInterview'));

// ... (keep queryClient)
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
          <CustomCursor />
          <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
          <React.Suspense fallback={
            <div className="flex items-center justify-center min-h-screen bg-bg-canvas">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-primary"></div>
            </div>
          }>
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
                <Route path="/live-interview" element={<LiveInterview />} />
                <Route path="/resume-analyzer" element={<ResumeAnalyzer />} />
                <Route path="/history" element={<History />} />
                <Route path="/profile/*" element={<Profile />} />
              </Route>
            </Routes>
          </React.Suspense>
        </Router>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
