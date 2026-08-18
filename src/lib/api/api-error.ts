import type { ApiErrorPayload } from "@/types/api";

/**
 * Error único que emite toda la capa de red.
 * La UI nunca ve un error crudo de `fetch`.
 */
export class ApiError extends Error implements ApiErrorPayload {
  readonly status: number;
  readonly code: string;
  readonly fieldErrors?: Record<string, string>;

  constructor(payload: ApiErrorPayload) {
    super(payload.message);
    this.name = "ApiError";
    this.status = payload.status;
    this.code = payload.code;
    this.fieldErrors = payload.fieldErrors;
  }

  get isNetworkError() {
    return this.status === 0;
  }

  get isUnauthorized() {
    return this.status === 401;
  }

  get isValidationError() {
    return this.status === 422 || this.status === 400;
  }
}

const DEFAULT_MESSAGES: Record<number, string> = {
  0: "No pudimos conectarnos. Revisa tu conexión e intenta de nuevo.",
  400: "La información enviada no es válida.",
  401: "Tu correo o contraseña no son correctos.",
  403: "No tienes permisos para realizar esta acción.",
  404: "No encontramos lo que buscabas.",
  409: "Ese registro ya existe.",
  422: "Revisa los campos marcados.",
  429: "Demasiados intentos. Espera un momento e intenta de nuevo.",
  500: "Tuvimos un problema en el servidor. Intenta más tarde.",
};

/**
 * Traduce el cuerpo de error del backend a nuestra forma normalizada.
 * Soporta las convenciones más frecuentes; ajusta aquí cuando llegue
 * el contrato real.
 */
export function normalizeError(status: number, body: unknown): ApiError {
  const raw = (body ?? {}) as Record<string, unknown>;
  const nested = (raw.error ?? {}) as Record<string, unknown>;

  const message =
    pickString(raw.message) ??
    pickString(nested.message) ??
    pickString(raw.detail) ??
    DEFAULT_MESSAGES[status] ??
    "Ocurrió un error inesperado.";

  const code =
    pickString(raw.code) ??
    pickString(nested.code) ??
    (status === 0 ? "NETWORK_ERROR" : `HTTP_${status}`);

  return new ApiError({
    status,
    code,
    message,
    fieldErrors: parseFieldErrors(raw.errors ?? raw.fieldErrors ?? nested.errors),
  });
}

function pickString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

/** Acepta `{campo: "msg"}` y `{campo: ["msg", ...]}`. */
function parseFieldErrors(value: unknown): Record<string, string> | undefined {
  if (!value || typeof value !== "object") return undefined;

  const result: Record<string, string> = {};
  for (const [field, detail] of Object.entries(value as Record<string, unknown>)) {
    if (typeof detail === "string") result[field] = detail;
    else if (Array.isArray(detail) && typeof detail[0] === "string") {
      result[field] = detail[0];
    }
  }
  return Object.keys(result).length ? result : undefined;
}

/** Mensaje seguro para pintar en pantalla venga de donde venga el error. */
export function toDisplayMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error && error.message) return error.message;
  return "Ocurrió un error inesperado.";
}
