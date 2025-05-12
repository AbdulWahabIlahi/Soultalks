import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/apiService';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUserState] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Custom setUser function that updates localStorage
  const setUser = (userData) => {
    setUserState(userData);
    
    // Store updated user data in localStorage if it exists
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData));
    }
  };

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        // Check if we have a token in localStorage
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        console.log('Authentication check - Token exists:', !!token);
        
        if (token) {
          // Set the token in axios headers
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          console.log('Set Authorization header with token');
          
          // If we have a stored user, use it initially
          if (storedUser) {
            console.log('Using stored user data from localStorage');
            setUserState(JSON.parse(storedUser));
            setIsAuthenticated(true);
          }
          
          // Fetch current user
          console.log('Fetching current user data from API...');
          const res = await api.get('/auth/me');
          
          if (res.data && res.data.data && res.data.data.user) {
            console.log('Current user data fetched successfully');
            const freshUserData = res.data.data.user;
            setUser(freshUserData);
            setIsAuthenticated(true);
          } else {
            console.warn('Failed to get valid user data from API');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            delete api.defaults.headers.common['Authorization'];
          }
        }
      } catch (err) {
        console.error('Error loading user:', err);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete api.defaults.headers.common['Authorization'];
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Register user
  const register = async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await api.post('/auth/register', userData);
      
      if (res.data && res.data.token) {
        // Save token to localStorage
        localStorage.setItem('token', res.data.token);
        
        // Set auth header
        api.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
        
        // Set user state
        setUser(res.data.data.user);
        setIsAuthenticated(true);
        
        return true;
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.error || 'Registration failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Login user
  const login = async (credentials) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Attempting login...');
      const res = await api.post('/auth/login', credentials);
      
      if (res.data && res.data.token) {
        console.log('Login successful, token received');
        
        // Save token to localStorage
        localStorage.setItem('token', res.data.token);
        console.log('Token saved to localStorage');
        
        // Set auth header
        api.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
        console.log('Auth header set with token');
        
        // Set user state
        console.log('Setting user data:', res.data.data.user);
        setUser(res.data.data.user);
        setIsAuthenticated(true);
        
        return true;
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.error || 'Invalid credentials');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = async () => {
    try {
      await api.get('/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    }
    
    // Remove token and user from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Remove auth header
    delete api.defaults.headers.common['Authorization'];
    
    // Clear user state
    setUserState(null);
    setIsAuthenticated(false);
  };

  // Clear error
  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        isAuthenticated,
        loading,
        error,
        register,
        login,
        logout,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 