import { ApiError, normalizeError } from "@/lib/api/api-error";
import { apiConfig } from "@/lib/api/config";
import { endpoints } from "@/lib/api/endpoints";
import { mockRequest } from "@/lib/api/mock/mock-server";
import { sessionStore } from "@/lib/auth/session-store";
import type { ApiEnvelope } from "@/types/api";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface RequestOptions {
  method?: HttpMethod;
  /** Se serializa a JSON automáticamente. */
  body?: unknown;
  /** Se convierte en query string; ignora `undefined` y `null`. */
  query?: Record<string, string | number | boolean | undefined | null>;
  headers?: Record<string, string>;
  /** Adjunta el Authorization header. Por defecto `true`. */
  auth?: boolean;
  signal?: AbortSignal;
  /** Reintento con refresh token ya usado (uso interno). */
  _retried?: boolean;
}

/** Evento global: la sesión dejó de ser válida. Lo escucha AuthProvider. */
export const UNAUTHORIZED_EVENT = "mk:unauthorized";

function buildUrl(path: string, query?: RequestOptions["query"]): string {
  const url = `${apiConfig.baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
  if (!query) return url;

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== "") {
      params.append(key, String(value));
    }
  }
  const qs = params.toString();
  return qs ? `${url}?${qs}` : url;
}

/**
 * Desenvuelve la respuesta. Acepta `{ data: T }` o `T` plano, para no
 * quedar amarrados a una convención antes de conocer el backend.
 */
function unwrap<T>(payload: unknown): T {
  if (
    payload &&
    typeof payload === "object" &&
    "data" in payload &&
    Object.keys(payload).every((key) =>
      ["data", "message", "success", "meta"].includes(key),
    )
  ) {
    return (payload as ApiEnvelope<T>).data;
  }
  return payload as T;
}

async function parseBody(response: Response): Promise<unknown> {
  if (response.status === 204) return null;
  const contentType = response.headers.get("content-type") ?? "";
  try {
    if (contentType.includes("application/json")) return await response.json();
    const text = await response.text();
    return text ? { message: text } : null;
  } catch {
    return null;
  }
}

/**
 * Punto único de salida hacia el backend.
 * Cualquier cosa que la app necesite del servidor pasa por aquí.
 */
export async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = "GET", body, query, headers = {}, auth = true } = options;

  // Modo sin backend: mismos tipos, mismas firmas, datos simulados.
  if (apiConfig.useMocks) {
    return mockRequest<T>(path, { method, body, query });
  }

  if (!apiConfig.baseUrl) {
    throw new ApiError({
      status: 0,
      code: "MISSING_API_URL",
      message:
        "Falta configurar NEXT_PUBLIC_API_URL (o activa NEXT_PUBLIC_API_MOCKS=true).",
    });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), apiConfig.timeoutMs);
  options.signal?.addEventListener("abort", () => controller.abort());

  const finalHeaders: Record<string, string> = {
    Accept: "application/json",
    ...headers,
  };
  if (body !== undefined && !(body instanceof FormData)) {
    finalHeaders["Content-Type"] = "application/json";
  }
  if (auth) {
    const token = sessionStore.getAccessToken();
    if (token) finalHeaders.Authorization = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(buildUrl(path, query), {
      method,
      headers: finalHeaders,
      body:
        body === undefined
          ? undefined
          : body instanceof FormData
            ? body
            : JSON.stringify(body),
      signal: controller.signal,
      cache: "no-store",
    });
  } catch (error) {
    clearTimeout(timeout);
    const aborted = error instanceof DOMException && error.name === "AbortError";
    throw new ApiError({
      status: 0,
      code: aborted ? "TIMEOUT" : "NETWORK_ERROR",
      message: aborted
        ? "El servidor tardó demasiado en responder."
        : "No pudimos conectarnos con el servidor.",
    });
  } finally {
    clearTimeout(timeout);
  }

  const payload = await parseBody(response);

  if (!response.ok) {
    // Access token vencido: se intenta refrescar una sola vez.
    if (response.status === 401 && auth && !options._retried) {
      const refreshed = await tryRefreshSession();
      if (refreshed) {
        return request<T>(path, { ...options, _retried: true });
      }
      sessionStore.clear();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent(UNAUTHORIZED_EVENT));
      }
    }
    throw normalizeError(response.status, payload);
  }

  return unwrap<T>(payload);
}

let refreshInFlight: Promise<boolean> | null = null;

/** Un solo refresh a la vez aunque fallen varias peticiones en paralelo. */
async function tryRefreshSession(): Promise<boolean> {
  const refreshToken = sessionStore.getRefreshToken();
  if (!refreshToken) return false;

  refreshInFlight ??= (async () => {
    try {
      const session = await request<{
        accessToken: string;
        refreshToken?: string;
        expiresIn?: number;
      }>(endpoints.auth.refresh, {
        method: "POST",
        body: { refreshToken },
        auth: false,
        _retried: true,
      });

      const user = sessionStore.getUser();
      if (!user) return false;

      sessionStore.save({ ...session, user });
      return true;
    } catch {
      return false;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

export const http = {
  get: <T>(path: string, options?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(path, { ...options, method: "GET" }),

  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "POST", body }),

  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "PUT", body }),

  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "PATCH", body }),

  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "DELETE" }),
};
