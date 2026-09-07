import type { User } from "@/types/auth";

/**
 * Quién entra al panel de administración.
 *
 * Manda el rol que asigna el backend: entra quien tenga 'admin' en la tabla
 * `roles`. Tanto `POST /auth/login` como `GET /users/:id` cargan la relación
 * (`leftJoinAndSelect('user.roles')` y `relations: { roles: true }`), así que
 * el rol llega en la sesión y se revalida contra el servidor en cada `me()`.
 *
 * Esto es una barrera de interfaz, no de seguridad: evita mostrar el panel a
 * quien no lo administra, pero la barrera real la pone el backend, que hoy
 * solo exige un JWT válido para escribir en /products, /categories y /users.
 */
export function canAccessAdmin(user: User | null): boolean {
  return user?.role === "admin";
}
