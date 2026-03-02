/**
 * AuthContext - placeholder for future authentication
 * Keeps app ready for login/logout flow
 */

import React, { createContext, useContext, useState } from 'react';

interface AuthState {
  isAuthenticated: boolean;
  user: { id: string; name?: string } | null;
}

interface AuthContextValue extends AuthState {
  logout: () => void;
}

const defaultState: AuthState = {
  isAuthenticated: true, // Demo mode - no auth required
  user: { id: 'demo', name: 'Utilisateur' },
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(defaultState);

  const logout = () => {
    setState({ isAuthenticated: false, user: null });
    // Future: clear tokens, redirect to login
  };

  return (
    <AuthContext.Provider value={{ ...state, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
