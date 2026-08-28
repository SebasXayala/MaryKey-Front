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
 * Mensajes que el backend devuelve en inglés y sin código de negocio.
 * Se traducen aquí para no mostrárselos crudos a la clienta; el día que el
 * backend mande un `code`, este mapa deja de usarse solo.
 */
const BACKEND_MESSAGES: Record<
  string,
  { code: string; message: string; fieldErrors?: Record<string, string> }
> = {
  "Invalid credentials": {
    code: "INVALID_CREDENTIALS",
    message: "Correo o contraseña incorrectos.",
  },
  "User already exists": {
    code: "EMAIL_ALREADY_EXISTS",
    message: "Ya existe una cuenta con este correo.",
    fieldErrors: { email: "Este correo ya está registrado." },
  },
  "Email already exists": {
    code: "EMAIL_ALREADY_EXISTS",
    message: "Ya existe una cuenta con este correo.",
    fieldErrors: { email: "Este correo ya está registrado." },
  },
};

/**
 * Traduce el cuerpo de error del backend a nuestra forma normalizada.
 * Soporta las convenciones más frecuentes; ajusta aquí cuando llegue
 * el contrato real.
 */
export function normalizeError(status: number, body: unknown): ApiError {
  const raw = (body ?? {}) as Record<string, unknown>;
  const nested = (raw.error ?? {}) as Record<string, unknown>;

  // Nest con ValidationPipe responde { message: ["email must be an email", …] }.
  const validation = parseNestValidation(raw.message);
  const known = pickString(raw.message)
    ? BACKEND_MESSAGES[pickString(raw.message) as string]
    : undefined;

  const message =
    known?.message ??
    pickString(raw.message) ??
    validation?.message ??
    pickString(nested.message) ??
    pickString(raw.detail) ??
    DEFAULT_MESSAGES[status] ??
    "Ocurrió un error inesperado.";

  const code =
    pickString(raw.code) ??
    pickString(nested.code) ??
    known?.code ??
    (validation ? "VALIDATION_ERROR" : undefined) ??
    (status === 0 ? "NETWORK_ERROR" : `HTTP_${status}`);

  return new ApiError({
    status,
    code,
    message,
    fieldErrors:
      parseFieldErrors(raw.errors ?? raw.fieldErrors ?? nested.errors) ??
      validation?.fieldErrors ??
      known?.fieldErrors,
  });
}

/**
 * Convierte el array de class-validator en errores por campo.
 * Cada mensaje empieza por el nombre de la propiedad ("age must be an
 * integer number"), así que la primera palabra basta para ubicarlo.
 */
function parseNestValidation(
  value: unknown,
): { message: string; fieldErrors: Record<string, string> } | undefined {
  if (!Array.isArray(value) || !value.length) return undefined;

  const messages = value.filter(
    (item): item is string => typeof item === "string" && Boolean(item.trim()),
  );
  if (!messages.length) return undefined;

  const fieldErrors: Record<string, string> = {};
  for (const item of messages) {
    const field = item.split(" ")[0];
    // "property firstName should not exist" -> el campo es la 2ª palabra.
    const key = field === "property" ? item.split(" ")[1] : field;
    if (key && !fieldErrors[key]) fieldErrors[key] = item;
  }

  return { message: messages[0], fieldErrors };
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
