import React, { createContext, useContext, useMemo } from 'react';

const UserContext = createContext<any>(null);

export const UserProvider = ({ children }) => {
  const user = useMemo(() => {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : {};
    } catch {
      return {};
    }
  }, []);
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
};

export const useUser = () => useContext(UserContext); 