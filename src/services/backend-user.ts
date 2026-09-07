import type { Gender, User } from "@/types/auth";

/**
 * Forma en la que el backend devuelve un usuario hoy.
 *
 * El modelo del servidor y el de la tienda no coinciden: el backend guarda
 * `name` (un solo campo, máx. 50), `age` y `gender`, mientras la UI trabaja
 * con `firstName` / `lastName`. La traducción vive aquí, en un único lugar,
 * para que el día que el backend acepte nombre y apellido por separado solo
 * haya que tocar este archivo.
 */
export interface BackendUser {
  id: number;
  name: string;
  age: number;
  gender?: Gender | null;
  email: string;
  /**
   * La relación se llama `roles` en la entidad (ManyToOne a Role). Solo
   * llega si el backend la cargó, y hoy ningún endpoint lo hace.
   */
  roles?: { id: number; name: string } | null;
  createdAt?: string;
  updatedAt?: string;
}

/** Largo máximo de `name` en el backend (@MaxLength(50) del DTO). */
export const NAME_MAX_LENGTH = 50;

/** "Valentina Ríos" -> { firstName: "Valentina", lastName: "Ríos" } */
export function splitName(name: string): {
  firstName: string;
  lastName: string;
} {
  const [firstName = "", ...rest] = (name ?? "").trim().split(/\s+/);
  return { firstName, lastName: rest.join(" ") };
}

/** Lo contrario: lo que se envía al backend al registrarse. */
export function joinName(firstName: string, lastName: string): string {
  return `${firstName.trim()} ${lastName.trim()}`.trim();
}

/**
 * Los roles del backend ('admin', 'user', …) no coinciden con la unión que
 * usa la UI. Además ningún endpoint carga la relación, así que en la
 * práctica casi siempre cae en "customer".
 */
function mapRole(name?: string | null): User["role"] {
  if (name === "admin") return "admin";
  if (name === "consultant" || name === "consultora") return "consultant";
  return "customer";
}

export function toUser(backendUser: BackendUser): User {
  const { firstName, lastName } = splitName(backendUser.name);

  return {
    id: String(backendUser.id),
    email: backendUser.email,
    firstName,
    lastName,
    gender: backendUser.gender ?? null,
    avatarUrl: null,
    role: mapRole(backendUser.roles?.name),
  };
}
