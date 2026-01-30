import React, { createContext, useContext, useState, useEffect } from 'react';

// Create AuthContext for managing authentication state
const AuthContext = createContext();

// Custom hook to use authentication context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// AuthProvider component to wrap the app and provide authentication state
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  // Check if user is already logged in (from localStorage)
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    
    if (token && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
    }
  }, []);

  // Login function
  const login = async (username, password) => {
    try {
      // Simple authentication check (in real app, this would be an API call)
      if (username === 'admin' && password === 'admin123') {
        const userData = { username, role: 'admin' };
        localStorage.setItem('authToken', 'dummy-token');
        localStorage.setItem('userData', JSON.stringify(userData));
        setIsAuthenticated(true);
        setUser(userData);
        return { success: true };
      } else {
        return { success: false, message: 'Invalid credentials' };
      }
    } catch (error) {
      return { success: false, message: 'Login failed' };
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    setIsAuthenticated(false);
    setUser(null);
  };

  const value = {
    isAuthenticated,
    user,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
