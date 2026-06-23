import React from 'react';
import { SignIn } from '@clerk/clerk-react';
import SEOHead from '../components/common/SEOHead';

const Login = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <SEOHead title="Log In" />
      <SignIn routing="path" path="/login" signUpUrl="/register" forceRedirectUrl="/dashboard" />
    </div>
  );
};

export default Login;
