import { z } from "zod";

/**
 * Validación en cliente. El backend valida de nuevo: cuando devuelva
 * `fieldErrors`, los formularios los pintan sobre estos mismos campos.
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Ingresa tu correo electrónico.")
    .email("Ingresa un correo válido."),
  password: z.string().min(1, "Ingresa tu contraseña."),
  rememberMe: z.boolean().optional(),
});

export const registerSchema = z
  .object({
    firstName: z.string().min(2, "Ingresa tu nombre."),
    lastName: z.string().min(2, "Ingresa tu apellido."),
    email: z.string().min(1, "Ingresa tu correo.").email("Correo no válido."),
    password: z
      .string()
      .min(8, "Mínimo 8 caracteres.")
      .regex(/[A-Z]/, "Debe incluir al menos una mayúscula.")
      .regex(/[0-9]/, "Debe incluir al menos un número."),
    confirmPassword: z.string(),
    acceptsTerms: z.literal(true, {
      errorMap: () => ({ message: "Debes aceptar los términos." }),
    }),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Las contraseñas no coinciden.",
  });

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Ingresa tu correo.").email("Correo no válido."),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
