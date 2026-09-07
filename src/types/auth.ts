/** El backend solo acepta estos dos valores (@IsEnum del DTO). */
export type Gender = "female" | "male";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  /** El backend lo exige al crear la cuenta. */
  gender?: Gender | null;
  avatarUrl?: string | null;
  /** Cliente final o consultora de belleza. */
  role: "customer" | "consultant" | "admin";
}

export interface LoginPayload {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  /** El backend la exige (`@IsInt()` en su RegisterDto) para crear la cuenta. */
  age: number;
  /** También obligatorio en el RegisterDto del backend. */
  gender: Gender;
  email: string;
  password: string;
  acceptsTerms: boolean;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface AuthSession {
  accessToken: string;
  refreshToken?: string;
  /** Segundos de vida del access token. */
  expiresIn?: number;
  user: User;
}

export type SocialProvider = "google" | "apple";
