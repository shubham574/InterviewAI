import React, { useState } from 'react';
import { FiUser, FiMail, FiLock, FiCamera } from 'react-icons/fi';
import useAuth from '../hooks/useAuth';
import SEOHead from '../components/common/SEOHead';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { getInitials } from '../utils/helpers';
import { useApiMutation } from '../hooks/useApi';
import { API } from '../api/endpoints';

const Profile = () => {
  const { user, setUser } = useAuth();
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const updateProfileMutation = useApiMutation(API.AUTH.PROFILE, 'put', {
    successMessage: 'Profile updated successfully',
    onSuccess: (data) => {
      setUser(data.user);
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <SEOHead title="Profile Settings" />
      
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Profile Settings</h1>
        <p className="text-text-secondary mt-1">Manage your account details and preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column - Avatar & Info */}
        <div className="space-y-6">
          <Card className="flex flex-col items-center p-8 text-center">
            <div className="relative mb-4 group">
              <div className="w-32 h-32 rounded-full border-4 border-white bg-gray-50 flex items-center justify-center text-4xl font-bold text-primary overflow-hidden shadow-xl shadow-primary/10">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  getInitials(user?.name)
                )}
              </div>
              <button className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full shadow-lg hover:bg-primary-light transition-colors">
                <FiCamera />
              </button>
            </div>
            
            <h3 className="text-xl font-bold text-text-primary">{user?.name}</h3>
            <p className="text-text-secondary mt-1">{user?.email}</p>
            
            <div className="w-full mt-6 pt-6 border-t border-border text-left">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-text-secondary">Member since</span>
                <span className="text-sm font-medium text-text-primary">
                  {new Date(user?.createdAt || Date.now()).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-text-secondary">Account Status</span>
                <span className="text-sm font-medium text-success">Active</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column - Forms */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <h3 className="text-lg font-bold text-text-primary mb-4 border-b border-border pb-4">Personal Information</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  id="name"
                  label="Full Name"
                  value={formData.name}
                  onChange={handleChange}
                  icon={FiUser}
                />
                <Input
                  id="email"
                  type="email"
                  label="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                  icon={FiMail}
                />
              </div>

              <h3 className="text-lg font-bold text-text-primary mt-8 mb-4 border-b border-border pb-4 pt-4">Change Password</h3>
              
              <Input
                id="currentPassword"
                type="password"
                label="Current Password"
                value={formData.currentPassword}
                onChange={handleChange}
                icon={FiLock}
                placeholder="Leave blank to keep same"
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  id="newPassword"
                  type="password"
                  label="New Password"
                  value={formData.newPassword}
                  onChange={handleChange}
                  icon={FiLock}
                  placeholder="Leave blank to keep same"
                />
                <Input
                  id="confirmPassword"
                  type="password"
                  label="Confirm New Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  icon={FiLock}
                  placeholder="Leave blank to keep same"
                />
              </div>

              <div className="pt-4 flex justify-end">
                <Button 
                  type="submit" 
                  loading={updateProfileMutation.isPending}
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
