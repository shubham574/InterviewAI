import React, { useState } from 'react';
import { motion } from 'motion/react';
import { FiTrash2, FiBriefcase, FiList, FiVideo, FiMessageSquare, FiFileText } from 'react-icons/fi';
import { useApiQuery, useApiMutation } from '../hooks/useApi';
import { API } from '../api/endpoints';
import SEOHead from '../components/common/SEOHead';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Loader from '../components/ui/Loader';
import { formatDate } from '../utils/helpers';

const History = () => {
  const [filter, setFilter] = useState('all');

  const { data: response, isLoading, refetch } = useApiQuery(
    ['history', filter],
    `${API.HISTORY.LIST}?type=${filter}&limit=50`
  );

  const deleteMutation = useApiMutation('', 'delete', {
    successMessage: 'Item deleted successfully',
    onSuccess: () => refetch()
  });

  const handleDelete = (type, id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      deleteMutation.mutate(null, {
        url: API.HISTORY.DELETE(type, id)
      });
    }
  };

  const getIconForType = (type) => {
    switch (type) {
      case 'analysis': return <FiBriefcase />;
      case 'mcq': return <FiList />;
      case 'assessment': return <FiCheckCircle />;
      case 'interview': return <FiMessageSquare />;
      case 'mock': return <FiVideo />;
      default: return <FiFileText />;
    }
  };

  const getColorForType = (type) => {
    switch (type) {
      case 'analysis': return 'bg-[#ea580c15] text-[#ea580c] border-[#ea580c30]';
      case 'mcq': return 'bg-[#a855f715] text-[#a855f7] border-[#a855f730]';
      case 'assessment': return 'bg-accent-primary/15 text-accent-primary border-accent-primary/30';
      case 'interview': return 'bg-[#3b82f615] text-[#3b82f6] border-[#3b82f630]';
      case 'mock': return 'bg-success/15 text-success border-success/30';
      default: return 'bg-bg-surface text-text-primary border-border-subtle';
    }
  };

  const getLabelForType = (type) => {
    switch (type) {
      case 'analysis': return 'Job Analysis';
      case 'mcq': return 'MCQ Set';
      case 'assessment': return 'Assessment';
      case 'interview': return 'Interview Qs';
      case 'mock': return 'Mock Interview';
      default: return type;
    }
  };

  const historyItems = response?.data || [];

  return (
    <div className="space-y-6">
      <SEOHead title="History" />
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Activity History</h1>
          <p className="text-text-secondary mt-1">Review your past generations, assessments, and mock interviews.</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {['all', 'analysis', 'mcq', 'assessment', 'interview', 'mock'].map(type => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border ${
                filter === type 
                  ? 'bg-accent-primary text-white border-accent-glow shadow-md shadow-accent-primary/20' 
                  : 'bg-bg-surface text-text-secondary border-border-subtle hover:bg-bg-canvas hover:text-text-primary'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <Card className="min-h-[500px] p-0 overflow-hidden bg-bg-surface border-border-subtle">
        {isLoading ? (
          <div className="h-64 flex justify-center items-center"><Loader /></div>
        ) : historyItems.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border-subtle bg-bg-canvas/50">
                  <th className="py-4 px-6 font-semibold text-text-secondary text-sm w-16 uppercase tracking-wider">Type</th>
                  <th className="py-4 px-6 font-semibold text-text-secondary text-sm uppercase tracking-wider">Role / Topic</th>
                  <th className="py-4 px-6 font-semibold text-text-secondary text-sm w-32 uppercase tracking-wider">Date</th>
                  <th className="py-4 px-6 font-semibold text-text-secondary text-sm w-32 uppercase tracking-wider">Details</th>
                  <th className="py-4 px-6 font-semibold text-text-secondary text-sm w-16 text-right uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {historyItems.map((item, idx) => (
                  <tr key={idx} className="hover:bg-bg-canvas transition-colors group">
                    <td className="py-4 px-6">
                      <div 
                        className={`w-10 h-10 rounded-xl flex items-center justify-center border ${getColorForType(item.historyType)}`}
                        title={getLabelForType(item.historyType)}
                      >
                        {getIconForType(item.historyType)}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-medium text-text-primary">{item.jobRole || 'General'}</div>
                      <div className="text-xs text-text-secondary mt-1">{getLabelForType(item.historyType)}</div>
                    </td>
                    <td className="py-4 px-6 text-sm text-text-secondary">
                      {formatDate(item.createdAt)}
                    </td>
                    <td className="py-4 px-6">
                      {item.historyType === 'assessment' && <Badge variant={item.score >= 70 ? 'success' : 'warning'}>{item.score}%</Badge>}
                      {item.historyType === 'mock' && item.status === 'completed' && <Badge variant="success">{item.overallFeedback?.averageScore || 0}%</Badge>}
                      {item.historyType === 'mock' && item.status !== 'completed' && <Badge variant="warning">Draft</Badge>}
                      {item.historyType === 'mcq' && <Badge variant="info">{item.count} Qs</Badge>}
                      {item.historyType === 'analysis' && <Badge variant="primary">{item.experienceLevel}</Badge>}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button 
                        onClick={() => handleDelete(item.historyType, item._id)}
                        className="p-2 text-text-secondary hover:text-danger hover:bg-danger/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        title="Delete"
                      >
                        <FiTrash2 />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="h-64 flex flex-col justify-center items-center text-text-secondary">
            <FiList className="w-12 h-12 mb-4 opacity-20" />
            <p>No history found for the selected filter.</p>
          </div>
        )}
      </Card>
    </div>
  );
};

// Also import FiCheckCircle since I used it above
import { FiCheckCircle } from 'react-icons/fi';

export default History;
