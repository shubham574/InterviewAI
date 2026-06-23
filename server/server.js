require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { clerkMiddleware } = require('@clerk/express');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(clerkMiddleware());

// Routes
const jobAnalysisRoutes = require('./routes/jobAnalysis.routes');
const mcqRoutes = require('./routes/mcq.routes');
const assessmentRoutes = require('./routes/assessment.routes');
const interviewRoutes = require('./routes/interview.routes');
const mockInterviewRoutes = require('./routes/mockInterview.routes');
const resumeRoutes = require('./routes/resume.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const historyRoutes = require('./routes/history.routes');
const studyRoutes = require('./routes/study.routes');

app.use('/api/job-analysis', jobAnalysisRoutes);
app.use('/api/mcqs', mcqRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/mock-interview', mockInterviewRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/study', studyRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'success', message: 'Server is running' });
});

// Error Handler Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
