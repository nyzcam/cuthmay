"use client";

import React, { createContext, useContext } from 'react';
import type { AuthUser as AuthUserType } from '../types/auth';
import { useAuthMe } from '../hooks/useAuthMe';

interface AuthContextType {
  user: AuthUserType | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (provider: 'google' | 'github') => Promise<void>;
  logout: () => void;
  setUser: (user: AuthUserType | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoading, refresh, setUser } = useAuthMe();

  const login = async (provider: 'google' | 'github') => {
    // Keep legacy behavior: redirect to provider endpoint (may be disabled)
    window.location.href = `/api/auth/${provider}`;
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      // refresh local state
      refresh();
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
