import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import Loader from '../ui/Loader';

const ProtectedRoute = ({ children }) => {
  const { isLoaded, userId } = useAuth();
  const location = useLocation();

  if (!isLoaded) {
    return <Loader fullScreen />;
  }

  if (!userId) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
