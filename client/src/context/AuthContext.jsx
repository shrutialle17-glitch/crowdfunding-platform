import React, { createContext, useContext, useState, useEffect } from 'react';
import api, { setToken } from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Set the interceptor token handler
  useEffect(() => {
    // In a real app, we might attempt a silent refresh on mount if we expect a session
    // but the spec focuses on interceptor-driven refresh. We will do a quick check here.
    const attemptSilentRefresh = async () => {
      try {
        const res = await api.post('/auth/refresh');
        if (res.data?.success) {
          const newToken = res.data.data.accessToken;
          setAccessToken(newToken);
          setToken(newToken);
          // Fetch full user profile to get bookmarks/follows
          const meRes = await api.get('/users/me');
          setUser(meRes.data.data);
        }
      } catch (e) {
        // Expected if no valid refresh token
      } finally {
        setIsLoading(false);
      }
    };
    attemptSilentRefresh();
  }, []);

  const login = async (userData, token) => {
    setAccessToken(token);
    setToken(token);
    // Fetch full user profile to get bookmarks/follows
    try {
      const meRes = await api.get('/users/me');
      setUser(meRes.data.data);
    } catch (error) {
      setUser(userData); // fallback
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      console.error('Logout error', e);
    }
    setUser(null);
    setAccessToken(null);
    setToken(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, setAccessToken, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
