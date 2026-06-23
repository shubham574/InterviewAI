import React from 'react';
import { SignUp } from '@clerk/clerk-react';
import SEOHead from '../components/common/SEOHead';

const Register = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <SEOHead title="Sign Up" />
      <SignUp routing="path" path="/register" signInUrl="/login" forceRedirectUrl="/dashboard" />
    </div>
  );
};

export default Register;
