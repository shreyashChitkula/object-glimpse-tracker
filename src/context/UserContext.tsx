import React, { createContext, useContext, useState } from 'react';

interface UserContextType {
  user: any;
  isAuthenticated: boolean;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  registerUser: (userData: any) => void;
  logoutUser: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const registerUser = (userData: UserContextType['user']) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logoutUser = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    setLoading,
    registerUser,
    logoutUser
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