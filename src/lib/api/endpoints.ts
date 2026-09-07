/**
 * Mapa de rutas del backend.
 *
 * Es lo ÚNICO que hay que reescribir cuando cambie la documentación del
 * API: los servicios y la UI no conocen ninguna URL.
 *
 * Ojo: que una ruta esté listada aquí no significa que exista en el
 * servidor. Cuáles están implementadas se declara en `backend-coverage.ts`;
 * las demás las sigue atendiendo el backend simulado.
 */
export const endpoints = {
  auth: {
    // --- Implementadas en el backend ---
    login: "/auth/login",
    register: "/auth/register",
    /** Revoca el token (lista negra en el servidor). Requiere Bearer. */
    logout: "/auth/logout",
    /** Equivalente a /auth/me: devuelve el usuario del token. */
    profile: "/auth/profile",

    // --- Todavía no existen: las atiende el mock ---
    refresh: "/auth/refresh",
    forgotPassword: "/auth/forgot-password",
    resetPassword: "/auth/reset-password",
    social: (provider: string) => `/auth/oauth/${provider}`,
  },
  /** CRUD real de usuarios y roles (protegido con JWT, salvo POST /users). */
  users: {
    list: "/users",
    detail: (id: string | number) => `/users/${id}`,
  },
  roles: {
    list: "/roles",
  },
  /**
   * Catálogo real del backend. Son CRUD por id numérico: la tienda navega
   * por slug, así que la traducción slug <-> id vive en
   * `src/services/backend-catalog.ts`.
   */
  catalog: {
    categories: "/categories",
    category: (id: string | number) => `/categories/${id}`,
    products: "/products",
    product: (id: string | number) => `/products/${id}`,
  },
  tutorials: {
    list: "/tutorials",
    topics: "/tutorials/topics",
    tutorial: (slug: string) => `/tutorials/${slug}`,
  },
  newsletter: {
    subscribe: "/newsletter/subscribe",
  },
} as const;
