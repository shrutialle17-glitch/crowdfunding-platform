import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { setToken } from '../../api/axios';
import api from '../../api/axios';
import { Button } from '../../components/ui/Button';
import { z } from 'zod';
import { HeartHandshake } from 'lucide-react';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
  role: z.enum(['donor', 'creator'])
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'donor'
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const redirect = searchParams.get('redirect');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    
    try {
      registerSchema.parse(formData);
      setErrors({});
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldErrors = {};
        err.errors.forEach(error => {
          if (error.path[0]) fieldErrors[error.path[0]] = error.message;
        });
        setErrors(fieldErrors);
        return;
      }
    }

    setLoading(true);

    try {
      const res = await api.post('/auth/register', { 
        name: formData.name, 
        email: formData.email, 
        password: formData.password, 
        role: formData.role 
      });
      
      if (res.data?.success) {
        const { user, accessToken } = res.data.data;
        login(user, accessToken);
        setToken(accessToken);
        
        if (redirect) {
          navigate(redirect);
        } else {
          if (user.role === 'admin') navigate('/admin');
          else if (user.role === 'creator') navigate('/creator');
          else navigate('/donor');
        }
      }
    } catch (err) {
      setServerError(err.response?.data?.error?.message || 'Registration failed');
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
              Join a movement of real impact.
            </h1>
            <p className="text-lg opacity-90">
              Whether you're starting a campaign to change your community, or backing a creator who inspires you, you belong here.
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-background p-8 sm:p-10 rounded-3xl border border-border shadow-warm-lg">
          <div>
            <h2 className="text-center text-3xl font-heading font-extrabold text-text-primary">
              Create an Account
            </h2>
            <p className="mt-2 text-center text-sm text-text-secondary">
              Already have an account? <Link to="/login" className="font-medium text-primary hover:text-primary-hover">Sign in</Link>
            </p>
          </div>
          
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {serverError && <div className="p-3 bg-highlight/10 border border-highlight/30 text-highlight-dark rounded-xl text-sm">{serverError}</div>}
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Full Name</label>
                <input
                  name="name"
                  type="text"
                  className="w-full px-4 py-3 bg-surface border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Jane Doe"
                />
                {errors.name && <p className="text-highlight-dark text-xs mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Email address</label>
                <input
                  name="email"
                  type="email"
                  className="w-full px-4 py-3 bg-surface border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                />
                {errors.email && <p className="text-highlight-dark text-xs mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Password</label>
                <input
                  name="password"
                  type="password"
                  className="w-full px-4 py-3 bg-surface border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                />
                {errors.password && <p className="text-highlight-dark text-xs mt-1">{errors.password}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Confirm Password</label>
                <input
                  name="confirmPassword"
                  type="password"
                  className="w-full px-4 py-3 bg-surface border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                />
                {errors.confirmPassword && <p className="text-highlight-dark text-xs mt-1">{errors.confirmPassword}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">I want to...</label>
                <div className="flex gap-4">
                  <label className="flex-1 flex items-center gap-2 p-3 border border-border rounded-xl cursor-pointer hover:bg-surface transition-colors">
                    <input
                      type="radio"
                      name="role"
                      value="donor"
                      checked={formData.role === 'donor'}
                      onChange={handleChange}
                      className="text-primary focus:ring-primary"
                    />
                    <span className="text-sm font-medium">Donate</span>
                  </label>
                  <label className="flex-1 flex items-center gap-2 p-3 border border-border rounded-xl cursor-pointer hover:bg-surface transition-colors">
                    <input
                      type="radio"
                      name="role"
                      value="creator"
                      checked={formData.role === 'creator'}
                      onChange={handleChange}
                      className="text-primary focus:ring-primary"
                    />
                    <span className="text-sm font-medium">Create</span>
                  </label>
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full py-3" disabled={loading}>
              {loading ? 'Creating account...' : 'Sign up'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
