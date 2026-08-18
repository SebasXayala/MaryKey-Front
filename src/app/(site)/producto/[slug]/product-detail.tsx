"use client";

import { useQuery } from "@tanstack/react-query";
import { Check, Heart, ImageIcon, ShoppingBag, Star } from "lucide-react";
import Image from "next/image";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { toDisplayMessage } from "@/lib/api/api-error";
import { useAuthGate } from "@/lib/auth/auth-gate";
import { useCart } from "@/lib/cart/cart-context";
import { queryKeys } from "@/lib/query-keys";
import { cn } from "@/lib/utils/cn";
import { formatPrice } from "@/lib/utils/format";
import { useWishlist } from "@/lib/wishlist/wishlist-context";
import { catalogService } from "@/services/catalog.service";

export function ProductDetail({ slug }: { slug: string }) {
  const { add, lastAddedId } = useCart();
  const { requireAuth } = useAuthGate();
  const wishlist = useWishlist();

  const { data, isPending, isError, error } = useQuery({
    queryKey: queryKeys.product(slug),
    queryFn: () => catalogService.product(slug),
  });

  if (isPending) {
    return (
      <div className="grid animate-pulse gap-10 lg:grid-cols-2">
        <div className="aspect-square rounded-card bg-neutral-100" />
        <div className="space-y-4 py-6">
          <div className="h-8 w-2/3 rounded bg-neutral-100" />
          <div className="h-4 w-full rounded bg-neutral-100" />
          <div className="h-4 w-5/6 rounded bg-neutral-100" />
          <div className="h-11 w-40 rounded-field bg-neutral-100" />
        </div>
      </div>
    );
  }

  if (isError) {
    return <Alert tone="error">{toDisplayMessage(error)}</Alert>;
  }

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-card bg-surface">
        {data.imageUrl ? (
          <Image
            src={data.imageUrl}
            alt={data.name}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        ) : (
          <ImageIcon className="size-10 text-neutral-300" aria-hidden />
        )}
      </div>

      <div className="py-4">
        <p className="text-xs uppercase tracking-[0.14em] text-neutral-400">
          {data.lineName ?? data.categorySlug}
        </p>
        <h1 className="mt-2 text-3xl text-neutral-700">{data.name}</h1>

        {typeof data.rating === "number" && (
          <div className="mt-3 flex items-center gap-1.5 text-sm text-neutral-500">
            <Star className="size-4 fill-primary-400 text-primary-400" aria-hidden />
            {data.rating.toFixed(1)}
          </div>
        )}

        <p className="mt-5 text-sm leading-relaxed text-neutral-500">
          {data.shortDescription}
        </p>

        <div className="mt-6 flex items-baseline gap-3">
          <span className="text-2xl font-bold text-primary-600">
            {data.price > 0 ? formatPrice(data.price, data.currency) : "Gratis"}
          </span>
          {data.compareAtPrice && data.compareAtPrice > data.price && (
            <span className="text-sm text-neutral-400 line-through">
              {formatPrice(data.compareAtPrice, data.currency)}
            </span>
          )}
        </div>

        <p className="mt-2 text-xs text-neutral-400">SKU {data.sku}</p>

        <div className="mt-8 flex items-center gap-3">
          <Button
            size="lg"
            disabled={!data.inStock}
            onClick={() => requireAuth(() => add(data))}
          >
            {lastAddedId === data.id ? (
              <Check className="size-4" />
            ) : (
              <ShoppingBag className="size-4" />
            )}
            {!data.inStock
              ? "Agotado"
              : lastAddedId === data.id
                ? "Agregado a la bolsa"
                : "Agregar a la Bolsa"}
          </Button>

          <button
            type="button"
            onClick={() => wishlist.toggle(data.id)}
            aria-pressed={wishlist.has(data.id)}
            aria-label={
              wishlist.has(data.id)
                ? "Quitar de favoritos"
                : "Agregar a favoritos"
            }
            className="rounded-full border border-neutral-200 p-3 text-primary-500 transition-colors hover:border-primary-300"
          >
            <Heart
              className={cn("size-5", wishlist.has(data.id) && "fill-primary-500")}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
