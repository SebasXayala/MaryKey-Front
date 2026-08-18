"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Clock, Play, Signal } from "lucide-react";
import Link from "next/link";

import { Alert } from "@/components/ui/alert";
import { toDisplayMessage } from "@/lib/api/api-error";
import { queryKeys } from "@/lib/query-keys";
import { formatDuration } from "@/lib/utils/format";
import { tutorialsService } from "@/services/tutorials.service";

export function TutorialDetail({ slug }: { slug: string }) {
  const { data, isPending, isError, error } = useQuery({
    queryKey: queryKeys.tutorial(slug),
    queryFn: () => tutorialsService.tutorial(slug),
  });

  if (isPending) {
    return (
      <div className="space-y-6">
        <div className="aspect-video animate-pulse rounded-card bg-neutral-100" />
        <div className="h-8 w-2/3 animate-pulse rounded bg-neutral-100" />
        <div className="h-4 w-full animate-pulse rounded bg-neutral-100" />
      </div>
    );
  }

  if (isError) return <Alert tone="error">{toDisplayMessage(error)}</Alert>;

  return (
    <article>
      <Link
        href="/tutoriales"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 hover:text-primary-700"
      >
        <ArrowLeft className="size-4" />
        Todos los tutoriales
      </Link>

      <div className="flex aspect-video items-center justify-center rounded-card bg-linear-to-br from-primary-200 via-primary-300 to-secondary-400">
        {data.videoUrl ? (
          <video
            controls
            src={data.videoUrl}
            className="size-full rounded-card object-cover"
          />
        ) : (
          <span className="flex size-16 items-center justify-center rounded-full bg-white/90 text-primary-600 shadow-card">
            <Play className="size-6 fill-current" aria-hidden />
          </span>
        )}
      </div>

      <p className="mt-8 text-[0.65rem] font-bold uppercase tracking-[0.14em] text-primary-500">
        {data.categoryName}
      </p>

      <h1 className="mt-2 font-display text-3xl leading-tight text-secondary-700">
        {data.title}
      </h1>

      <div className="mt-4 flex items-center gap-5 text-xs text-neutral-400">
        <span className="flex items-center gap-1.5">
          <Clock className="size-3.5" aria-hidden />
          {formatDuration(data.durationMinutes)}
        </span>
        <span className="flex items-center gap-1.5 capitalize">
          <Signal className="size-3.5" aria-hidden />
          {data.level}
        </span>
      </div>

      <p className="mt-6 max-w-2xl text-sm leading-relaxed text-neutral-600">
        {data.excerpt}
      </p>
    </article>
  );
}
