import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '@/services/api';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  simpleMode: boolean;
  toggleSimpleMode: () => void;
  login: (email?: string, password?: string) => Promise<void>;
  register: (name?: string, email?: string, password?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>({
    id: 'usr_1',
    name: 'Nisal Sanjaya',
    email: 'nisal@example.com',
  });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [simpleMode, setSimpleMode] = useState<boolean>(false);

  const toggleSimpleMode = () => {
    setSimpleMode((prev) => !prev);
  };

  const login = async (email?: string, password?: string) => {
    setIsLoading(true);
    try {
      // Mock login for UI development
      const dummyUser = { id: 'usr_1', name: email?.split('@')[0] || 'User', email: email || 'user@example.com' };
      setUser(dummyUser);
      setIsAuthenticated(true);
      api.setToken('mock_token_123');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name?: string, email?: string, password?: string) => {
    setIsLoading(true);
    try {
      const dummyUser = { id: 'usr_2', name: name || 'New User', email: email || 'new@example.com' };
      setUser(dummyUser);
      setIsAuthenticated(true);
      api.setToken('mock_token_456');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setUser(null);
    setIsAuthenticated(false);
    api.setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        simpleMode,
        toggleSimpleMode,
        login,
        register,
        logout,
      }}>
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
