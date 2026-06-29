import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const ProtectedRoute = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading session...</div>;
  }

  if (!user) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  return children;
};

export const RoleRoute = ({ children, allowedRoles }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading session...</div>;
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-surface px-6 text-center">
        <div className="w-20 h-20 bg-highlight/10 rounded-full flex items-center justify-center mb-6">
          <svg className="w-10 h-10 text-highlight" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-4xl font-heading font-bold mb-4">403 Forbidden</h1>
        <p className="text-text-secondary max-w-md mb-8">You don't have access to this page. Please ensure you are logged in with the correct role.</p>
        <button onClick={() => window.history.back()} className="text-primary font-medium hover:underline">
          Go back to previous page
        </button>
      </div>
    );
  }

  return children;
};
