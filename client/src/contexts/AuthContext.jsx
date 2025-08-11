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
      dispatch({ type: 'SET_LOADING', payload: true });
  
      try {
        const persist = !!localStorage.getItem('sr_remember');
  
        // Try to refresh access token if refresh cookie exists
        const { accessToken } = await authAPI.refresh({ persist });
        if (accessToken) {
          setAccessToken(accessToken);
          const data = await authAPI.me();
          dispatch({ type: 'SET_USER', payload: data.user });
        } else {
          dispatch({ type: 'SET_USER', payload: null });
        }
      } catch {
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
  
      if (data.requiresVerification) {
        return { 
          success: true, 
          requiresVerification: true, 
          user: data.user,
          message: data.message 
        };
      } else {
        setAccessToken(data.accessToken);
        dispatch({ type: 'SET_USER', payload: data.user });
        
        if (credentials.rememberMe) {
          localStorage.setItem('sr_remember', '1');
        } else {
          localStorage.removeItem('sr_remember');
        }
        
        return { success: true };
      }
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
      
      if (data.requiresVerification) {
        return { 
          success: true, 
          requiresVerification: true, 
          user: data.user,
          message: data.message 
        };
      } else {
        setAccessToken(data.accessToken);
        dispatch({ type: 'SET_USER', payload: data.user });
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      dispatch({ type: 'SET_ERROR', payload: message });
      return { success: false, error: message };
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const verifyEmail = async (verificationData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const data = await authAPI.verifyEmail(verificationData);
      setAccessToken(data.accessToken);
      dispatch({ type: 'SET_USER', payload: data.user });
      
      return { success: true, message: data.message };
    } catch (error) {
      const message = error.response?.data?.message || 'Email verification failed';
      dispatch({ type: 'SET_ERROR', payload: message });
      return { success: false, error: message };
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const resendOTP = async (email) => {
    try {
      dispatch({ type: 'SET_ERROR', payload: null });
      const data = await authAPI.resendOTP({ email });
      return { success: true, message: data.message };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to resend OTP';
      dispatch({ type: 'SET_ERROR', payload: message });
      return { success: false, error: message };
    }
  };

  const requestPasswordReset = async (email) => {
    try {
      dispatch({ type: 'SET_ERROR', payload: null });
      const data = await authAPI.requestPasswordReset({ email });
      return { success: true, message: data.message, resetToken: data.resetToken };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to request password reset';
      dispatch({ type: 'SET_ERROR', payload: message });
      return { success: false, error: message };
    }
  };

  const resetPassword = async (resetData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const data = await authAPI.resetPassword(resetData);
      return { success: true, message: data.message };
    } catch (error) {
      const message = error.response?.data?.message || 'Password reset failed';
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
    verifyEmail,
    resendOTP,
    requestPasswordReset,
    resetPassword,
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