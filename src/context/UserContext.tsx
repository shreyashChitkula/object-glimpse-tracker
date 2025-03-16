
import React, { createContext, useContext, useState } from 'react';

interface User {
  id?: string;
  fullName?: string;
  email?: string;
  role?: 'user' | 'admin';
}

interface UserContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  registerUser: (userData: User) => void;
  logoutUser: () => void;
  isAdmin: () => boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const registerUser = (userData: User) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logoutUser = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  const isAdmin = () => {
    return user?.role === 'admin';
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    setLoading,
    registerUser,
    logoutUser,
    isAdmin
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
