import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, RadialBarChart, RadialBar, Legend
} from 'recharts';
import { 
  FiFileText, FiList, FiVideo, FiTrendingUp, FiArrowRight, FiActivity
} from 'react-icons/fi';
import { useApiQuery } from '../hooks/useApi';
import { API } from '../api/endpoints';
import SEOHead from '../components/common/SEOHead';
import Card from '../components/ui/Card';
import AnimatedCounter from '../components/ui/AnimatedCounter';
import Loader from '../components/ui/Loader';
import { getGradeColor, formatDate } from '../utils/helpers';
import useAuth from '../hooks/useAuth';

const Dashboard = () => {
  const { user } = useAuth();
  const { data: response, isLoading } = useApiQuery('dashboardStats', API.DASHBOARD.STATS);

  if (isLoading) {
    return <Loader fullScreen />;
  }

  const { stats, topicPerformance, progressOverTime, recentActivity } = response?.data || {};

  // Default empty state data for charts if no data exists
  const hasData = stats?.totalAssessments > 0 || stats?.totalMockInterviews > 0;
  
  const displayProgress = progressOverTime?.length > 0 
    ? progressOverTime 
    : [{ name: 'No Data', score: 0 }];

  const displayTopics = topicPerformance?.length > 0
    ? topicPerformance
    : [{ topic: 'No Data', score: 0 }];

  const readinessData = [
    { name: 'Target', value: 100, fill: 'var(--color-surface-hover)' },
    { name: 'Score', value: stats?.readinessScore || 0, fill: 'var(--color-primary)' }
  ];

  return (
    <div className="space-y-6">
      <SEOHead title="Dashboard" />
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Welcome back, {user?.name.split(' ')[0]} 👋</h1>
          <p className="text-text-secondary mt-1">Here's an overview of your interview preparation.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/job-analysis" className="bg-surface hover:bg-surface-hover border border-border px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            New Job Analysis
          </Link>
          <Link to="/mock-interview" className="bg-gradient-primary hover:opacity-90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-primary/20">
            Start Mock Interview
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="flex items-center p-6 border-l-4 border-l-primary">
          <div className="p-3 rounded-lg bg-primary/10 text-primary mr-4">
            <FiList className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-text-secondary font-medium">MCQ Tests Taken</p>
            <h3 className="text-2xl font-bold text-text-primary">
              <AnimatedCounter value={stats?.totalAssessments || 0} />
            </h3>
          </div>
        </Card>

        <Card className="flex items-center p-6 border-l-4 border-l-emerald-500">
          <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-500 mr-4">
            <FiVideo className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-text-secondary font-medium">Mock Interviews</p>
            <h3 className="text-2xl font-bold text-text-primary">
              <AnimatedCounter value={stats?.totalMockInterviews || 0} />
            </h3>
          </div>
        </Card>

        <Card className="flex items-center p-6 border-l-4 border-l-orange-500">
          <div className="p-3 rounded-lg bg-orange-500/10 text-orange-500 mr-4">
            <FiFileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-text-secondary font-medium">Job Analyses</p>
            <h3 className="text-2xl font-bold text-text-primary">
              <AnimatedCounter value={stats?.totalAnalyses || 0} />
            </h3>
          </div>
        </Card>

        <Card className="flex items-center p-6 border-l-4 border-l-secondary">
          <div className="p-3 rounded-lg bg-secondary/10 text-secondary mr-4">
            <FiTrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-text-secondary font-medium">Average Score</p>
            <h3 className="text-2xl font-bold text-text-primary flex items-baseline">
              <AnimatedCounter value={stats?.averageScore || 0} />
              <span className="text-sm text-text-muted ml-1">%</span>
            </h3>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Readiness Score */}
        <Card className="lg:col-span-1 flex flex-col items-center justify-center p-6">
          <h3 className="text-lg font-bold text-text-primary w-full mb-2">Interview Readiness</h3>
          <p className="text-sm text-text-secondary w-full mb-6">Combined score from all activities</p>
          
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart 
                cx="50%" 
                cy="50%" 
                innerRadius="70%" 
                outerRadius="100%" 
                barSize={15} 
                data={readinessData}
                startAngle={180}
                endAngle={0}
              >
                <RadialBar
                  minAngle={15}
                  background={{ fill: 'var(--color-surface-hover)' }}
                  clockWise
                  dataKey="value"
                  cornerRadius={10}
                />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="text-center -mt-20">
            <span className={`text-4xl font-bold ${getGradeColor(stats?.readinessScore || 0)}`}>
              <AnimatedCounter value={stats?.readinessScore || 0} />%
            </span>
            <p className="text-sm text-text-muted mt-1">
              {stats?.readinessScore >= 80 ? 'Ready to interview!' : 
               stats?.readinessScore >= 60 ? 'Needs some practice' : 
               'Keep preparing'}
            </p>
          </div>
        </Card>

        {/* Progress Chart */}
        <Card className="lg:col-span-2 p-6">
          <h3 className="text-lg font-bold text-text-primary mb-6">Performance Trend</h3>
          <div className="h-64">
            {hasData ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={displayProgress} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="name" stroke="var(--color-text-muted)" fontSize={12} tickMargin={10} />
                  <YAxis stroke="var(--color-text-muted)" fontSize={12} domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb', borderRadius: '8px', color: '#111827' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="var(--color-primary)" 
                    strokeWidth={3}
                    dot={{ fill: 'var(--color-primary)', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-text-muted">
                <FiActivity className="w-8 h-8 mb-2 opacity-20" />
                <p>Take some tests to see your progress</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Topic Strengths */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-text-primary mb-6">Topic Strengths</h3>
          <div className="h-64">
            {hasData ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={displayTopics} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} stroke="var(--color-text-muted)" fontSize={12} />
                  <YAxis dataKey="topic" type="category" stroke="var(--color-text-muted)" fontSize={12} width={100} />
                  <Tooltip 
                    cursor={{ fill: 'var(--color-surface-hover)' }}
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb', borderRadius: '8px', color: '#111827' }}
                  />
                  <Bar dataKey="score" fill="var(--color-secondary)" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
               <div className="w-full h-full flex items-center justify-center text-text-muted">
                <p>Complete assessments to see topic analysis</p>
              </div>
            )}
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-text-primary">Recent Activity</h3>
            <Link to="/history" className="text-sm text-primary hover:text-primary-light flex items-center">
              View All <FiArrowRight className="ml-1" />
            </Link>
          </div>
          
          <div className="space-y-4">
            {recentActivity?.length > 0 ? (
              recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start p-3 rounded-lg hover:bg-surface-hover transition-colors border border-transparent hover:border-border">
                  <div className={`p-2 rounded-lg mr-4 mt-1 flex-shrink-0 ${
                    activity.type === 'assessment' ? 'bg-primary/10 text-primary' :
                    activity.type === 'mock_interview' ? 'bg-emerald-500/10 text-emerald-500' :
                    'bg-orange-500/10 text-orange-500'
                  }`}>
                    {activity.type === 'assessment' ? <FiList /> :
                     activity.type === 'mock_interview' ? <FiVideo /> :
                     <FiFileText />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">{activity.title}</p>
                    <p className="text-xs text-text-muted mt-1">{formatDate(activity.date)}</p>
                  </div>
                  {activity.score !== undefined && (
                    <div className="text-right ml-4">
                      <span className={`text-sm font-bold ${getGradeColor(activity.score)}`}>
                        {activity.score}%
                      </span>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-text-muted">
                <p>No recent activity found.</p>
                <Link to="/job-analysis" className="text-primary mt-2 inline-block">Analyze a job description to get started</Link>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
