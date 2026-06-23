import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar for authenticated layout */}
      <Sidebar isOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <div className="flex flex-col flex-1 w-full overflow-hidden">
        <Navbar toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
        
        <main className="flex-1 overflow-y-auto overflow-x-hidden focus:outline-none scrollbar-thin relative bg-background">
          {/* Subtle background decoration */}
          <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-indigo-50/50 to-transparent pointer-events-none -z-10" />
          <div className="absolute top-[-20%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-100/30 blur-[120px] pointer-events-none -z-10" />
          <div className="absolute top-[20%] right-[-10%] w-[30%] h-[50%] rounded-full bg-purple-100/20 blur-[100px] pointer-events-none -z-10" />
          
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full min-h-full pb-20"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default Layout;
