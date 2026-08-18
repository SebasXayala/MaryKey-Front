"use client";

import { ShoppingBag, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { createContext, useCallback, useContext, useMemo, useState } from "react";

import { ButtonLink } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/auth-context";

/**
 * Puerta de sesión para acciones que requieren cuenta (agregar a la bolsa,
 * guardar favoritos, comprar). Si no hay sesión, en vez de ejecutar la acción
 * se abre un diálogo que invita a iniciar sesión o registrarse.
 *
 *   const { requireAuth } = useAuthGate();
 *   <button onClick={() => requireAuth(() => add(product))}>Agregar</button>
 */

interface AuthGateContextValue {
  requireAuth: (action: () => void, message?: string) => void;
}

const AuthGateContext = createContext<AuthGateContextValue | null>(null);

const DEFAULT_MESSAGE =
  "Crea tu cuenta o inicia sesión para guardar productos en tu bolsa y continuar con tu compra.";

export function AuthGateProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const pathname = usePathname();
  const [message, setMessage] = useState<string | null>(null);

  const requireAuth = useCallback(
    (action: () => void, customMessage?: string) => {
      if (isAuthenticated) {
        action();
        return;
      }
      setMessage(customMessage ?? DEFAULT_MESSAGE);
    },
    [isAuthenticated],
  );

  const value = useMemo(() => ({ requireAuth }), [requireAuth]);

  return (
    <AuthGateContext.Provider value={value}>
      {children}

      {message && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="auth-gate-title"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-neutral-900/40 p-4"
          onClick={() => setMessage(null)}
        >
          <div
            className="relative w-full max-w-sm rounded-card bg-white p-8 text-center shadow-card"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setMessage(null)}
              aria-label="Cerrar"
              className="absolute right-4 top-4 text-neutral-400 hover:text-neutral-600"
            >
              <X className="size-4" />
            </button>

            <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary-50 text-primary-500">
              <ShoppingBag className="size-5" />
            </span>

            <h2
              id="auth-gate-title"
              className="mt-5 font-display text-2xl text-neutral-700"
            >
              Necesitas una cuenta
            </h2>

            <p className="mt-3 text-sm leading-relaxed text-neutral-500">
              {message}
            </p>

            <div className="mt-7 space-y-3">
              <ButtonLink
                href={`/login?next=${encodeURIComponent(pathname)}`}
                fullWidth
                onClick={() => setMessage(null)}
              >
                Iniciar Sesión
              </ButtonLink>

              <ButtonLink
                href="/registro"
                variant="outlined"
                fullWidth
                onClick={() => setMessage(null)}
              >
                Crear una cuenta
              </ButtonLink>
            </div>
          </div>
        </div>
      )}
    </AuthGateContext.Provider>
  );
}

export function useAuthGate() {
  const context = useContext(AuthGateContext);
  if (!context) {
    throw new Error("useAuthGate debe usarse dentro de <AuthGateProvider>.");
  }
  return context;
}
