import type { User } from "@/types/auth";

/**
 * Quién entra al panel de administración.
 *
 * Entra quien tenga el rol 'admin' en el backend (login y `GET /users/:id`
 * ya devuelven la relación `roles`). La lista blanca de correos
 * (NEXT_PUBLIC_ADMIN_EMAILS) sirve para dar acceso a cuentas que todavía no
 * tienen ese rol asignado en la base.
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
