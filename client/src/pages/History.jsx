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
      case 'analysis': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'mcq': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'assessment': return 'bg-primary/10 text-primary border-primary/20';
      case 'interview': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'mock': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      default: return 'bg-white text-text-primary border-gray-200';
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
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
                filter === type 
                  ? 'bg-primary text-white border-primary' 
                  : 'bg-surface text-text-secondary border-border hover:bg-surface-hover'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <Card className="min-h-[500px]">
        {isLoading ? (
          <div className="h-64 flex justify-center items-center"><Loader /></div>
        ) : historyItems.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-3 px-4 font-medium text-text-secondary text-sm w-16">Type</th>
                  <th className="pb-3 px-4 font-medium text-text-secondary text-sm">Role / Topic</th>
                  <th className="pb-3 px-4 font-medium text-text-secondary text-sm w-32">Date</th>
                  <th className="pb-3 px-4 font-medium text-text-secondary text-sm w-24">Details</th>
                  <th className="pb-3 px-4 font-medium text-text-secondary text-sm w-16 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {historyItems.map((item, idx) => (
                  <tr key={idx} className="hover:bg-surface-hover transition-colors group">
                    <td className="py-4 px-4">
                      <div 
                        className={`w-10 h-10 rounded-lg flex items-center justify-center border ${getColorForType(item.historyType)}`}
                        title={getLabelForType(item.historyType)}
                      >
                        {getIconForType(item.historyType)}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-medium text-text-primary">{item.jobRole || 'General'}</div>
                      <div className="text-xs text-text-muted mt-1">{getLabelForType(item.historyType)}</div>
                    </td>
                    <td className="py-4 px-4 text-sm text-text-secondary">
                      {formatDate(item.createdAt)}
                    </td>
                    <td className="py-4 px-4">
                      {item.historyType === 'assessment' && <Badge variant={item.score >= 70 ? 'success' : 'warning'}>{item.score}%</Badge>}
                      {item.historyType === 'mock' && item.status === 'completed' && <Badge variant="success">{item.overallFeedback?.averageScore || 0}%</Badge>}
                      {item.historyType === 'mock' && item.status !== 'completed' && <Badge variant="warning">Draft</Badge>}
                      {item.historyType === 'mcq' && <Badge variant="default">{item.count} Qs</Badge>}
                      {item.historyType === 'analysis' && <Badge variant="primary">{item.experienceLevel}</Badge>}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button 
                        onClick={() => handleDelete(item.historyType, item._id)}
                        className="p-2 text-text-muted hover:text-error hover:bg-error/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
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
          <div className="h-64 flex flex-col justify-center items-center text-text-muted">
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
