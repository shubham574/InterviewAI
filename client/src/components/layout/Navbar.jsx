import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiMenu, FiX } from 'react-icons/fi';
import { UserButton, useUser } from '@clerk/clerk-react';

const Navbar = ({ toggleSidebar, sidebarOpen }) => {
  const { isSignedIn } = useUser();
  const location = useLocation();

  // Don't show full navbar on auth pages or landing if not logged in
  const isAuthPage = ['/login', '/register'].includes(location.pathname);
  if (isAuthPage) return null;

  return (
    <nav className="sticky top-0 z-30 w-full bg-white/80 backdrop-blur-md border-b border-gray-200 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8">
      <div className="flex items-center">
        {isSignedIn && (
          <button
            onClick={toggleSidebar}
            className="mr-4 p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary lg:hidden"
          >
            {sidebarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
        )}
        
        <Link to="/" className="flex items-center space-x-2 lg:hidden">
          <span className="text-xl font-bold tracking-tight text-text-primary hidden sm:block">
            InterviewAce
          </span>
        </Link>
      </div>

      <div className="flex items-center">
        {isSignedIn ? (
          <UserButton afterSignOutUrl="/" />
        ) : (
          <div className="space-x-4">
            <Link to="/login" className="text-text-secondary hover:text-text-primary font-medium text-sm transition-colors">
              Login
            </Link>
            <Link to="/register" className="bg-gradient-primary text-white px-4 py-2 rounded-lg font-medium text-sm hover:opacity-90 transition-opacity">
              Get Started
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
