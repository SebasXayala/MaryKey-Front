"use client";

import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";

import { ProductCard } from "@/components/catalog/product-card";
import { Alert } from "@/components/ui/alert";
import { toDisplayMessage } from "@/lib/api/api-error";
import { queryKeys } from "@/lib/query-keys";
import { catalogService } from "@/services/catalog.service";

interface FeaturedCarouselProps {
  title: string;
  subtitle?: string;
  /** Limita los destacados a una categoría; sin valor trae los de toda la tienda. */
  category?: string;
}

/**
 * Carrusel horizontal de productos destacados.
 * Usa scroll nativo con snap: sin librerías y funciona con teclado y touch.
 */
export function FeaturedCarousel({
  title,
  subtitle,
  category,
}: FeaturedCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  const query = { category, featured: true, pageSize: 8 };
  const { data, isPending, isError, error } = useQuery({
    queryKey: queryKeys.products(query),
    queryFn: () => catalogService.products(query),
  });

  function scrollBy(direction: 1 | -1) {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({ left: direction * track.clientWidth * 0.8, behavior: "smooth" });
  }

  if (isError) {
    return <Alert tone="error">{toDisplayMessage(error)}</Alert>;
  }

  if (!isPending && !data.items.length) return null;

  return (
    <section className="py-2">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl text-neutral-700">{title}</h2>
          {subtitle && (
            <p className="mt-1 text-sm text-neutral-500">{subtitle}</p>
          )}
        </div>

        <div className="hidden gap-2 sm:flex">
          <button
            type="button"
            onClick={() => scrollBy(-1)}
            aria-label="Anterior"
            className="rounded-full border border-neutral-200 bg-white p-2 text-neutral-600 transition-colors hover:border-primary-300 hover:text-primary-600"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => scrollBy(1)}
            aria-label="Siguiente"
            className="rounded-full border border-neutral-200 bg-white p-2 text-neutral-600 transition-colors hover:border-primary-300 hover:text-primary-600"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      <div
        ref={trackRef}
        className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 [scrollbar-width:thin]"
      >
        {isPending
          ? Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="w-64 shrink-0 animate-pulse snap-start overflow-hidden rounded-card bg-white shadow-card"
              >
                <div className="aspect-square bg-neutral-100" />
                <div className="space-y-2 p-4">
                  <div className="h-3 w-1/3 rounded bg-neutral-100" />
                  <div className="h-3.5 w-3/4 rounded bg-neutral-100" />
                  <div className="h-9 w-full rounded-field bg-neutral-100" />
                </div>
              </div>
            ))
          : data.items.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                className="w-64 shrink-0 snap-start"
              />
            ))}
      </div>
    </section>
  );
}
