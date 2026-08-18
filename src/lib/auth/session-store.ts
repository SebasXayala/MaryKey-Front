import { REFRESH_COOKIE, USER_STORAGE_KEY, apiConfig } from "@/lib/api/config";
import type { AuthSession, User } from "@/types/auth";

/**
 * Persistencia de la sesión en el navegador.
 *
 * Se usa cookie (no localStorage) para el access token porque el
 * `middleware` de Next necesita leerla en el servidor y así proteger
 * rutas antes de renderizar.
 *
 * Nota de seguridad: la cookie no es httpOnly porque el token se envía
 * desde el cliente. Si el backend puede emitir cookies httpOnly propias,
 * cambia `attachAuthHeader` en `http.ts` por `credentials: "include"` y
 * borra este archivo.
 */

const isBrowser = () => typeof document !== "undefined";

function writeCookie(name: string, value: string, maxAgeSeconds: number) {
  if (!isBrowser()) return;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax${secure}`;
}

function readCookie(name: string): string | null {
  if (!isBrowser()) return null;
  const match = document.cookie.match(
    new RegExp(`(?:^|;\\s*)${name}=([^;]*)`),
  );
  return match ? decodeURIComponent(match[1]) : null;
}

function deleteCookie(name: string) {
  if (!isBrowser()) return;
  document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax`;
}

const DEFAULT_MAX_AGE = 60 * 60 * 8; // 8 h
const REMEMBER_MAX_AGE = 60 * 60 * 24 * 30; // 30 días

export const sessionStore = {
  save(session: AuthSession, rememberMe = false) {
    const maxAge = rememberMe
      ? REMEMBER_MAX_AGE
      : (session.expiresIn ?? DEFAULT_MAX_AGE);

    writeCookie(apiConfig.sessionCookie, session.accessToken, maxAge);
    if (session.refreshToken) {
      writeCookie(REFRESH_COOKIE, session.refreshToken, REMEMBER_MAX_AGE);
    }
    if (isBrowser()) {
      window.localStorage.setItem(
        USER_STORAGE_KEY,
        JSON.stringify(session.user),
      );
    }
  },

  getAccessToken(): string | null {
    return readCookie(apiConfig.sessionCookie);
  },

  getRefreshToken(): string | null {
    return readCookie(REFRESH_COOKIE);
  },

  getUser(): User | null {
    if (!isBrowser()) return null;
    const raw = window.localStorage.getItem(USER_STORAGE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  },

  setUser(user: User) {
    if (!isBrowser()) return;
    window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  },

  clear() {
    deleteCookie(apiConfig.sessionCookie);
    deleteCookie(REFRESH_COOKIE);
    if (isBrowser()) window.localStorage.removeItem(USER_STORAGE_KEY);
  },
};
