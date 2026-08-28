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

    // --- Todavía no existen: las atiende el mock ---
    logout: "/auth/logout",
    refresh: "/auth/refresh",
    me: "/auth/me",
    forgotPassword: "/auth/forgot-password",
    resetPassword: "/auth/reset-password",
    social: (provider: string) => `/auth/oauth/${provider}`,
  },
  /** CRUD real de usuarios y roles (hoy sin autenticación en el backend). */
  users: {
    list: "/users",
    detail: (id: string | number) => `/users/${id}`,
  },
  roles: {
    list: "/roles",
  },
  catalog: {
    categories: "/catalog/categories",
    category: (slug: string) => `/catalog/categories/${slug}`,
    products: "/catalog/products",
    product: (slug: string) => `/catalog/products/${slug}`,
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
