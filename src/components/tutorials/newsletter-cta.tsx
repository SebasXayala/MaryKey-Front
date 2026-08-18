"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { ApiError, toDisplayMessage } from "@/lib/api/api-error";
import { newsletterService } from "@/services/newsletter.service";

export function NewsletterCta() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setStatus("loading");

    try {
      const response = await newsletterService.subscribe(email);
      setMessage(response.message);
      setStatus("done");
      setEmail("");
    } catch (caught) {
      setError(
        caught instanceof ApiError && caught.fieldErrors?.email
          ? caught.fieldErrors.email
          : toDisplayMessage(caught),
      );
      setStatus("idle");
    }
  }

  return (
    <section className="rounded-card bg-secondary-500 px-6 py-14 text-center text-white sm:px-12">
      <h2 className="mx-auto max-w-md font-display text-3xl leading-tight">
        ¿Buscas Consejos Personalizados?
      </h2>

      <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-white/85">
        Suscríbete a nuestro newsletter y recibe tutoriales exclusivos
        directamente en tu bandeja de entrada cada semana.
      </p>

      {status === "done" ? (
        <p className="mx-auto mt-8 max-w-md rounded-field bg-white/15 px-5 py-3 text-sm">
          {message}
        </p>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="mx-auto mt-8 flex max-w-lg flex-col gap-3 sm:flex-row"
        >
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Tu correo electrónico"
            aria-label="Correo electrónico"
            aria-invalid={Boolean(error) || undefined}
            className="h-12 flex-1 rounded-field bg-white/15 px-5 text-sm text-white placeholder:text-white/60 focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/40"
          />

          <Button
            type="submit"
            className="bg-white text-secondary-600 hover:bg-white/90 active:bg-white/80"
            isLoading={status === "loading"}
          >
            Suscribirme
          </Button>
        </form>
      )}

      {error && (
        <p role="alert" className="mt-3 text-xs text-white">
          {error}
        </p>
      )}
    </section>
  );
}
