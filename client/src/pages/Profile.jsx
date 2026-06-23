import React from 'react';
import { UserProfile } from '@clerk/clerk-react';
import SEOHead from '../components/common/SEOHead';

const Profile = () => {
  return (
    <div className="max-w-4xl mx-auto flex flex-col items-center py-8">
      <SEOHead title="Profile Settings" />
      <UserProfile routing="path" path="/profile" />
    </div>
  );
};

export default Profile;
