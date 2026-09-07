/**
 * Configuración única del acceso al backend.
 * Todo se controla por variables de entorno (ver .env.example).
 */
export const apiConfig = {
  /**
   * Base de las peticiones, sin slash final.
   *
   * Hoy es una ruta relativa ("/api/backend") que el rewrite de
   * `next.config.ts` reenvía al Nest: así el navegador ve mismo origen y
   * no choca con la falta de CORS en el backend. También acepta una URL
   * absoluta (ej. https://api.marykay.com/v1) el día que haya CORS.
   */
  baseUrl: (process.env.NEXT_PUBLIC_API_URL ?? "/api/backend").replace(
    /\/+$/,
    "",
  ),

  timeoutMs: Number(process.env.NEXT_PUBLIC_API_TIMEOUT ?? 15000),

  /**
   * Simula SOLO lo que el backend todavía no implementa (ver
   * `backend-coverage.ts`): auth, usuarios, roles y catálogo ya salen al
   * servidor real. También sirve de red de seguridad para el catálogo
   * mientras `/categories` y `/products` sigan detrás del guard JWT.
   * Con NEXT_PUBLIC_API_MOCKS=false todo va al backend, sin excepciones.
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
