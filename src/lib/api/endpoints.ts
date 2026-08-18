/**
 * Mapa de rutas del backend.
 *
 * Es lo ÚNICO que hay que reescribir cuando llegue la documentación real
 * del API: los servicios y la UI no conocen ninguna URL.
 */
export const endpoints = {
  auth: {
    login: "/auth/login",
    register: "/auth/register",
    logout: "/auth/logout",
    refresh: "/auth/refresh",
    me: "/auth/me",
    forgotPassword: "/auth/forgot-password",
    resetPassword: "/auth/reset-password",
    social: (provider: string) => `/auth/oauth/${provider}`,
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
