import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  FiHome, 
  FiBriefcase, 
  FiList, 
  FiCheckCircle, 
  FiMessageSquare, 
  FiVideo, 
  FiFileText, 
  FiClock 
} from 'react-icons/fi';

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/dashboard', icon: FiHome },
  { label: 'Job Analysis', path: '/job-analysis', icon: FiBriefcase },
  { label: 'MCQ Generator', path: '/mcq-generator', icon: FiList },
  // Hide assessment test from sidebar as it should only be accessed via MCQ Generator
  { label: 'Interview Questions', path: '/interview-questions', icon: FiMessageSquare },
  { label: 'Mock Interview', path: '/mock-interview', icon: FiVideo },
  { label: 'Resume Analyzer', path: '/resume-analyzer', icon: FiFileText },
  { label: 'History', path: '/history', icon: FiClock },
];

const Sidebar = ({ isOpen, setSidebarOpen }) => {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-0 pt-16 lg:pt-0 flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-thin">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 group relative ${
                  isActive
                    ? 'text-primary bg-indigo-50 font-semibold shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active-indicator"
                      className="absolute left-0 w-1 h-8 bg-gradient-primary rounded-r-full"
                      initial={false}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                  <item.icon
                    className={`flex-shrink-0 w-5 h-5 mr-3 transition-colors ${
                      isActive ? 'text-primary' : 'text-gray-400 group-hover:text-gray-600'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
        
        <div className="p-4 border-t border-gray-200">
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-xl p-4 text-center">
            <div className="text-xl mb-2">🚀</div>
            <h4 className="text-sm font-bold text-text-primary mb-1">Pro Features</h4>
            <p className="text-xs text-gray-500 mb-3">Unlock unlimited AI generations</p>
            <button className="w-full bg-gradient-primary text-white text-xs font-bold py-2 rounded-lg hover:opacity-90 shadow-md shadow-primary/20 transition-all">
              Upgrade
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
