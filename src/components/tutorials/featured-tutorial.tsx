"use client";

import { useQuery } from "@tanstack/react-query";
import { Clock, Play, Signal } from "lucide-react";
import Image from "next/image";

import { ButtonLink } from "@/components/ui/button";
import { queryKeys } from "@/lib/query-keys";
import { formatDuration } from "@/lib/utils/format";
import { tutorialsService } from "@/services/tutorials.service";

export function FeaturedTutorial() {
  const { data, isPending, isError } = useQuery({
    queryKey: queryKeys.featuredTutorial,
    queryFn: () => tutorialsService.featured(),
  });

  if (isPending) {
    return <div className="h-72 animate-pulse rounded-card bg-neutral-100" />;
  }

  // Si el backend no marca ningún destacado, la sección simplemente no se pinta.
  if (isError || !data) return null;

  return (
    <section className="overflow-hidden rounded-card bg-white shadow-card">
      <div className="grid lg:grid-cols-[1.15fr_1fr]">
        <div className="relative flex min-h-64 items-center justify-center bg-linear-to-br from-primary-200 via-primary-300 to-secondary-400">
          {data.coverUrl && (
            <Image
              src={data.coverUrl}
              alt={data.title}
              fill
              sizes="(min-width: 1024px) 55vw, 100vw"
              className="object-cover"
            />
          )}

          <span className="relative flex size-14 items-center justify-center rounded-full bg-white/90 text-primary-600 shadow-card">
            <Play className="size-5 fill-current" aria-hidden />
          </span>
        </div>

        <div className="p-8 sm:p-10">
          <h2 className="font-display text-2xl leading-snug text-secondary-700">
            {data.title}
          </h2>

          <p className="mt-4 text-sm leading-relaxed text-neutral-500">
            {data.excerpt}
          </p>

          <div className="mt-6 flex items-center gap-5 text-xs text-neutral-400">
            <span className="flex items-center gap-1.5">
              <Clock className="size-3.5" aria-hidden />
              {formatDuration(data.durationMinutes)}
            </span>
            <span className="flex items-center gap-1.5 capitalize">
              <Signal className="size-3.5" aria-hidden />
              {data.level}
            </span>
          </div>

          <ButtonLink
            href={`/tutoriales/${data.slug}`}
            variant="outlined"
            className="mt-8"
          >
            Ver Tutorial Completo
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
