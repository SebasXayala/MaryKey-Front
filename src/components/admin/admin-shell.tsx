"use client";

import {
  FolderTree,
  LayoutDashboard,
  Loader2,
  LogOut,
  Package,
  Store,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { Logo } from "@/components/ui/logo";
import { useAuth } from "@/lib/auth/auth-context";
import { canAccessAdmin } from "@/lib/auth/permissions";
import { cn } from "@/lib/utils/cn";
import { initials } from "@/lib/utils/format";

const NAV_ITEMS = [
  { href: "/admin", label: "Resumen", icon: LayoutDashboard, exact: true },
  { href: "/admin/productos", label: "Productos", icon: Package },
  { href: "/admin/categorias", label: "Categorías", icon: FolderTree },
  { href: "/admin/clientes", label: "Clientes", icon: Users },
];

/**
 * Marco del panel: barra lateral y control de acceso.
 *
 * El middleware ya exige la cookie de sesión; aquí se comprueba además
 * quién puede administrar (ver `lib/auth/permissions.ts`).
 */
export function AdminShell({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [isLoading, isAuthenticated, pathname, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Loader2
          className="size-6 animate-spin text-primary-500"
          aria-label="Cargando"
        />
      </div>
    );
  }

  if (!canAccessAdmin(user)) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-6 text-center">
        <h1 className="text-2xl text-neutral-700">Zona restringida</h1>
        <p className="mt-3 text-sm leading-relaxed text-neutral-500">
          Tu cuenta no tiene el rol de administradora. Si deberías tenerlo,
          pide que te lo asignen desde la gestión de clientes.
        </p>
        <Link
          href="/"
          className="mt-6 text-sm font-semibold text-primary-600 hover:text-primary-700"
        >
          Volver a la tienda
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col bg-surface lg:flex-row">
      <aside className="border-b border-line bg-white lg:w-60 lg:shrink-0 lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between gap-4 px-5 py-4 lg:block">
          <Logo size="sm" href="/admin" />
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-primary-500 lg:mt-1.5">
            Administración
          </p>
        </div>

        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:overflow-visible">
          {NAV_ITEMS.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 whitespace-nowrap rounded-field px-3 py-2.5 text-sm transition-colors",
                  isActive
                    ? "bg-primary-50 font-semibold text-primary-700"
                    : "text-neutral-600 hover:bg-neutral-50",
                )}
              >
                <item.icon className="size-4" aria-hidden />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden border-t border-line p-3 lg:block">
          <Link
            href="/"
            className="flex items-center gap-2.5 rounded-field px-3 py-2.5 text-sm text-neutral-600 hover:bg-neutral-50"
          >
            <Store className="size-4" aria-hidden />
            Ver la tienda
          </Link>
          <button
            type="button"
            onClick={() => void logout()}
            className="flex w-full items-center gap-2.5 rounded-field px-3 py-2.5 text-sm text-neutral-600 hover:bg-neutral-50"
          >
            <LogOut className="size-4" aria-hidden />
            Cerrar sesión
          </button>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="flex items-center justify-end gap-3 border-b border-line bg-white px-5 py-3">
          <div className="text-right">
            <p className="truncate text-xs font-semibold text-neutral-700">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="truncate text-[0.7rem] text-neutral-400">
              {user?.email}
            </p>
          </div>
          <span className="flex size-9 items-center justify-center rounded-full bg-primary-100 text-[0.7rem] font-bold text-primary-700">
            {initials(user?.firstName, user?.lastName)}
          </span>
        </header>

        <main className="mx-auto max-w-6xl px-5 py-8">{children}</main>
      </div>
    </div>
  );
}
