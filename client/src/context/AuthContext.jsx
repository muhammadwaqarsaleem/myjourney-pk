/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect, useCallback } from 'react';
import { api } from '../api/axios';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Hydrate authenticated user session on mount via HTTP-only cookie
  const checkAuth = useCallback(async () => {
    try {
      const response = await api.get('/auth/me');
      if (response.data?.success && response.data?.user) {
        setUser(response.data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    api
      .get('/auth/me')
      .then((response) => {
        if (active && response.data?.success && response.data?.user) {
          setUser(response.data.user);
        } else if (active) {
          setUser(null);
        }
      })
      .catch(() => {
        if (active) {
          setUser(null);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  // Execute login and update in-memory user state without local/session storage
  const login = async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data?.success && response.data?.user) {
      setUser(response.data.user);
      return response.data.user;
    }
    throw new Error('Login failed to return valid user profile');
  };

  // Register account and immediately establish authenticated state
  const register = async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.data?.success && response.data?.user) {
      setUser(response.data.user);
      return response.data.user;
    }
    throw new Error('Registration failed to return valid user profile');
  };

  // Clear HTTP-only auth cookie and reset memory state
  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      setUser(null);
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated: Boolean(user),
    checkAuth,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
