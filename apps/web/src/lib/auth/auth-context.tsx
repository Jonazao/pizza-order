'use client';

import { ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AuthResponse,
  UserProfile,
  getProfile,
  login as apiLogin,
  logout as apiLogout,
  register as apiRegister,
} from '@/lib/api/auth';

const TOKEN_KEY = 'token';

export const PROFILE_QUERY_KEY = ['auth', 'profile'] as const;

function readToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return localStorage.getItem(TOKEN_KEY);
}

interface AuthContextValue {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<AuthResponse>;
  register: (email: string, password: string, name: string) => Promise<AuthResponse>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [token, setToken] = useState<string | null>(() => readToken());

  // SSR renders with no token (localStorage is unavailable), so the initial client
  // render must match that neutral state until the component has mounted to avoid
  // hydration mismatches in components that branch on auth state.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const profileQuery = useQuery<UserProfile | null, Error>({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: getProfile,
    enabled: !!token,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  // Auto sign-out when the stored token is invalid or expired.
  useEffect(() => {
    if (profileQuery.isError) {
      setToken(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem(TOKEN_KEY);
      }
      queryClient.clear();
    }
  }, [profileQuery.isError, queryClient]);

  const login = useCallback(async (email: string, password: string): Promise<AuthResponse> => {
    const data = await apiLogin(email, password);
    setToken(data.accessToken);
    return data;
  }, []);

  const register = useCallback(async (email: string, password: string, name: string): Promise<AuthResponse> => {
    const data = await apiRegister(email, password, name);
    setToken(data.accessToken);
    return data;
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    setToken(null);
    queryClient.clear();
    await apiLogout();
  }, [queryClient]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: mounted && token ? (profileQuery.data ?? null) : null,
      isLoading: !mounted || (!!token && profileQuery.isLoading),
      isAuthenticated: mounted && !!token && !!profileQuery.data,
      login,
      register,
      logout,
    }),
    [mounted, token, profileQuery.data, profileQuery.isLoading, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
