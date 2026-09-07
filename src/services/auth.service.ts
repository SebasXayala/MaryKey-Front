import { ApiError } from "@/lib/api/api-error";
import { endpoints } from "@/lib/api/endpoints";
import { http } from "@/lib/api/http";
import { sessionStore } from "@/lib/auth/session-store";
import { joinName, toUser, type BackendUser } from "@/services/backend-user";
import type {
  AuthSession,
  ForgotPasswordPayload,
  LoginPayload,
  RegisterPayload,
  SocialProvider,
  User,
} from "@/types/auth";

/**
 * Capa de dominio de autenticación.
 * La UI llama SOLO a estas funciones — nunca a `fetch` ni a rutas.
 *
 * Lo que el backend ofrece hoy y cómo se cubre la diferencia:
 *
 *   POST /auth/login     -> { access_token, ...usuario }  (sin la relación rol)
 *   POST /auth/register  -> { success, message, data }    (sin token)
 *   POST /auth/logout    -> revoca el token (lista negra)
 *   GET  /auth/profile   -> usuario del token
 *   GET  /roles          -> catálogo de roles (protegido con JWT)
 *
 * No existen /auth/refresh ni /auth/forgot-password.
 */

/** Respuesta literal de POST /auth/login: el token más el usuario. */
type BackendLoginResponse = Partial<BackendUser> & {
  access_token: string;
  /** Formato viejo del backend, cuando solo devolvía el correo. */
  Email?: string;
};

interface BackendRole {
  id: number;
  name: string;
}

/** Rol que se asigna a quien se registra desde la tienda. */
const DEFAULT_ROLE_NAME = "user";

/**
 * Id de rol para el registro público.
 *
 * `GET /roles` quedó detrás del guard JWT y quien se registra todavía no
 * tiene token, así que el id se puede fijar por configuración. Si no está
 * definida, igual se intenta consultar /roles (funciona si el backend lo
 * vuelve público o si ya hay sesión abierta).
 */
const CONFIGURED_ROLE_ID = Number(process.env.NEXT_PUBLIC_DEFAULT_ROLE_ID);

export const authService = {
  async login(payload: LoginPayload): Promise<AuthSession> {
    const email = payload.email.trim().toLowerCase();

    const { access_token, ...profile } = await http.post<BackendLoginResponse>(
      endpoints.auth.login,
      { email, password: payload.password },
      { auth: false },
    );

    return {
      accessToken: access_token,
      /**
       * A propósito sin `expiresIn`: el backend firma con expiresIn '1h' y
       * no expone /auth/refresh; si ese valor llegara a `sessionStore.save`
       * la cookie moriría junto con el token y la sesión se vería cerrada
       * sola. La cookie usa el tiempo por defecto del front (8 h, o 30 días
       * con "recordarme") y un 401 posterior cierra sesión limpiamente.
       */
      user: profile.id
        ? toUser(profile as BackendUser)
        : await findUserByEmail(email, access_token),
    };
  },

  /**
   * El backend no devuelve token al registrar, así que son dos pasos:
   * se crea el usuario y enseguida se inicia sesión con esas credenciales.
   */
  async register(payload: RegisterPayload): Promise<AuthSession> {
    const email = payload.email.trim().toLowerCase();

    await http.post<BackendUser>(
      endpoints.auth.register,
      {
        name: joinName(payload.firstName, payload.lastName),
        age: payload.age,
        gender: payload.gender,
        email,
        password: payload.password,
        role_id: await resolveDefaultRoleId(),
      },
      { auth: false },
    );

    return authService.login({ email, password: payload.password });
  },

  /**
   * Perfil del usuario autenticado: `GET /auth/profile` devuelve el usuario
   * dueño del token, y de paso confirma que el token sigue vivo (el backend
   * mantiene una lista negra tras el logout).
   */
  async me(): Promise<User> {
    const cached = sessionStore.getUser();
    const backendUser = await http.get<BackendUser>(endpoints.auth.profile);

    // El backend no carga la relación `roles` en ningún endpoint; se
    // conserva el rol ya conocido para no degradar a "customer" a un admin
    // en cada revalidación.
    return { ...toUser(backendUser), role: cached?.role ?? "customer" };
  },

  forgotPassword(payload: ForgotPasswordPayload) {
    // Sigue atendido por el backend simulado: el endpoint no existe todavía.
    return http.post<{ message: string }>(
      endpoints.auth.forgotPassword,
      { email: payload.email.trim().toLowerCase() },
      { auth: false },
    );
  },

  /**
   * Cierra sesión en el servidor: el token queda en la lista negra, así que
   * no sirve aunque alguien lo hubiera copiado. Si falla (token ya vencido,
   * backend caído) no importa: `AuthProvider` borra igual cookie y caché.
   */
  async logout(): Promise<null> {
    await http.post<unknown>(endpoints.auth.logout, undefined, {
      silentUnauthorized: true,
    });
    return null;
  },

  /**
   * OAuth. El backend debe exponer una URL de redirección por proveedor;
   * cuando esté definida, aquí solo se cambia la navegación.
   */
  socialAuthUrl(provider: SocialProvider, redirectTo = "/cuenta") {
    const base = process.env.NEXT_PUBLIC_API_URL ?? "";
    const params = new URLSearchParams({ redirect_uri: redirectTo });
    return `${base}${endpoints.auth.social(provider)}?${params.toString()}`;
  },
};

/**
 * Respaldo por si el login solo devuelve `{ access_token, Email }` (la
 * versión anterior del backend): el perfil se busca en el listado, usando
 * el token recién emitido porque /users ya exige autenticación.
 */
async function findUserByEmail(
  email: string,
  accessToken: string,
): Promise<User> {
  const users = await http.get<BackendUser[]>(endpoints.users.list, {
    auth: false,
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const match = users.find((user) => user.email?.trim().toLowerCase() === email);

  if (!match) {
    throw new ApiError({
      status: 500,
      code: "USER_NOT_FOUND_AFTER_LOGIN",
      message:
        "Iniciaste sesión, pero no pudimos cargar tu perfil. Intenta de nuevo.",
    });
  }

  return toUser(match);
}

/**
 * El registro exige `role_id` y el formulario no pide rol.
 *
 * Se prefiere NEXT_PUBLIC_DEFAULT_ROLE_ID (el caso normal hoy, porque
 * /roles pide token) y si no está, se consulta el catálogo de roles en vez
 * de dejar un id quemado que rompería si cambian los datos de la tabla.
 */
async function resolveDefaultRoleId(): Promise<number> {
  if (Number.isInteger(CONFIGURED_ROLE_ID) && CONFIGURED_ROLE_ID > 0) {
    return CONFIGURED_ROLE_ID;
  }

  let roles: BackendRole[] = [];

  try {
    roles = await http.get<BackendRole[]>(endpoints.roles.list, {
      silentUnauthorized: true,
    });
  } catch {
    throw new ApiError({
      status: 500,
      code: "ROLE_ID_NOT_CONFIGURED",
      message:
        "No pudimos completar el registro: el servidor no permite consultar los roles. " +
        "Define NEXT_PUBLIC_DEFAULT_ROLE_ID con el id del rol de cliente.",
    });
  }

  const role =
    roles.find((item) => item.name === DEFAULT_ROLE_NAME) ??
    roles.find((item) => item.name !== "admin") ??
    roles[0];

  if (!role) {
    throw new ApiError({
      status: 500,
      code: "NO_ROLES_AVAILABLE",
      message:
        "No pudimos completar el registro: el servidor no tiene roles configurados.",
    });
  }

  return role.id;
}
