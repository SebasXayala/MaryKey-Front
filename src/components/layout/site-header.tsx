"use client";

import { useQuery } from "@tanstack/react-query";
import { Menu, Search, ShoppingBag, User, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import { Logo } from "@/components/ui/logo";
import { useAuth } from "@/lib/auth/auth-context";
import { useCart } from "@/lib/cart/cart-context";
import { queryKeys } from "@/lib/query-keys";
import { cn } from "@/lib/utils/cn";
import { catalogService } from "@/services/catalog.service";
import type { Category } from "@/types/catalog";

/** Se usa mientras responde el backend, para que el header no salte. */
const FALLBACK_NAV: Category[] = [
  { id: "1", slug: "skincare", name: "Skincare" },
  { id: "2", slug: "maquillaje", name: "Maquillaje" },
  { id: "3", slug: "fragancias", name: "Fragancias" },
];

/** Tutoriales es contenido editorial, no una categoría del catálogo. */
const CONTENT_LINKS = [{ id: "tutoriales", href: "/tutoriales", name: "Tutoriales" }];

export function SiteHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const { count } = useCart();
  const [search, setSearch] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  // La navegación viene del catálogo real; si falla, se muestra el fallback.
  const { data: categories } = useQuery({
    queryKey: queryKeys.categories,
    queryFn: () => catalogService.categories(),
    staleTime: 10 * 60_000,
  });

  const navItems = [
    ...(categories?.length ? categories : FALLBACK_NAV).map((item) => ({
      id: item.id,
      name: item.name,
      href: `/categoria/${item.slug}`,
    })),
    ...CONTENT_LINKS,
  ];

  function handleSearch(event: React.FormEvent) {
    event.preventDefault();
    const term = search.trim();
    if (!term) return;
    router.push(`/buscar?q=${encodeURIComponent(term)}`);
    setMobileOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8">
        <Logo size="md" className="shrink-0" />

        <nav className="hidden items-center gap-7 lg:flex">
          {navItems.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.id}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors",
                  active
                    ? "text-primary-600 underline decoration-primary-400 decoration-2 underline-offset-8"
                    : "text-neutral-600 hover:text-primary-500",
                )}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>

        <form
          onSubmit={handleSearch}
          role="search"
          className="ml-auto hidden max-w-xs flex-1 items-center gap-2 rounded-full bg-primary-50 px-4 py-2.5 md:flex"
        >
          <Search className="size-4 shrink-0 text-primary-500" aria-hidden />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar Productos"
            aria-label="Buscar productos"
            className="w-full bg-transparent text-sm text-neutral-700 placeholder:text-neutral-400 focus:outline-none"
          />
        </form>

        <div className="ml-auto flex items-center gap-1 md:ml-0">
          <Link
            href={isAuthenticated ? "/cuenta" : "/login"}
            aria-label={isAuthenticated ? "Mi cuenta" : "Iniciar sesión"}
            className="rounded-full p-2.5 text-primary-500 transition-colors hover:bg-primary-50"
          >
            <User className="size-5" />
          </Link>

          <Link
            href="/carrito"
            aria-label={`Bolsa de compras (${count} productos)`}
            className="relative rounded-full p-2.5 text-primary-500 transition-colors hover:bg-primary-50"
          >
            <ShoppingBag className="size-5" />
            {count > 0 && (
              <span className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-primary-500 text-[0.6rem] font-bold text-white">
                {count}
              </span>
            )}
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            aria-label="Abrir menú"
            aria-expanded={mobileOpen}
            className="rounded-full p-2.5 text-neutral-600 transition-colors hover:bg-neutral-100 lg:hidden"
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-line bg-white px-4 py-4 lg:hidden">
          <form onSubmit={handleSearch} role="search" className="mb-4 flex items-center gap-2 rounded-full bg-primary-50 px-4 py-2.5">
            <Search className="size-4 text-primary-500" aria-hidden />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar Productos"
              aria-label="Buscar productos"
              className="w-full bg-transparent text-sm focus:outline-none"
            />
          </form>

          <nav className="flex flex-col">
            {navItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="border-b border-line py-3 text-sm font-medium text-neutral-700 last:border-0"
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
