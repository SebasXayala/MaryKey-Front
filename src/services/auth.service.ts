import { endpoints } from "@/lib/api/endpoints";
import { http } from "@/lib/api/http";
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
 */
export const authService = {
  login(payload: LoginPayload) {
    return http.post<AuthSession>(
      endpoints.auth.login,
      {
        email: payload.email.trim().toLowerCase(),
        password: payload.password,
      },
      { auth: false },
    );
  },

  register(payload: RegisterPayload) {
    return http.post<AuthSession>(
      endpoints.auth.register,
      {
        firstName: payload.firstName.trim(),
        lastName: payload.lastName.trim(),
        email: payload.email.trim().toLowerCase(),
        password: payload.password,
        acceptsTerms: payload.acceptsTerms,
      },
      { auth: false },
    );
  },

  forgotPassword(payload: ForgotPasswordPayload) {
    return http.post<{ message: string }>(
      endpoints.auth.forgotPassword,
      { email: payload.email.trim().toLowerCase() },
      { auth: false },
    );
  },

  /** Perfil del usuario autenticado (revalida la sesión contra el backend). */
  me() {
    return http.get<User>(endpoints.auth.me);
  },

  logout() {
    return http.post<null>(endpoints.auth.logout);
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
