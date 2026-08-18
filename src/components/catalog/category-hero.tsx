"use client";

import { useQuery } from "@tanstack/react-query";
import { Sparkles } from "lucide-react";
import Image from "next/image";

import { queryKeys } from "@/lib/query-keys";
import { catalogService } from "@/services/catalog.service";

/**
 * Banner superior de la categoría. El contenido (título, copy e imagen)
 * lo entrega el backend en el recurso de la categoría, no está quemado.
 */
export function CategoryHero({ slug }: { slug: string }) {
  const { data, isPending } = useQuery({
    queryKey: queryKeys.category(slug),
    queryFn: () => catalogService.category(slug),
    retry: false,
  });

  if (isPending) {
    return (
      <div className="h-56 animate-pulse rounded-card bg-primary-50 sm:h-64" />
    );
  }

  const title = data?.heroTitle ?? data?.name ?? slug;
  const subtitle = data?.heroSubtitle ?? data?.description;

  return (
    <section className="overflow-hidden rounded-card bg-primary-100">
      <div className="grid items-center gap-6 sm:grid-cols-[minmax(0,240px)_1fr]">
        <div className="relative flex h-48 items-center justify-center sm:h-56">
          {data?.heroImageUrl ? (
            <Image
              src={data.heroImageUrl}
              alt={title}
              fill
              sizes="240px"
              className="object-cover"
            />
          ) : (
            <div
              aria-hidden
              className="flex size-28 items-center justify-center rounded-full bg-white/60 text-primary-400"
            >
              <Sparkles className="size-8" />
            </div>
          )}
        </div>

        <div className="px-6 pb-8 pt-2 sm:py-8 sm:pr-10">
          <h1 className="font-display text-3xl uppercase tracking-[0.06em] text-primary-700 sm:text-4xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-neutral-600">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
