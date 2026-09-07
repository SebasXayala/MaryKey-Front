"use client";

import { ArrowRight, LayoutDashboard } from "lucide-react";

import { ButtonLink } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/auth-context";
import { canAccessAdmin } from "@/lib/auth/permissions";

/**
 * Botones del banner principal.
 *
 * El segundo cambia según quién mira: a una visitante se le ofrece crear
 * cuenta, a una clienta su cuenta y a una administradora el panel. Es
 * cliente porque depende de la sesión, que vive en el navegador.
 */
export function HeroActions() {
  const { user, isAuthenticated, isLoading } = useAuth();

  const secondary = isAuthenticated
    ? canAccessAdmin(user)
      ? { href: "/admin", label: "Ir al panel", icon: true }
      : { href: "/cuenta", label: "Mi cuenta", icon: false }
    : { href: "/registro", label: "Crear cuenta", icon: false };

  return (
    <div className="mt-8 flex flex-wrap gap-3">
      <ButtonLink href="/categoria/skincare" size="lg">
        Ver Skincare
        <ArrowRight className="size-4" />
      </ButtonLink>

      {/* Mientras se hidrata la sesión no se pinta, para no mostrar
          "Crear cuenta" a quien ya tiene sesión abierta. */}
      {!isLoading && (
        <ButtonLink href={secondary.href} size="lg" variant="outlined">
          {secondary.icon && <LayoutDashboard className="size-4" />}
          {secondary.label}
        </ButtonLink>
      )}
    </div>
  );
}
