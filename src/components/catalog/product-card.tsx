"use client";

import { Check, Heart, ImageIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { useAuthGate } from "@/lib/auth/auth-gate";
import { useCart } from "@/lib/cart/cart-context";
import { cn } from "@/lib/utils/cn";
import { formatPrice } from "@/lib/utils/format";
import { useWishlist } from "@/lib/wishlist/wishlist-context";
import type { Product, ProductBadge } from "@/types/catalog";

const badgeLabels: Record<ProductBadge, string> = {
  nuevo: "Nuevo",
  best_seller: "Best Seller",
  oferta: "Oferta",
};

const badgeStyles: Record<ProductBadge, string> = {
  nuevo: "bg-primary-500 text-white",
  best_seller: "bg-secondary-500 text-white",
  oferta: "bg-gold-400 text-neutral-800",
};

export function ProductCard({
  product,
  className,
}: {
  product: Product;
  className?: string;
}) {
  const { add, lastAddedId } = useCart();
  const { requireAuth } = useAuthGate();
  const wishlist = useWishlist();

  const isWished = wishlist.has(product.id);
  const justAdded = lastAddedId === product.id;

  return (
    <article
      className={cn(
        "group flex flex-col overflow-hidden rounded-card bg-white shadow-card transition-shadow hover:shadow-lg",
        className,
      )}
    >
      <div className="relative">
        <Link
          href={`/producto/${product.slug}`}
          className="relative flex aspect-square items-center justify-center overflow-hidden bg-linear-to-br from-primary-50 to-secondary-50"
        >
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              sizes="(min-width: 1024px) 25vw, 50vw"
              className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
          ) : (
            <ImageIcon className="size-8 text-primary-200" aria-hidden />
          )}
        </Link>

        {product.badge && (
          <span
            className={cn(
              "absolute left-3 top-3 rounded-full px-2.5 py-1 text-[0.6rem] font-bold uppercase tracking-wide",
              badgeStyles[product.badge],
            )}
          >
            {badgeLabels[product.badge]}
          </span>
        )}

        <button
          type="button"
          onClick={() => wishlist.toggle(product.id)}
          aria-pressed={isWished}
          aria-label={
            isWished ? "Quitar de favoritos" : "Agregar a favoritos"
          }
          className="absolute right-3 top-3 rounded-full bg-white/90 p-2 text-primary-500 shadow-field transition-colors hover:bg-white"
        >
          <Heart className={cn("size-4", isWished && "fill-primary-500")} />
        </button>
      </div>

      <div className="flex flex-1 flex-col p-4">
        {product.lineName && (
          <p className="text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-neutral-400">
            {product.lineName}
          </p>
        )}

        <h3 className="mt-1.5 font-sans text-sm font-semibold leading-snug text-neutral-700">
          <Link href={`/producto/${product.slug}`} className="hover:text-primary-600">
            {product.name}
          </Link>
        </h3>

        <div className="mt-2 flex items-baseline gap-2">
          <span className="font-display text-lg text-primary-600">
            {formatPrice(product.price, product.currency)}
          </span>
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className="text-xs text-neutral-400 line-through">
              {formatPrice(product.compareAtPrice, product.currency)}
            </span>
          )}
        </div>

        <Button
          size="sm"
          fullWidth
          className="mt-4"
          disabled={!product.inStock}
          onClick={() => requireAuth(() => add(product))}
        >
          {!product.inStock ? (
            "Agotado"
          ) : justAdded ? (
            <>
              <Check className="size-4" />
              Agregado
            </>
          ) : (
            "Agregar a la Bolsa"
          )}
        </Button>
      </div>
    </article>
  );
}
