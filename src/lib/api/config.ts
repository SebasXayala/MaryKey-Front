/**
 * Configuración única del acceso al backend.
 * Todo se controla por variables de entorno (ver .env.example).
 */
export const apiConfig = {
  /** Ej: https://api.marykay.com/v1 — sin slash final. */
  baseUrl: (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/+$/, ""),

  timeoutMs: Number(process.env.NEXT_PUBLIC_API_TIMEOUT ?? 15000),

  /**
   * Datos simulados mientras no exista backend.
   * Se apagan poniendo NEXT_PUBLIC_API_MOCKS=false (y definiendo la URL).
   */
  useMocks:
    (process.env.NEXT_PUBLIC_API_MOCKS ?? "true").toLowerCase() === "true",

  sessionCookie: process.env.NEXT_PUBLIC_SESSION_COOKIE ?? "mk_session",
} as const;

/** Cookie donde se guarda el refresh token. */
export const REFRESH_COOKIE = `${apiConfig.sessionCookie}_refresh`;

/** Clave de localStorage donde se cachea el usuario para el primer render. */
export const USER_STORAGE_KEY = "mk_user";

export function assertBackendConfigured(): void {
  if (!apiConfig.useMocks && !apiConfig.baseUrl) {
    throw new Error(
      "NEXT_PUBLIC_API_URL no está definida. Configúrala o activa NEXT_PUBLIC_API_MOCKS=true.",
    );
  }
}
