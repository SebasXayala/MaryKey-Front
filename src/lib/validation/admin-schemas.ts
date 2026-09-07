import { z } from "zod";

import { NAME_MAX_LENGTH } from "@/services/backend-user";

/**
 * Espejo de los DTOs del backend (CreateProductDto, CreateCategoryDto,
 * UpdateUserDto). Validar aquí evita un 400 con el texto en inglés y, sobre
 * todo, deja los mensajes junto al campo que los provocó.
 */

const optionalDescription = z
  .string()
  .max(255, "Máximo 255 caracteres.")
  .optional();

export const productSchema = z.object({
  name: z
    .string()
    .min(2, "Mínimo 2 caracteres.")
    .max(100, "Máximo 100 caracteres."),
  description: optionalDescription,
  price: z.coerce
    .number({ invalid_type_error: "Ingresa un precio." })
    .min(0, "El precio no puede ser negativo.")
    // El backend acepta @IsNumber({ maxDecimalPlaces: 2 }).
    .refine((value) => Number.isInteger(Math.round(value * 100)), {
      message: "Máximo dos decimales.",
    }),
  stock: z.coerce
    .number({ invalid_type_error: "Ingresa el stock." })
    .int("El stock debe ser un número entero.")
    .min(0, "El stock no puede ser negativo."),
  isActive: z.boolean(),
  category_id: z.coerce
    .number({ invalid_type_error: "Selecciona una categoría." })
    .int()
    .min(1, "Selecciona una categoría."),
});

export const categorySchema = z.object({
  name: z
    .string()
    .min(2, "Mínimo 2 caracteres.")
    .max(100, "Máximo 100 caracteres."),
  description: optionalDescription,
});

export const customerSchema = z.object({
  name: z
    .string()
    .min(2, "Mínimo 2 caracteres.")
    .max(NAME_MAX_LENGTH, `Máximo ${NAME_MAX_LENGTH} caracteres.`),
  age: z.coerce
    .number({ invalid_type_error: "Ingresa la edad." })
    .int("La edad debe ser un número entero.")
    .min(18, "Debe ser mayor de edad.")
    .max(120, "Ingresa una edad válida."),
  gender: z.enum(["female", "male"], {
    errorMap: () => ({ message: "Selecciona una opción." }),
  }),
  email: z
    .string()
    .min(1, "Ingresa el correo.")
    .email("Correo no válido.")
    .max(50, "Máximo 50 caracteres."),
  /** Vacío = no cambiar el rol. */
  role_id: z.string().optional(),
});

export type ProductFormValues = z.infer<typeof productSchema>;
export type CategoryFormValues = z.infer<typeof categorySchema>;
export type CustomerFormValues = z.infer<typeof customerSchema>;
