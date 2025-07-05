import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id?: string;
  name?: string;
  email?: string;
}

interface UserContextType {
  user: User;
  setUser: (user: User) => void;
  updateUser: (updates: Partial<User>) => void;
  clearUser: () => void;
  isLoggedIn: boolean;
}

const UserContext = createContext<UserContextType | null>(null);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUserState] = useState<User>({});

  // Load user from localStorage on mount
  useEffect(() => {
    try {
      const userStr = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      if (userStr && userStr.trim() !== '' && token) {
        const userData = JSON.parse(userStr);
        console.log('Loading user from localStorage:', userData);
        setUserState(userData);
      }
    } catch (error) {
      console.error('Error loading user from localStorage:', error);
      // Clear invalid data from localStorage
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  }, []);

  // Listen for storage changes (when user logs in/out in another tab)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user') {
        try {
          if (e.newValue && e.newValue.trim() !== '') {
            const userData = JSON.parse(e.newValue);
            console.log('User data updated from storage:', userData);
            setUserState(userData);
          } else {
            setUserState({});
          }
        } catch (error) {
          console.error('Error parsing user data from storage:', error);
          // Clear invalid data from localStorage
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          setUserState({});
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const setUser = (newUser: User) => {
    console.log('Setting user:', newUser);
    setUserState(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const updateUser = (updates: Partial<User>) => {
    const updatedUser = { ...user, ...updates };
    console.log('Updating user:', updatedUser);
    setUserState(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const clearUser = () => {
    console.log('Clearing user');
    setUserState({});
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const isLoggedIn = !!(user.email && localStorage.getItem('token'));

  const value: UserContextType = {
    user,
    setUser,
    updateUser,
    clearUser,
    isLoggedIn
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}; 