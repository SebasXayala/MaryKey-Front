import { ArrowRight, Clock, Play } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { formatDuration } from "@/lib/utils/format";
import type { Tutorial } from "@/types/tutorial";

export function TutorialCard({ tutorial }: { tutorial: Tutorial }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-card bg-white shadow-card transition-shadow hover:shadow-lg">
      <Link
        href={`/tutoriales/${tutorial.slug}`}
        className="relative flex aspect-16/10 items-center justify-center bg-linear-to-br from-primary-100 via-primary-200 to-secondary-300"
      >
        {tutorial.coverUrl && (
          <Image
            src={tutorial.coverUrl}
            alt={tutorial.title}
            fill
            sizes="(min-width: 1024px) 33vw, 100vw"
            className="object-cover"
          />
        )}

        <span className="relative flex size-11 items-center justify-center rounded-full bg-white/90 text-primary-600 transition-transform group-hover:scale-105">
          <Play className="size-4 fill-current" aria-hidden />
        </span>

        <span className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-neutral-900/70 px-2.5 py-1 text-[0.65rem] font-semibold text-white">
          <Clock className="size-3" aria-hidden />
          {formatDuration(tutorial.durationMinutes)}
        </span>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-[0.6rem] font-bold uppercase tracking-[0.14em] text-primary-500">
          {tutorial.categoryName}
        </p>

        <h3 className="mt-2 font-display text-lg leading-snug text-neutral-700">
          {tutorial.title}
        </h3>

        <p className="mt-2 line-clamp-3 flex-1 text-xs leading-relaxed text-neutral-500">
          {tutorial.excerpt}
        </p>

        <Link
          href={`/tutoriales/${tutorial.slug}`}
          className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-primary-600 hover:text-primary-700"
        >
          Ver Ahora
          <ArrowRight className="size-3.5" />
        </Link>
      </div>
    </article>
  );
}
