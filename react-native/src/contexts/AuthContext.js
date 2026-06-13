import { router } from 'expo-router';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { setLogoutHandler } from '../api/apiClient';
import LocalStorage from '../providers/LocalStorage';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    setIsAuthenticated((prev) => {
      if (prev) {
        LocalStorage.remove('accessToken');
        LocalStorage.remove('refreshToken');
        router.replace('/login');
      }

      return false;
    });
  }, []);


  useEffect(() => {
    const checkAuth = async () => {
      const token = LocalStorage.accessToken();
      if (token) {
        setIsAuthenticated(true);
      }
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  useEffect(() => {
    setLogoutHandler(logout);
  }, [logout]);

  const login = (token) => {
    LocalStorage.accessToken(token);
    setIsAuthenticated(true);
    router.replace('/(tabs)');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

