"use client";

import { LogOut, User, UserPlus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useRef, useState } from "react";

import { useAuth } from "@/lib/auth/auth-context";
import { useClickOutside } from "@/lib/hooks/use-click-outside";
import { initials } from "@/lib/utils/format";

/**
 * Menú del icono de usuario.
 * Sin sesión ofrece iniciar sesión o registrarse; con sesión muestra los
 * accesos de la cuenta.
 */
export function AccountMenu() {
  const { user, isAuthenticated, logout } = useAuth();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setIsOpen(false), []);
  useClickOutside(containerRef, close, isOpen);

  const loginHref = `/login?next=${encodeURIComponent(pathname)}`;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label={isAuthenticated ? "Mi cuenta" : "Iniciar sesión"}
        className="flex items-center rounded-full p-2.5 text-primary-500 transition-colors hover:bg-primary-50"
      >
        {isAuthenticated ? (
          <span className="flex size-5 items-center justify-center rounded-full bg-primary-500 text-[0.6rem] font-bold text-white">
            {initials(user?.firstName, user?.lastName)}
          </span>
        ) : (
          <User className="size-5" />
        )}
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-60 rounded-card border border-line bg-white p-2 shadow-card"
        >
          {isAuthenticated ? (
            <>
              <div className="border-b border-line px-3 pb-3 pt-2">
                <p className="truncate text-sm font-semibold text-neutral-700">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="truncate text-xs text-neutral-400">{user?.email}</p>
              </div>

              <Link
                href="/cuenta"
                role="menuitem"
                onClick={close}
                className="mt-1 flex items-center gap-2.5 rounded-field px-3 py-2.5 text-sm text-neutral-600 hover:bg-primary-50 hover:text-primary-700"
              >
                <User className="size-4" />
                Mi cuenta
              </Link>

              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  close();
                  void logout();
                }}
                className="flex w-full items-center gap-2.5 rounded-field px-3 py-2.5 text-sm text-neutral-600 hover:bg-primary-50 hover:text-primary-700"
              >
                <LogOut className="size-4" />
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <p className="px-3 pb-2 pt-2 text-xs leading-relaxed text-neutral-500">
                Accede a tu cuenta para ver tu bolsa y tus pedidos.
              </p>

              <Link
                href={loginHref}
                role="menuitem"
                onClick={close}
                className="flex items-center justify-center gap-2 rounded-field bg-primary-500 px-3 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-600"
              >
                Iniciar Sesión
              </Link>

              <Link
                href="/registro"
                role="menuitem"
                onClick={close}
                className="mt-2 flex items-center justify-center gap-2 rounded-field px-3 py-2.5 text-sm font-semibold text-primary-600 hover:bg-primary-50"
              >
                <UserPlus className="size-4" />
                Crear una cuenta
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}
