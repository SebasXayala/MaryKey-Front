import { ApiError } from "@/lib/api/api-error";
import { endpoints } from "@/lib/api/endpoints";
import { http } from "@/lib/api/http";
import { sessionStore } from "@/lib/auth/session-store";
import {
  joinUsername,
  toUser,
  type BackendUser,
} from "@/services/backend-user";
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
 *   POST /auth/login     -> { access_token, Email }   (sin datos del usuario)
 *   POST /auth/register  -> el usuario creado          (sin token)
 *   GET  /users          -> lista completa, sin password
 *   GET  /roles          -> catálogo de roles
 *
 * No existen /auth/me, /auth/logout, /auth/refresh ni /auth/forgot-password.
 */

/** Respuesta literal de POST /auth/login. */
interface BackendLoginResponse {
  access_token: string;
  Email: string;
}

interface BackendRole {
  id: number;
  name: string;
}

/** Rol que se asigna a quien se registra desde la tienda. */
const DEFAULT_ROLE_NAME = "user";

export const authService = {
  async login(payload: LoginPayload): Promise<AuthSession> {
    const email = payload.email.trim().toLowerCase();

    const { access_token } = await http.post<BackendLoginResponse>(
      endpoints.auth.login,
      { email, password: payload.password },
      { auth: false },
    );

    return {
      accessToken: access_token,
      /**
       * A propósito sin `expiresIn`: el backend firma los tokens con
       * expiresIn '60s', y si ese valor llegara a `sessionStore.save` la
       * cookie moriría en un minuto y la sesión se vería cerrada sola. Se
       * deja que la cookie use el tiempo por defecto del front (8 h, o 30
       * días con "recordarme"). Hoy no molesta porque ningún endpoint del
       * backend está protegido; cuando lo estén, el backend tendrá que
       * subir la expiración y exponer /auth/refresh.
       */
      user: await findUserByEmail(email),
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
        username: joinUsername(payload.firstName, payload.lastName),
        age: payload.age,
        email,
        password: payload.password,
        role_id: await resolveDefaultRoleId(),
      },
      { auth: false },
    );

    return authService.login({ email, password: payload.password });
  },

  /**
   * Perfil del usuario autenticado.
   *
   * No hay /auth/me, así que se relee el usuario por su id con el CRUD.
   * Sirve igual para el propósito original: revalidar contra el servidor
   * que la cuenta sigue existiendo.
   */
  async me(): Promise<User> {
    const cached = sessionStore.getUser();

    if (!cached?.id) {
      throw new ApiError({
        status: 401,
        code: "NO_SESSION",
        message: "Tu sesión no está disponible. Inicia sesión de nuevo.",
      });
    }

    const backendUser = await http.get<BackendUser>(
      endpoints.users.detail(cached.id),
    );

    // El CRUD no carga la relación `role`; se conserva el que ya se conocía
    // para no degradar a "customer" a un admin en cada revalidación.
    return { ...toUser(backendUser), role: cached.role };
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
   * El backend no expone /auth/logout ni mantiene estado de sesión, así que
   * cerrar sesión es puramente local: `AuthProvider` borra cookie y caché.
   */
  logout(): Promise<null> {
    return Promise.resolve(null);
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
 * `POST /auth/login` solo devuelve el token y el correo, y no hay endpoint
 * para "el usuario actual", así que el perfil se busca en el listado.
 *
 * Es una consulta de más por login; se acepta porque es la única forma de
 * conocer el id, que la app necesita para todo lo demás. Desaparece en
 * cuanto el login devuelva el usuario o exista /auth/me.
 */
async function findUserByEmail(email: string): Promise<User> {
  const users = await http.get<BackendUser[]>(endpoints.users.list, {
    auth: false,
  });

  const match = users.find(
    (user) => user.email?.trim().toLowerCase() === email,
  );

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
 * El registro exige `role_id` y el formulario no pide rol, así que se
 * resuelve el rol de cliente contra /roles en vez de dejar un id quemado
 * que rompería si cambian los datos de la tabla.
 */
async function resolveDefaultRoleId(): Promise<number> {
  const roles = await http.get<BackendRole[]>(endpoints.roles.list, {
    auth: false,
  });

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
