import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { setToken } from '../../api/axios';
import api from '../../api/axios';
import { Button } from '../../components/ui/Button';
import { HeartHandshake } from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Extract redirect path from URL
  const searchParams = new URLSearchParams(location.search);
  const redirect = searchParams.get('redirect');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data?.success) {
        const { user, accessToken } = res.data.data;
        await login(user, accessToken);
        setToken(accessToken);
        
        if (redirect) {
          navigate(redirect);
        } else {
          // Default redirect by role
          if (user.role === 'admin') navigate('/admin');
          else if (user.role === 'creator') navigate('/creator');
          else navigate('/donor');
        }
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-surface">
      {/* Left side - Branding (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-primary">
        <div className="relative z-10 flex flex-col items-center justify-center p-12 text-white h-full w-full text-center">
          <Link to="/" className="text-4xl font-heading font-bold text-white flex flex-col items-center gap-4 mb-12">
            <HeartHandshake className="w-16 h-16" />
            KindFund
          </Link>
          <div className="max-w-md">
            <h1 className="text-4xl font-heading font-bold mb-6 leading-tight">
              Welcome back to a community of changemakers.
            </h1>
            <p className="text-lg opacity-90">
              Your continued support helps bring world-changing ideas to life. Sign in to track your impact, manage your campaigns, or discover new causes.
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-background p-8 sm:p-10 rounded-3xl border border-border shadow-warm-lg">
          <div>
            <h2 className="text-center text-3xl font-heading font-extrabold text-text-primary">
              Sign In
            </h2>
            <p className="mt-2 text-center text-sm text-text-secondary">
              Or <Link to="/register" className="font-medium text-primary hover:text-primary-hover">create a new account</Link>
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && <div className="p-3 bg-highlight/10 border border-highlight/30 text-highlight-dark rounded-xl text-sm">{error}</div>}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Email address</label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-3 bg-surface border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Password</label>
                <input
                  type="password"
                  required
                  className="w-full px-4 py-3 bg-surface border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
            </div>

            <Button type="submit" className="w-full py-3" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
