/**
 * Qué partes del backend existen HOY (rama `dev` del repo MaryKey-Back).
 *
 * Ya están conectados auth, usuarios, roles y el catálogo (categorías y
 * productos). Siguen simulados tutoriales, newsletter y recuperación de
 * contraseña. En vez de apagar los mocks de golpe —lo que dejaría media
 * tienda en 404— cada ruta se decide por separado.
 *
 * Al conectar un endpoint nuevo en el backend, basta agregarlo aquí.
 *
 * Rutas reales disponibles (prefijo /api/v1):
 *   POST   /auth/login      -> { access_token, ...usuario }   (público)
 *   POST   /auth/register    -> { success, message, data }     (público)
 *   POST   /auth/logout      -> revoca el token               (JWT)
 *   POST   /users            -> crea usuario                  (público)
 *   GET|PATCH|DELETE /users  -> CRUD                          (JWT)
 *   GET|POST|PATCH|DELETE /roles       -> CRUD                (JWT)
 *   GET|POST|PATCH|DELETE /categories  -> CRUD                (JWT)
 *   GET|POST|PATCH|DELETE /products    -> CRUD                (JWT)
 */
const IMPLEMENTED_PREFIXES = [
  "/auth/login",
  "/auth/register",
  "/auth/logout",
  "/users",
  "/roles",
  "/categories",
  "/products",
] as const;

/** `true` si esa ruta la atiende el backend real. */
export function isImplementedByBackend(path: string): boolean {
  return IMPLEMENTED_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  );
}
