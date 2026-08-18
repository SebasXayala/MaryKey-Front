"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Lock, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { SocialAuthButtons } from "@/components/auth/social-auth-buttons";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input, PasswordInput } from "@/components/ui/input";
import { Logo } from "@/components/ui/logo";
import { ApiError, toDisplayMessage } from "@/lib/api/api-error";
import { useAuth } from "@/lib/auth/auth-context";
import {
  loginSchema,
  type LoginFormValues,
} from "@/lib/validation/auth-schemas";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);

  const redirectTo = searchParams.get("next") ?? "/cuenta";

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", rememberMe: false },
  });

  async function onSubmit(values: LoginFormValues) {
    setFormError(null);
    try {
      await login(values);
      router.replace(redirectTo);
      router.refresh();
    } catch (error) {
      // Errores por campo que devuelva el backend se pintan en el campo.
      if (error instanceof ApiError && error.fieldErrors) {
        for (const [field, message] of Object.entries(error.fieldErrors)) {
          if (field === "email" || field === "password") {
            setError(field, { message });
          }
        }
      }
      setFormError(toDisplayMessage(error));
    }
  }

  return (
    <div className="w-full max-w-md">
      <Logo size="md" href="" />

      <h1 className="mt-6 text-3xl text-primary-700">
        Bienvenida a tu belleza única
      </h1>
      <p className="mt-2 text-sm text-neutral-500">
        Accede a tu cuenta para continuar tu experiencia.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-8 space-y-5">
        {formError && <Alert tone="error">{formError}</Alert>}

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
          autoComplete="current-password"
          placeholder="••••••••"
          icon={<Lock className="size-4" />}
          error={errors.password?.message}
          {...register("password")}
        />

        <div className="flex items-center justify-between gap-4">
          <Checkbox label="Recordarme" {...register("rememberMe")} />
          <Link
            href="/recuperar-password"
            className="text-xs font-semibold text-primary-600 hover:text-primary-700"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        <Button type="submit" size="lg" fullWidth isLoading={isSubmitting}>
          Iniciar Sesión
          {!isSubmitting && <ArrowRight className="size-4" />}
        </Button>
      </form>

      <div className="my-7 flex items-center gap-4">
        <span className="h-px flex-1 bg-line" />
        <span className="text-xs text-neutral-400">O continúa con</span>
        <span className="h-px flex-1 bg-line" />
      </div>

      <SocialAuthButtons redirectTo={redirectTo} />

      <p className="mt-8 text-center text-sm text-neutral-500">
        ¿Eres nueva aquí?{" "}
        <Link
          href="/registro"
          className="font-semibold text-primary-600 hover:text-primary-700"
        >
          Crea una cuenta
        </Link>
      </p>
    </div>
  );
}
