import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, RadialBarChart, RadialBar, Legend
} from 'recharts';
import { 
  FiFileText, FiList, FiVideo, FiTrendingUp, FiArrowRight, FiActivity, FiClock
} from 'react-icons/fi';
import { useApiQuery } from '../hooks/useApi';
import { API } from '../api/endpoints';
import SEOHead from '../components/common/SEOHead';
import Card from '../components/ui/Card';
import AnimatedCounter from '../components/ui/AnimatedCounter';
import Loader from '../components/ui/Loader';
import DashboardSkeleton from '../components/ui/DashboardSkeleton';
import { getGradeColor, formatDate } from '../utils/helpers';
import { useUser } from '@clerk/clerk-react';

const Dashboard = () => {
  const { user } = useUser();
  const { data: response, isLoading } = useApiQuery('dashboardStats', API.DASHBOARD.STATS);

  if (isLoading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-300">
        <SEOHead title="Dashboard | Loading..." />
        <DashboardSkeleton />
      </div>
    );
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
    { name: 'Score', value: stats?.readinessScore || 0, fill: 'var(--color-accent-primary)' }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <SEOHead title="Dashboard" />
      
      {/* ─── Action Hero ─── */}
      <div className="bg-bg-surface border border-border-subtle rounded-3xl p-8 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-accent-primary/10 via-transparent to-transparent pointer-events-none" />
        
        <div className="relative z-10 max-w-xl">
          <h1 className="text-3xl sm:text-4xl font-bold font-display text-text-primary mb-3">
            {hasData ? `Welcome back, ${user?.firstName || 'User'}` : `Ready to start, ${user?.firstName || 'User'}?`}
          </h1>
          <p className="text-lg text-text-secondary mb-8">
            {hasData 
              ? "Pick up where you left off and keep sharpening your interview skills." 
              : "Set up your first mock interview and get real-time AI feedback."}
          </p>
          <div className="flex gap-4">
            <Link to="/mock-interview" className="bg-accent-primary text-white px-6 py-3 rounded-xl font-semibold text-sm hover:opacity-90 transition-all shadow-md shadow-accent-primary/20 flex items-center">
              <FiVideo className="mr-2" /> Start New Interview
            </Link>
            {hasData && (
              <Link to="/history" className="bg-bg-elevated border border-border-subtle text-text-primary px-6 py-3 rounded-xl font-semibold text-sm hover:bg-surface-hover transition-colors flex items-center">
                <FiList className="mr-2" /> View History
              </Link>
            )}
          </div>
        </div>
        
        {hasData && (
          <div className="relative z-10 w-full md:w-auto shrink-0 bg-bg-canvas border border-border-subtle p-6 rounded-2xl flex flex-col items-center">
            <h3 className="text-sm font-medium text-text-secondary mb-4">Interview Readiness</h3>
            <div className="relative w-32 h-32 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart cx="50%" cy="50%" innerRadius="70%" outerRadius="100%" barSize={10} data={readinessData} startAngle={90} endAngle={-270}>
                  <RadialBar minAngle={15} background={{ fill: 'var(--color-surface-hover)' }} clockWise dataKey="value" cornerRadius={10} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-2xl font-bold font-mono text-text-primary">{stats?.readinessScore || 0}%</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ─── Stats Row ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'MCQ Tests', value: stats?.totalAssessments || 0, icon: FiList, color: 'text-info', bg: 'bg-info/10' },
          { label: 'Mock Interviews', value: stats?.totalMockInterviews || 0, icon: FiVideo, color: 'text-success', bg: 'bg-success/10' },
          { label: 'Analyses', value: stats?.totalAnalyses || 0, icon: FiFileText, color: 'text-warning', bg: 'bg-warning/10' },
          { label: 'Avg Score', value: `${stats?.averageScore || 0}%`, icon: FiTrendingUp, color: 'text-accent-primary', bg: 'bg-accent-primary/10' }
        ].map((stat, i) => (
          <div key={i} className="bg-bg-surface border border-border-subtle rounded-2xl p-5 flex items-center hover:border-accent-primary/30 transition-colors">
            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} mr-4`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-text-secondary font-medium uppercase tracking-wider mb-1">{stat.label}</p>
              <h3 className="text-2xl font-bold font-mono text-text-primary">
                {stat.value}
              </h3>
            </div>
          </div>
        ))}
      </div>

      {/* ─── Charts & Activity ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Trend */}
        <div className="lg:col-span-2 bg-bg-surface border border-border-subtle rounded-3xl p-6 lg:p-8">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-bold font-display text-text-primary">Performance Trend</h3>
          </div>
          <div className="h-64">
            {hasData ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={displayProgress} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-chart-grid)" vertical={false} />
                  <XAxis dataKey="name" stroke="var(--color-text-secondary)" fontSize={12} tickMargin={10} axisLine={false} tickLine={false} />
                  <YAxis stroke="var(--color-text-secondary)" fontSize={12} domain={[0, 100]} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--color-bg-elevated)', borderColor: 'var(--color-border-subtle)', borderRadius: '12px', color: 'var(--color-text-primary)' }}
                    itemStyle={{ color: 'var(--color-text-primary)' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="var(--color-accent-primary)" 
                    strokeWidth={3}
                    dot={{ fill: 'var(--color-bg-surface)', stroke: 'var(--color-accent-primary)', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: 'var(--color-accent-primary)' }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-text-secondary bg-bg-canvas/50 rounded-2xl border border-dashed border-border-subtle">
                <FiActivity className="w-8 h-8 mb-3 opacity-50" />
                <p className="text-sm">Complete your first interview to see trends</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-bg-surface border border-border-subtle rounded-3xl p-6 lg:p-8 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold font-display text-text-primary">Recent Sessions</h3>
            <Link to="/history" className="text-sm text-accent-primary hover:text-accent-glow font-medium flex items-center transition-colors">
              View All <FiArrowRight className="ml-1" />
            </Link>
          </div>
          
          <div className="space-y-3 flex-1">
            {recentActivity?.length > 0 ? (
              recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center p-3 rounded-xl hover:bg-surface-hover transition-colors group">
                  <div className={`p-2.5 rounded-lg mr-4 shrink-0 ${
                    activity.type === 'assessment' ? 'bg-info/10 text-info' :
                    activity.type === 'mock_interview' ? 'bg-success/10 text-success' :
                    'bg-warning/10 text-warning'
                  }`}>
                    {activity.type === 'assessment' ? <FiList size={18} /> :
                     activity.type === 'mock_interview' ? <FiVideo size={18} /> :
                     <FiFileText size={18} />}
                  </div>
                  <div className="flex-1 min-w-0 pr-4">
                    <p className="text-sm font-semibold text-text-primary truncate">{activity.title}</p>
                    <p className="text-xs text-text-secondary mt-0.5">{formatDate(activity.date)}</p>
                  </div>
                  {activity.score !== undefined && (
                    <div className="text-right flex flex-col items-end shrink-0">
                      <span className={`text-sm font-bold font-mono px-2 py-1 rounded bg-bg-canvas border border-border-subtle ${
                        activity.score >= 80 ? 'text-success' : activity.score >= 60 ? 'text-warning' : 'text-danger'
                      }`}>
                        {activity.score}%
                      </span>
                      <Link to={`/feedback/${activity.id || ''}`} className="text-[10px] uppercase tracking-wider font-semibold text-text-secondary group-hover:text-accent-primary mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        View
                      </Link>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center py-8">
                <div className="w-12 h-12 bg-bg-canvas rounded-full flex items-center justify-center text-text-secondary mb-3 border border-border-subtle">
                  <FiClock size={20} />
                </div>
                <p className="text-sm text-text-primary font-medium mb-1">No recent activity</p>
                <p className="text-xs text-text-secondary">Your completed sessions will appear here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
