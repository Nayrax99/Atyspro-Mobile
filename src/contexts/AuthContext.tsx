/**
 * AuthContext - authentification réelle (token, login, signup, logout, fetchMe)
 */
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import * as authService from '@/src/services/auth.service';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: { id: string; email: string } | null;
  account: {
    id: string;
    name: string;
    onboarding_completed: boolean;
  } | null;
}

interface AuthContextValue extends AuthState {
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  signup: (
    email: string,
    password: string,
    businessName: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const defaultState: AuthState = {
  isAuthenticated: false,
  isLoading: true,
  user: null,
  account: null,
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(defaultState);

  const refreshAuth = useCallback(async () => {
    const token = await authService.getStoredToken();
    if (!token) {
      setState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        account: null,
      });
      return;
    }
    const result = await authService.fetchMe(token);
    if (result.success && result.user && result.account) {
      setState({
        isAuthenticated: true,
        isLoading: false,
        user: result.user,
        account: result.account,
      });
    } else {
      await authService.removeToken();
      setState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        account: null,
      });
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const token = await authService.getStoredToken();
      if (cancelled) return;
      if (!token) {
        setState((s) => ({ ...s, isLoading: false, isAuthenticated: false }));
        return;
      }
      const result = await authService.fetchMe(token);
      if (cancelled) return;
      if (result.success && result.user && result.account) {
        setState({
          isAuthenticated: true,
          isLoading: false,
          user: result.user,
          account: result.account,
        });
      } else {
        await authService.removeToken();
        setState({
          isAuthenticated: false,
          isLoading: false,
          user: null,
          account: null,
        });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(
    async (
      email: string,
      password: string
    ): Promise<{ success: boolean; error?: string }> => {
      const result = await authService.login(email, password);
      if (!result.success) {
        return { success: false, error: result.error };
      }
      if (result.token) {
        const me = await authService.fetchMe(result.token);
        if (me.success && me.user && me.account) {
          setState({
            isAuthenticated: true,
            isLoading: false,
            user: me.user,
            account: me.account,
          });
          return { success: true };
        }
      }
      return { success: false, error: 'Erreur lors de la récupération du profil' };
    },
    []
  );

  const signup = useCallback(
    async (
      email: string,
      password: string,
      businessName: string
    ): Promise<{ success: boolean; error?: string }> => {
      return authService.signup(email, password, businessName);
    },
    []
  );

  const logout = useCallback(async () => {
    await authService.logout();
    setState({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      account: null,
    });
  }, []);

  const value: AuthContextValue = {
    ...state,
    login,
    signup,
    logout,
    refreshAuth,
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
