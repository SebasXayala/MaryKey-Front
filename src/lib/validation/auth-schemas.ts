import { z } from "zod";

import { USERNAME_MAX_LENGTH } from "@/services/backend-user";

/**
 * Validación en cliente. El backend valida de nuevo: cuando devuelva
 * `fieldErrors`, los formularios los pintan sobre estos mismos campos.
 *
 * Los topes replican los `@MaxLength` de los DTOs del backend, para que el
 * usuario vea un mensaje claro en el formulario en lugar de un 400 del
 * servidor con el texto en inglés.
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Ingresa tu correo electrónico.")
    .email("Ingresa un correo válido.")
    .max(50, "El correo no puede superar los 50 caracteres."),
  password: z.string().min(1, "Ingresa tu contraseña."),
  rememberMe: z.boolean().optional(),
});

export const registerSchema = z
  .object({
    firstName: z.string().min(2, "Ingresa tu nombre."),
    lastName: z.string().min(2, "Ingresa tu apellido."),
    /**
     * El backend la exige como entero. El input entrega texto, por eso se
     * convierte con `coerce` antes de validar.
     */
    age: z.coerce
      .number({ invalid_type_error: "Ingresa tu edad." })
      .int("La edad debe ser un número entero.")
      .min(18, "Debes ser mayor de edad para crear una cuenta.")
      .max(120, "Ingresa una edad válida."),
    email: z
      .string()
      .min(1, "Ingresa tu correo.")
      .email("Correo no válido.")
      .max(50, "El correo no puede superar los 50 caracteres."),
    password: z
      .string()
      .min(8, "Mínimo 8 caracteres.")
      .max(30, "Máximo 30 caracteres.")
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
  })
  // El backend guarda nombre y apellido juntos en un campo acotado, así que
  // se avisa en el formulario en vez de dejar que el servidor lo rechace.
  .refine(
    (values) =>
      `${values.firstName.trim()} ${values.lastName.trim()}`.trim().length <=
      USERNAME_MAX_LENGTH,
    {
      path: ["lastName"],
      message: `Nombre y apellido juntos no pueden superar ${USERNAME_MAX_LENGTH} caracteres.`,
    },
  );

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Ingresa tu correo.").email("Correo no válido."),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
