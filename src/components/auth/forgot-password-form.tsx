"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Mail } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/ui/logo";
import { toDisplayMessage } from "@/lib/api/api-error";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from "@/lib/validation/auth-schemas";
import { authService } from "@/services/auth.service";

export function ForgotPasswordForm() {
  const [sent, setSent] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: ForgotPasswordFormValues) {
    setFormError(null);
    try {
      await authService.forgotPassword(values);
      setSent(true);
    } catch (error) {
      setFormError(toDisplayMessage(error));
    }
  }

  return (
    <div>
      <Logo size="md" href="" />
      <h1 className="mt-6 text-2xl text-primary-700">
        Recupera tu contraseña
      </h1>
      <p className="mt-2 text-sm text-neutral-500">
        Te enviaremos un enlace para crear una nueva.
      </p>

      {sent ? (
        <Alert tone="success" className="mt-6">
          Si el correo está registrado, recibirás las instrucciones en unos
          minutos. Revisa también tu bandeja de spam.
        </Alert>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-6 space-y-5">
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

          <Button type="submit" size="lg" fullWidth isLoading={isSubmitting}>
            Enviar instrucciones
          </Button>
        </form>
      )}

      <Link
        href="/login"
        className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 hover:text-primary-700"
      >
        <ArrowLeft className="size-4" />
        Volver a iniciar sesión
      </Link>
    </div>
  );
}
