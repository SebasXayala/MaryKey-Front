import type { User } from "@/types/auth";

/**
 * Forma en la que el backend devuelve un usuario hoy.
 *
 * El modelo del servidor y el de la tienda no coinciden: el backend guarda
 * `username` (un solo campo, máx. 50) y `age`, mientras la UI trabaja con
 * `firstName` / `lastName`. La traducción vive aquí, en un único lugar, para
 * que el día que el backend acepte nombre y apellido por separado solo haya
 * que tocar este archivo.
 */
export interface BackendUser {
  id: number;
  username: string;
  age: number;
  email: string;
  /** Solo llega si el backend cargó la relación (hoy no lo hace en /users). */
  role?: { id: number; name: string } | null;
  createdAt?: string;
  updatedAt?: string;
}

/** Largo máximo de `username` en el backend (@MaxLength(30) del DTO). */
export const USERNAME_MAX_LENGTH = 30;

/** "Valentina Ríos" -> { firstName: "Valentina", lastName: "Ríos" } */
export function splitUsername(username: string): {
  firstName: string;
  lastName: string;
} {
  const [firstName = "", ...rest] = (username ?? "").trim().split(/\s+/);
  return { firstName, lastName: rest.join(" ") };
}

/** Lo contrario: lo que se envía al backend al registrarse. */
export function joinUsername(firstName: string, lastName: string): string {
  return `${firstName.trim()} ${lastName.trim()}`.trim();
}

/**
 * Los roles del backend ('admin', 'user', …) no coinciden con la unión que
 * usa la UI. Además `GET /users` no carga la relación `role`, así que en la
 * práctica casi siempre cae en "customer".
 */
function mapRole(name?: string | null): User["role"] {
  if (name === "admin") return "admin";
  if (name === "consultant" || name === "consultora") return "consultant";
  return "customer";
}

export function toUser(backendUser: BackendUser): User {
  const { firstName, lastName } = splitUsername(backendUser.username);

  return {
    id: String(backendUser.id),
    email: backendUser.email,
    firstName,
    lastName,
    avatarUrl: null,
    role: mapRole(backendUser.role?.name),
  };
}
