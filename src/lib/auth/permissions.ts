import type { User } from "@/types/auth";

/**
 * Quién entra al panel de administración.
 *
 * El backend todavía no distingue roles: ningún endpoint carga la relación
 * `roles`, así que `user.role` casi siempre llega como "customer" aunque la
 * cuenta sea de administradora. Mientras tanto la lista blanca de correos
 * (NEXT_PUBLIC_ADMIN_EMAILS) permite cerrar el panel sin esperar al API.
 *
 * Si la variable está vacía, el panel queda abierto a cualquier sesión
 * iniciada: es un entorno de desarrollo, no una barrera de seguridad. La
 * barrera real la pone el backend, que hoy solo exige un JWT válido para
 * escribir en /products, /categories y /users.
 */
const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

/** `true` si el panel no tiene lista blanca configurada. */
export const IS_ADMIN_OPEN = ADMIN_EMAILS.length === 0;

export function canAccessAdmin(user: User | null): boolean {
  if (!user) return false;
  if (user.role === "admin") return true;
  if (IS_ADMIN_OPEN) return true;
  return ADMIN_EMAILS.includes(user.email.trim().toLowerCase());
}
