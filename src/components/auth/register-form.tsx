"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input, PasswordInput } from "@/components/ui/input";
import { Logo } from "@/components/ui/logo";
import { Select } from "@/components/ui/select";
import { ApiError, toDisplayMessage } from "@/lib/api/api-error";
import { useAuth } from "@/lib/auth/auth-context";
import {
  registerSchema,
  type RegisterFormValues,
} from "@/lib/validation/auth-schemas";

export function RegisterForm() {
  const router = useRouter();
  const { register: registerUser } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(values: RegisterFormValues) {
    setFormError(null);
    try {
      await registerUser({
        firstName: values.firstName,
        lastName: values.lastName,
        age: values.age,
        gender: values.gender,
        email: values.email,
        password: values.password,
        acceptsTerms: values.acceptsTerms,
      });
      router.replace("/cuenta");
      router.refresh();
    } catch (error) {
      if (error instanceof ApiError && error.fieldErrors) {
        for (const [field, message] of Object.entries(error.fieldErrors)) {
          if (field in values) {
            setError(field as keyof RegisterFormValues, { message });
          }
        }
      }
      setFormError(toDisplayMessage(error));
    }
  }

  return (
    <div className="w-full max-w-md">
      <Logo size="md" href="" />

      <h1 className="mt-6 text-3xl text-primary-700">Crea tu cuenta</h1>
      <p className="mt-2 text-sm text-neutral-500">
        Empieza tu experiencia Mary Kay en un minuto.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-8 space-y-5">
        {formError && <Alert tone="error">{formError}</Alert>}

        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            label="Nombre"
            autoComplete="given-name"
            placeholder="Valentina"
            error={errors.firstName?.message}
            {...register("firstName")}
          />
          <Input
            label="Apellido"
            autoComplete="family-name"
            placeholder="Ríos"
            error={errors.lastName?.message}
            {...register("lastName")}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            label="Edad"
            type="number"
            inputMode="numeric"
            min={18}
            max={120}
            autoComplete="off"
            placeholder="28"
            error={errors.age?.message}
            {...register("age")}
          />
          {/* El backend lo exige como enum ('female' | 'male'). */}
          <Select
            label="Género"
            placeholder="Selecciona…"
            options={[
              { value: "female", label: "Femenino" },
              { value: "male", label: "Masculino" },
            ]}
            error={errors.gender?.message}
            {...register("gender")}
          />
        </div>

        <Input
          label="Correo Electrónico"
          type="email"
          autoComplete="email"
          placeholder="nombre@ejemplo.com"
          icon={<Mail className="size-4" />}
          error={errors.email?.message}
          {...register("email")}
        />

        <PasswordInput
          label="Contraseña"
          autoComplete="new-password"
          placeholder="••••••••"
          hint="Mínimo 8 caracteres, una mayúscula y un número."
          error={errors.password?.message}
          {...register("password")}
        />

        <PasswordInput
          label="Confirmar Contraseña"
          autoComplete="new-password"
          placeholder="••••••••"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        <Checkbox
          label={
            <>
              Acepto los{" "}
              <Link href="/terminos" className="font-semibold text-primary-600">
                Términos
              </Link>{" "}
              y la{" "}
              <Link href="/privacidad" className="font-semibold text-primary-600">
                Política de Privacidad
              </Link>
              .
            </>
          }
          error={errors.acceptsTerms?.message}
          {...register("acceptsTerms")}
        />

        <Button type="submit" size="lg" fullWidth isLoading={isSubmitting}>
          Crear Cuenta
          {!isSubmitting && <ArrowRight className="size-4" />}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-neutral-500">
        ¿Ya tienes cuenta?{" "}
        <Link
          href="/login"
          className="font-semibold text-primary-600 hover:text-primary-700"
        >
          Inicia sesión
        </Link>
      </p>
    </div>
  );
}
