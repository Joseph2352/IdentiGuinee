import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/axios';

interface User {
  id: string;
  email: string;
  role: 'CITOYEN' | 'ADMIN' | 'AGENT';
  prenom?: string;
  nom?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const savedToken = localStorage.getItem('identiguinee_token');
      
      if (!savedToken) {
        setLoading(false);
        return;
      }

      try {
        setToken(savedToken);
        const response = await api.get('/auth/me');
        if (response.data.success) {
          setUser(response.data.data.user);
          localStorage.setItem('identiguinee_user', JSON.stringify(response.data.data.user));
        }
      } catch (error) {
        console.error('Session verification failed:', error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    // Synchronisation inter-onglets
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'identiguinee_token') {
        if (!e.newValue) {
          setToken(null);
          setUser(null);
        } else {
          setToken(e.newValue);
          const savedUser = localStorage.getItem('identiguinee_user');
          if (savedUser) setUser(JSON.parse(savedUser));
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('identiguinee_token', newToken);
    localStorage.setItem('identiguinee_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('identiguinee_token');
    localStorage.removeItem('identiguinee_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
