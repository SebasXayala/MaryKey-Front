import { ApiError } from "@/lib/api/api-error";
import { endpoints } from "@/lib/api/endpoints";
import {
  DEMO_CREDENTIALS,
  categories,
  demoUser,
  products,
  tutorialTopics,
  tutorials,
} from "@/lib/api/mock/fixtures";
import type { Paginated } from "@/types/api";
import type { AuthSession, LoginPayload, RegisterPayload } from "@/types/auth";
import type { Product } from "@/types/catalog";
import type { Tutorial } from "@/types/tutorial";

/**
 * Backend simulado en memoria.
 *
 * NO es un mockup de UI: implementa el mismo contrato que consumirá el
 * backend real (mismas rutas, mismos tipos, mismos errores), para que al
 * conectar el API solo cambie `NEXT_PUBLIC_API_MOCKS=false`.
 *
 * Cuando el backend esté listo: borra `src/lib/api/mock/` y la rama de
 * mocks en `http.ts`. Nada más cambia.
 */

interface MockRequestInit {
  method: string;
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined | null>;
}

type MockQuery = NonNullable<MockRequestInit["query"]>;

const LATENCY_MS = 450;

const delay = (ms = LATENCY_MS) =>
  new Promise((resolve) => setTimeout(resolve, ms));

/** Usuarios registrados durante la sesión del navegador. */
const registeredUsers = new Map<string, { password: string; user: typeof demoUser }>([
  [DEMO_CREDENTIALS.email, { password: DEMO_CREDENTIALS.password, user: demoUser }],
]);

export async function mockRequest<T>(
  path: string,
  init: MockRequestInit,
): Promise<T> {
  await delay();

  const key = `${init.method.toUpperCase()} ${path}`;

  switch (key) {
    case `POST ${endpoints.auth.login}`:
      return handleLogin(init.body as LoginPayload) as T;

    case `POST ${endpoints.auth.register}`:
      return handleRegister(init.body as RegisterPayload) as T;

    case `POST ${endpoints.auth.logout}`:
      return null as T;

    case `POST ${endpoints.auth.forgotPassword}`:
      return { message: "Si el correo existe, enviamos las instrucciones." } as T;

    case `POST ${endpoints.auth.refresh}`:
      return {
        accessToken: createToken(demoUser.email),
        refreshToken: `mock_refresh_${demoUser.id}`,
        expiresIn: 3600,
      } as T;

    case `GET ${endpoints.catalog.categories}`:
      return categories as T;

    case `GET ${endpoints.catalog.products}`:
      return handleProducts(init.query ?? {}) as T;

    case `GET ${endpoints.tutorials.list}`:
      return handleTutorials(init.query ?? {}) as T;

    case `GET ${endpoints.tutorials.topics}`:
      return tutorialTopics as T;

    case `POST ${endpoints.newsletter.subscribe}`:
      return handleNewsletter(init.body as { email?: string }) as T;
  }

  // Detalle de categoría: /catalog/categories/:slug
  if (init.method === "GET" && path.startsWith(`${endpoints.catalog.categories}/`)) {
    const slug = path.split("/").pop();
    const category = categories.find((item) => item.slug === slug);
    if (!category) throw notFound("No encontramos esa categoría.");
    return category as T;
  }

  // Detalle de producto: /catalog/products/:slug
  if (init.method === "GET" && path.startsWith(`${endpoints.catalog.products}/`)) {
    const slug = path.split("/").pop();
    const product = products.find((item) => item.slug === slug);
    if (!product) throw notFound("No encontramos ese producto.");
    return product as T;
  }

  // Detalle de tutorial: /tutorials/:slug
  if (init.method === "GET" && path.startsWith(`${endpoints.tutorials.list}/`)) {
    const slug = path.split("/").pop();
    const tutorial = tutorials.find((item) => item.slug === slug);
    if (!tutorial) throw notFound("No encontramos ese tutorial.");
    return tutorial as T;
  }

  throw new ApiError({
    status: 404,
    code: "MOCK_ROUTE_NOT_FOUND",
    message: `Ruta no implementada en el backend simulado: ${key}`,
  });
}

function notFound(message: string) {
  return new ApiError({ status: 404, code: "NOT_FOUND", message });
}

function createToken(email: string) {
  return `mock_access_${btoa(email)}`;
}

function handleLogin(payload: LoginPayload): AuthSession {
  const record = registeredUsers.get(payload.email?.trim().toLowerCase() ?? "");

  if (!record || record.password !== payload.password) {
    throw new ApiError({
      status: 401,
      code: "INVALID_CREDENTIALS",
      message: "Correo o contraseña incorrectos.",
    });
  }

  return {
    accessToken: createToken(record.user.email),
    refreshToken: `mock_refresh_${record.user.id}`,
    expiresIn: 3600,
    user: record.user,
  };
}

function handleRegister(payload: RegisterPayload): AuthSession {
  const email = payload.email.trim().toLowerCase();

  if (registeredUsers.has(email)) {
    throw new ApiError({
      status: 409,
      code: "EMAIL_ALREADY_EXISTS",
      message: "Ya existe una cuenta con este correo.",
      fieldErrors: { email: "Este correo ya está registrado." },
    });
  }

  const user = {
    ...demoUser,
    id: `usr_${registeredUsers.size + 1002}`,
    email,
    firstName: payload.firstName,
    lastName: payload.lastName,
  };

  registeredUsers.set(email, { password: payload.password, user });

  return {
    accessToken: createToken(email),
    refreshToken: `mock_refresh_${user.id}`,
    expiresIn: 3600,
    user,
  };
}

/** Parámetros que no son atributos de producto. */
const RESERVED_PARAMS = new Set([
  "category",
  "search",
  "maxPrice",
  "featured",
  "page",
  "pageSize",
  "sort",
]);

function handleProducts(query: MockQuery): Paginated<Product> {
  const search = text(query.search)?.toLowerCase();
  let items = [...products];

  if (query.category) {
    items = items.filter((item) => item.categorySlug === query.category);
  }

  // Filtros dinámicos: cualquier otro parámetro se compara con los
  // atributos del producto (acabado, familia, tipoPiel, …).
  for (const [key, value] of Object.entries(query)) {
    if (RESERVED_PARAMS.has(key) || !value) continue;
    items = items.filter((item) => item.attributes?.[key] === String(value));
  }

  if (query.maxPrice) {
    items = items.filter((item) => item.price <= Number(query.maxPrice));
  }
  if (query.featured === true || query.featured === "true") {
    items = items.filter((item) => item.isFeatured);
  }
  if (search) {
    items = items.filter(
      (item) =>
        item.name.toLowerCase().includes(search) ||
        item.shortDescription.toLowerCase().includes(search),
    );
  }

  if (query.sort === "price_asc") items.sort((a, b) => a.price - b.price);
  if (query.sort === "price_desc") items.sort((a, b) => b.price - a.price);
  if (query.sort === "relevance") {
    items.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
  }

  return paginate(items, query);
}

function handleTutorials(query: MockQuery): Paginated<Tutorial> {
  const search = text(query.search)?.toLowerCase();
  let items = [...tutorials];

  if (query.category) {
    items = items.filter((item) => item.categorySlug === query.category);
  }
  if (query.featured === true || query.featured === "true") {
    items = items.filter((item) => item.isFeatured);
  }
  if (search) {
    items = items.filter(
      (item) =>
        item.title.toLowerCase().includes(search) ||
        item.excerpt.toLowerCase().includes(search),
    );
  }

  return paginate(items, query);
}

function handleNewsletter(body: { email?: string } | undefined) {
  const email = body?.email?.trim();

  if (!email || !email.includes("@")) {
    throw new ApiError({
      status: 422,
      code: "INVALID_EMAIL",
      message: "Ingresa un correo válido.",
      fieldErrors: { email: "Ingresa un correo válido." },
    });
  }

  return { message: "¡Listo! Revisa tu correo para confirmar la suscripción." };
}

function paginate<T>(items: T[], query: MockQuery): Paginated<T> {
  const page = Number(query.page ?? 1);
  const pageSize = Number(query.pageSize ?? 12);
  const start = (page - 1) * pageSize;

  return {
    items: items.slice(start, start + pageSize),
    page,
    pageSize,
    total: items.length,
    totalPages: Math.max(1, Math.ceil(items.length / pageSize)),
  };
}

function text(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}
