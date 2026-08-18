/**
 * Contratos genéricos de transporte.
 *
 * El backend todavía no está definido, así que la app acepta las dos
 * convenciones más comunes y las normaliza en un solo lugar (`unwrap`):
 *
 *   1. Respuesta plana:      { "id": 1, "nombre": "..." }
 *   2. Respuesta envuelta:   { "data": { ... }, "message": "ok" }
 *
 * Si el backend define otra convención, se ajusta SOLO en `src/lib/api/http.ts`.
 */

export interface ApiEnvelope<T> {
  data: T;
  message?: string;
  success?: boolean;
}

export interface Paginated<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

/** Forma normalizada de cualquier error que llegue del backend. */
export interface ApiErrorPayload {
  /** Código HTTP, 0 si fue error de red o timeout. */
  status: number;
  /** Código de negocio del backend, ej. "INVALID_CREDENTIALS". */
  code: string;
  /** Mensaje listo para mostrar al usuario. */
  message: string;
  /** Errores por campo, para pintarlos en el formulario. */
  fieldErrors?: Record<string, string>;
}
