import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true); // initial load
  const [authLoading, setAuthLoading] = useState(false); // login/signup loading
  const [error, setError] = useState(null);
  const sessionTimerRef = useRef(null);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    clearTimeout(sessionTimerRef.current);
  }, []);

  // Axios interceptor: auto-logout on 401
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          logout();
        }
        return Promise.reject(error);
      }
    );
    return () => axios.interceptors.response.eject(interceptor);
  }, [logout]);

  // Setup auth header and session expiration timer
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
      // 1 hour session timeout (adjustable)
      sessionTimerRef.current = setTimeout(() => {
        logout();
        // Optional: trigger toast via UI layer elsewhere
      }, 60 * 60 * 1000);
      fetchCurrentUser();
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
      setUser(null);
      setLoading(false);
    }
    return () => clearTimeout(sessionTimerRef.current);
  }, [token, logout]);

  const fetchCurrentUser = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/v1/auth/me`);
      setUser(response.data);
    } catch (err) {
      console.error('Failed to fetch user', err);
      setError('Unable to retrieve user profile.');
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    setAuthLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_BASE}/api/v1/auth/login`, { email, password }, { timeout: 10000 });
      setToken(response.data.access_token);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed');
      throw err;
    } finally {
      setAuthLoading(false);
    }
  };

  const signup = async (email, password, fullName) => {
    setAuthLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_BASE}/api/v1/auth/signup`, { email, password, full_name: fullName }, { timeout: 10000 });
      return response.data;
    } catch (err) {
      setError(err.response?.data?.detail || 'Signup failed');
      throw err;
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, authLoading, error, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
