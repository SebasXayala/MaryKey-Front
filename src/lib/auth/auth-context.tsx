"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { UNAUTHORIZED_EVENT } from "@/lib/api/http";
import { sessionStore } from "@/lib/auth/session-store";
import { authService } from "@/services/auth.service";
import type { LoginPayload, RegisterPayload, User } from "@/types/auth";

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  /** `true` mientras se hidrata la sesión guardada en el navegador. */
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<User>;
  register: (payload: RegisterPayload) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Hidratación: recupera la sesión persistida y la valida contra el backend.
  useEffect(() => {
    const token = sessionStore.getAccessToken();
    const cachedUser = sessionStore.getUser();

    if (!token || !cachedUser) {
      sessionStore.clear();
      setIsLoading(false);
      return;
    }

    setUser(cachedUser);
    setIsLoading(false);

    authService
      .me()
      .then((fresh) => {
        setUser(fresh);
        sessionStore.setUser(fresh);
      })
      .catch(() => {
        // El interceptor de `http.ts` ya limpia la sesión si fue 401.
      });
  }, []);

  // La sesión expiró en cualquier petición: se cierra y se vuelve al login.
  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null);
      sessionStore.clear();
      router.replace("/login");
    };

    window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
    return () =>
      window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
  }, [router]);

  const login = useCallback(async (payload: LoginPayload) => {
    const session = await authService.login(payload);
    sessionStore.save(session, payload.rememberMe);
    setUser(session.user);
    return session.user;
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    const session = await authService.register(payload);
    sessionStore.save(session);
    setUser(session.user);
    return session.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // Aunque el backend falle, la sesión local siempre se cierra.
    } finally {
      sessionStore.clear();
      setUser(null);
      router.replace("/login");
    }
  }, [router]);

  const refreshUser = useCallback(async () => {
    const fresh = await authService.me();
    setUser(fresh);
    sessionStore.setUser(fresh);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      login,
      register,
      logout,
      refreshUser,
    }),
    [user, isLoading, login, register, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de <AuthProvider>.");
  }
  return context;
}
