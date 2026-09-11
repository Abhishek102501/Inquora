"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import * as authApi from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { clearToken, getToken, setToken } from "@/lib/api/token";

export interface CurrentUser {
  id: string;
  email: string;
  name: string;
}

interface AuthContextValue {
  user: CurrentUser | null;
  /** True only while the initial session (token → /auth/me) is being resolved. */
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, name: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const hydrateFromToken = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setIsLoading(false);
      return;
    }
    try {
      const backendUser = await authApi.getCurrentUser();
      setUser({ id: backendUser.id, email: backendUser.email, name: backendUser.name });
    } catch {
      // Expired/invalid token — sign the user out silently rather than
      // leaving them in a half-authenticated state.
      clearToken();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reading localStorage and validating the token against the backend is only possible after mount
    hydrateFromToken();
  }, [hydrateFromToken]);

  const login = useCallback(async (email: string, password: string) => {
    const { access_token } = await authApi.login(email, password);
    setToken(access_token);
    const backendUser = await authApi.getCurrentUser();
    setUser({ id: backendUser.id, email: backendUser.email, name: backendUser.name });
  }, []);

  const register = useCallback(async (email: string, name: string, password: string) => {
    const { access_token } = await authApi.register(email, name, password);
    setToken(access_token);
    const backendUser = await authApi.getCurrentUser();
    setUser({ id: backendUser.id, email: backendUser.email, name: backendUser.name });
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}

export function isAuthError(err: unknown): err is ApiError {
  return err instanceof ApiError;
}
