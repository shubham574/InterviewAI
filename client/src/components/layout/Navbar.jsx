import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiMenu, FiX, FiSun, FiMoon } from 'react-icons/fi';
import { UserButton, useUser } from '@clerk/clerk-react';
import { useTheme } from '../../hooks/useTheme';

const Navbar = ({ toggleSidebar, sidebarOpen }) => {
  const { isSignedIn } = useUser();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  // Don't show full navbar on auth pages or landing if not logged in
  const isAuthPage = ['/login', '/register'].includes(location.pathname);
  if (isAuthPage) return null;

  const getPageTitle = (path) => {
    if (path.includes('dashboard')) return 'Dashboard';
    if (path.includes('mock-interview')) return 'New Interview';
    if (path.includes('live-interview')) return 'Live Session';
    if (path.includes('history')) return 'History & Progress';
    if (path.includes('profile')) return 'Settings';
    return 'Dashboard';
  };

  return (
    <nav className="sticky top-0 z-30 w-full bg-bg-surface/80 backdrop-blur-md border-b border-border-subtle h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="flex items-center">
        {isSignedIn && (
          <button
            onClick={toggleSidebar}
            className="mr-4 p-2 rounded-md text-text-secondary hover:text-text-primary hover:bg-surface-hover focus:outline-none focus:ring-2 focus:ring-accent-primary lg:hidden transition-colors"
          >
            {sidebarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
        )}
        
        <h1 className="text-lg font-semibold text-text-primary hidden sm:block">
          {getPageTitle(location.pathname)}
        </h1>
        
        <Link to="/" className="flex items-center space-x-2 lg:hidden">
          <span className="text-xl font-bold tracking-tight text-text-primary">
            InterviewAce
          </span>
        </Link>
      </div>

      <div className="flex items-center space-x-4">
        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme} 
          className="p-2 rounded-full hover:bg-bg-elevated transition-colors text-text-secondary hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
          aria-label="Toggle theme"
        >
          {theme === 'light' ? <FiMoon size={18} /> : <FiSun size={18} />}
        </button>

        {/* Status Indicator (Mock for now, can be wired to socket later) */}
        <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-bg-canvas border border-border-subtle">
          <span className="w-2 h-2 rounded-full bg-success"></span>
          <span className="text-xs text-text-secondary font-medium">All systems operational</span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
