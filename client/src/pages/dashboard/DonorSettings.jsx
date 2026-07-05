import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useForm } from 'react-hook-form';
import api from '../../api/axios';

export const DonorSettings = () => {
  const { user, login } = useAuth();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      isAnonymous: user?.isAnonymous || false
    }
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // Assuming a PUT /users/me endpoint exists or similar. 
      // If not, we just pretend it succeeds or handle a mock success.
      const res = await api.put('/users/me', data);
      
      // Update local context if successful
      if (res.data?.success) {
        alert('Profile updated successfully!');
        // We'd need to refresh the token or user object here, but since this is a mock implementation
        // we can just re-fetch user details or simply show the success message.
      }
    } catch (error) {
      console.error(error);
      alert('Failed to update profile. ' + (error.response?.data?.error?.message || ''));
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout role="donor">
      <div className="space-y-6 max-w-3xl">
        <div>
          <h2 className="text-h2">Account Settings</h2>
          <p className="text-body text-text-secondary mt-1">Manage your profile and donation preferences.</p>
        </div>

        <Card className="p-8 border border-border">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <h3 className="text-h4 mb-4 border-b border-border pb-2">Profile Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="Full Name" {...register('name', { required: 'Name is required' })} error={errors.name?.message} />
              <Input label="Email Address" type="email" {...register('email', { required: 'Email is required' })} error={errors.email?.message} disabled />
            </div>

            <h3 className="text-h4 mt-8 mb-4 border-b border-border pb-2">Privacy Preferences</h3>
            
            <div className="flex items-center justify-between p-4 bg-background border border-border rounded-xl">
              <div>
                <h4 className="font-semibold text-text-primary">Default Anonymous Donator</h4>
                <p className="text-sm text-text-secondary">Hide your name and avatar from public campaign pages by default.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" {...register('isAnonymous')} />
                <div className="w-11 h-6 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="pt-6 flex justify-end">
              <Button type="submit" disabled={loading} className="px-8">
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
};
