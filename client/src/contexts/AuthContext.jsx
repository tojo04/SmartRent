import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react';
import { authAPI, setAccessToken } from '../lib/api';

const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_USER':
      return { ...state, user: action.payload, isAuthenticated: !!action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'LOGOUT':
      return { ...state, user: null, isAuthenticated: false, error: null };
    default:
      return state;
  }
};

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null,
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check if user is authenticated on app load (guarded to avoid duplicate
  // requests under React.StrictMode in development)
  const hasCheckedRef = useRef(false);
  useEffect(() => {
    if (hasCheckedRef.current) return;
    hasCheckedRef.current = true;

    const checkAuth = async () => {
      try {
        // 1) Try to refresh access token using HTTP-only cookie (if present)
        try {
          const { accessToken } = await authAPI.refresh();
          if (accessToken) setAccessToken(accessToken);
        } catch {
          // Ignore: user may be first-time visitor without refresh cookie
        }

        // 2) Ask backend for current user
        const data = await authAPI.me();
        dispatch({ type: 'SET_USER', payload: data.user });
      } catch (error) {
        // Treat 401/403/429 as unauthenticated without spamming retries
        const status = error?.response?.status;
        if (status === 429) {
          // Soft backoff once to let any rate limiter cool down
          setTimeout(async () => {
            try {
              const data = await authAPI.me();
              dispatch({ type: 'SET_USER', payload: data.user });
            } catch {
              dispatch({ type: 'SET_USER', payload: null });
            } finally {
              dispatch({ type: 'SET_LOADING', payload: false });
            }
          }, 800);
          return;
        }
        dispatch({ type: 'SET_USER', payload: null });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const data = await authAPI.login(credentials);
      setAccessToken(data.accessToken);
      dispatch({ type: 'SET_USER', payload: data.user });
      
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      dispatch({ type: 'SET_ERROR', payload: message });
      return { success: false, error: message };
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const register = async (userData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const data = await authAPI.register(userData);
      setAccessToken(data.accessToken);
      dispatch({ type: 'SET_USER', payload: data.user });
      
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      dispatch({ type: 'SET_ERROR', payload: message });
      return { success: false, error: message };
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      // Even if logout fails on server, clear local state
      console.error('Logout error:', error);
    } finally {
      setAccessToken(null);
      dispatch({ type: 'LOGOUT' });
    }
  };

  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, []);

  const value = {
    ...state,
    login,
    register,
    logout,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};