"use client";

import { ImageIcon, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Button, ButtonLink } from "@/components/ui/button";
import { useCart } from "@/lib/cart/cart-context";
import { formatPrice } from "@/lib/utils/format";

export function CartSummary() {
  const { lines, count, subtotal, currency, setQuantity, remove, clear } = useCart();

  if (!lines.length) {
    return (
      <div className="flex flex-col items-center py-20 text-center">
        <ShoppingBag className="size-10 text-primary-300" aria-hidden />
        <h1 className="mt-5 font-display text-3xl text-neutral-700">
          Tu bolsa está vacía
        </h1>
        <p className="mt-3 max-w-md text-sm text-neutral-500">
          Explora el catálogo y agrega tus productos favoritos.
        </p>
        <ButtonLink href="/categoria/skincare" className="mt-8">
          Ver productos
        </ButtonLink>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <div>
        <div className="mb-6 flex items-center justify-between">
          <h1 className="font-display text-3xl text-neutral-700">Mi bolsa</h1>
          <button
            type="button"
            onClick={clear}
            className="text-xs font-semibold text-neutral-400 hover:text-danger"
          >
            Vaciar bolsa
          </button>
        </div>

        <ul className="space-y-4">
          {lines.map(({ product, quantity }) => (
            <li
              key={product.id}
              className="flex gap-4 rounded-card bg-white p-4 shadow-card"
            >
              <Link
                href={`/producto/${product.slug}`}
                className="relative flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-field bg-linear-to-br from-primary-50 to-secondary-50"
              >
                {product.imageUrl ? (
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                ) : (
                  <ImageIcon className="size-6 text-primary-200" aria-hidden />
                )}
              </Link>

              <div className="min-w-0 flex-1">
                <h2 className="truncate text-sm font-semibold text-neutral-700">
                  {product.name}
                </h2>
                <p className="mt-0.5 text-xs text-neutral-400">{product.sku}</p>

                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <div className="flex items-center rounded-full border border-neutral-200">
                    <button
                      type="button"
                      onClick={() => setQuantity(product.id, quantity - 1)}
                      aria-label={`Quitar una unidad de ${product.name}`}
                      className="p-2 text-neutral-500 hover:text-primary-600"
                    >
                      <Minus className="size-3.5" />
                    </button>
                    <span className="min-w-8 text-center text-sm font-semibold text-neutral-700">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity(product.id, quantity + 1)}
                      aria-label={`Agregar una unidad de ${product.name}`}
                      className="p-2 text-neutral-500 hover:text-primary-600"
                    >
                      <Plus className="size-3.5" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => remove(product.id)}
                    aria-label={`Eliminar ${product.name}`}
                    className="text-neutral-400 hover:text-danger"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>

              <p className="font-display text-lg text-primary-600">
                {formatPrice(product.price * quantity, product.currency)}
              </p>
            </li>
          ))}
        </ul>
      </div>

      <aside className="h-fit rounded-card bg-white p-6 shadow-card">
        <h2 className="font-sans text-sm font-bold uppercase tracking-[0.12em] text-neutral-700">
          Resumen
        </h2>

        <dl className="mt-5 space-y-3 text-sm">
          <div className="flex justify-between text-neutral-500">
            <dt>Productos ({count})</dt>
            <dd>{formatPrice(subtotal, currency)}</dd>
          </div>
          <div className="flex justify-between text-neutral-500">
            <dt>Envío</dt>
            <dd className="text-xs">Se calcula al pagar</dd>
          </div>
          <div className="flex justify-between border-t border-line pt-3 text-base font-semibold text-neutral-700">
            <dt>Total</dt>
            <dd className="font-display text-primary-600">
              {formatPrice(subtotal, currency)}
            </dd>
          </div>
        </dl>

        <Button
          fullWidth
          className="mt-6"
          disabled
          title="Se habilita cuando el backend exponga el endpoint de checkout."
        >
          Continuar al pago
        </Button>

        <p className="mt-3 text-center text-[0.7rem] text-neutral-400">
          El checkout se conecta con el endpoint de pedidos del backend.
        </p>
      </aside>
    </div>
  );
}
