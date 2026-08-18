"use client";

import { ImageIcon, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useRef, useState } from "react";

import { ButtonLink } from "@/components/ui/button";
import { useCart } from "@/lib/cart/cart-context";
import { useClickOutside } from "@/lib/hooks/use-click-outside";
import { formatPrice } from "@/lib/utils/format";

/**
 * Mini bolsa del header: al hacer clic muestra el contenido actual, o el
 * mensaje de bolsa vacía si todavía no hay nada.
 */
export function CartMenu() {
  const { lines, count, subtotal, currency } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setIsOpen(false), []);
  useClickOutside(containerRef, close, isOpen);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-label={`Bolsa de compras: ${count} ${count === 1 ? "producto" : "productos"}`}
        className="relative rounded-full p-2.5 text-primary-500 transition-colors hover:bg-primary-50"
      >
        <ShoppingBag className="size-5" />
        {count > 0 && (
          <span className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-primary-500 text-[0.6rem] font-bold text-white">
            {count}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-card border border-line bg-white p-4 shadow-card">
          {lines.length === 0 ? (
            <div className="flex flex-col items-center px-2 py-6 text-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-primary-50 text-primary-400">
                <ShoppingBag className="size-5" />
              </span>
              <p className="mt-4 text-sm font-semibold text-neutral-700">
                Aún no tienes nada en el carrito
              </p>
              <p className="mt-1.5 text-xs leading-relaxed text-neutral-500">
                Explora el catálogo y agrega tus productos favoritos.
              </p>
              <ButtonLink
                href="/categoria/skincare"
                size="sm"
                fullWidth
                className="mt-5"
                onClick={close}
              >
                Ver productos
              </ButtonLink>
            </div>
          ) : (
            <>
              <p className="px-1 pb-3 text-xs font-bold uppercase tracking-[0.12em] text-neutral-500">
                Tu bolsa ({count})
              </p>

              <ul className="max-h-72 space-y-3 overflow-y-auto">
                {lines.map(({ product, quantity }) => (
                  <li key={product.id}>
                    <Link
                      href={`/producto/${product.slug}`}
                      onClick={close}
                      className="flex gap-3 rounded-field p-1 hover:bg-primary-50/60"
                    >
                      <span className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-field bg-linear-to-br from-primary-50 to-secondary-50">
                        {product.imageUrl ? (
                          <Image
                            src={product.imageUrl}
                            alt={product.name}
                            fill
                            sizes="56px"
                            className="object-cover"
                          />
                        ) : (
                          <ImageIcon className="size-4 text-primary-200" aria-hidden />
                        )}
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-semibold text-neutral-700">
                          {product.name}
                        </span>
                        <span className="mt-0.5 block text-[0.7rem] text-neutral-400">
                          {quantity} ×{" "}
                          {formatPrice(product.price, product.currency)}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>

              <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
                <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  Subtotal
                </span>
                <span className="font-display text-lg text-primary-600">
                  {formatPrice(subtotal, currency)}
                </span>
              </div>

              <ButtonLink
                href="/carrito"
                fullWidth
                size="sm"
                className="mt-4"
                onClick={close}
              >
                Ver mi bolsa
              </ButtonLink>
            </>
          )}
        </div>
      )}
    </div>
  );
}
