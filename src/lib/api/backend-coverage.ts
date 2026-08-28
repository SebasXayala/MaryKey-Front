/**
 * Qué partes del backend existen HOY (rama `dev` del repo MaryKey-Back).
 *
 * El backend va por delante en auth y usuarios, pero todavía no tiene
 * catálogo, tutoriales ni newsletter. En vez de apagar los mocks de golpe
 * —lo que dejaría media tienda en 404— cada ruta se decide por separado:
 * lo que ya existe va contra el servidor real y el resto sigue simulado.
 *
 * Al conectar un endpoint nuevo en el backend, basta agregarlo aquí.
 *
 * Rutas reales disponibles:
 *   POST /auth/login       -> { access_token, Email }
 *   POST /auth/register    -> usuario creado (sin token)
 *   GET|POST|PATCH|DELETE /users  (sin guard)
 *   GET|POST|PATCH|DELETE /roles  (sin guard)
 */
const IMPLEMENTED_PREFIXES = [
  "/auth/login",
  "/auth/register",
  "/users",
  "/roles",
] as const;

/** `true` si esa ruta la atiende el backend real. */
export function isImplementedByBackend(path: string): boolean {
  return IMPLEMENTED_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  );
}
