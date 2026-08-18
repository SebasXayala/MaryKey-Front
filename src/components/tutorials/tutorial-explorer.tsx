"use client";

import { useQuery } from "@tanstack/react-query";
import { BookOpen, Search } from "lucide-react";
import { useState } from "react";

import { TutorialCard } from "@/components/tutorials/tutorial-card";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { toDisplayMessage } from "@/lib/api/api-error";
import { queryKeys } from "@/lib/query-keys";
import { cn } from "@/lib/utils/cn";
import { tutorialsService } from "@/services/tutorials.service";

/**
 * "Explora por Categoría": chips de tema + buscador + grilla de tutoriales.
 * Los temas los sirve el backend (`/tutorials/topics`).
 */
export function TutorialExplorer() {
  const [topic, setTopic] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const { data: topics } = useQuery({
    queryKey: queryKeys.tutorialTopics,
    queryFn: () => tutorialsService.topics(),
    staleTime: 10 * 60_000,
  });

  const query = {
    category: topic || undefined,
    search: search || undefined,
    pageSize: 9,
  };

  const { data, isPending, isError, error, refetch, isFetching } = useQuery({
    queryKey: queryKeys.tutorials(query),
    queryFn: () => tutorialsService.list(query),
  });

  return (
    <section id="tutoriales" className="scroll-mt-24">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-display text-2xl text-neutral-700">
          Explora por Categoría
        </h2>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            setSearch(searchInput.trim());
          }}
          role="search"
          className="flex w-full max-w-xs items-center gap-2 rounded-full border border-primary-200 bg-white px-4 py-2.5 sm:w-auto"
        >
          <input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="¿Qué quieres aprender hoy?"
            aria-label="Buscar tutoriales"
            className="w-full bg-transparent text-xs text-neutral-700 placeholder:text-neutral-400 focus:outline-none"
          />
          <button
            type="submit"
            aria-label="Buscar"
            className="text-primary-500 hover:text-primary-600"
          >
            <Search className="size-4" />
          </button>
        </form>
      </div>

      <div className="mb-8 flex flex-wrap gap-2.5">
        {(topics ?? []).map((item) => (
          <button
            key={item.slug || "todos"}
            type="button"
            onClick={() => setTopic(item.slug)}
            aria-pressed={topic === item.slug}
            className={cn(
              "rounded-full px-4 py-2 text-xs font-semibold transition-colors",
              topic === item.slug
                ? "bg-primary-500 text-white"
                : "bg-primary-50 text-primary-700 hover:bg-primary-100",
            )}
          >
            {item.name}
          </button>
        ))}
      </div>

      {isError ? (
        <div className="space-y-4">
          <Alert tone="error">{toDisplayMessage(error)}</Alert>
          <Button variant="outlined" onClick={() => refetch()} isLoading={isFetching}>
            Reintentar
          </Button>
        </div>
      ) : isPending ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="animate-pulse overflow-hidden rounded-card bg-white shadow-card"
            >
              <div className="aspect-16/10 bg-neutral-100" />
              <div className="space-y-2 p-5">
                <div className="h-3 w-1/4 rounded bg-neutral-100" />
                <div className="h-4 w-3/4 rounded bg-neutral-100" />
                <div className="h-3 w-full rounded bg-neutral-100" />
              </div>
            </div>
          ))}
        </div>
      ) : data.items.length ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {data.items.map((tutorial) => (
            <TutorialCard key={tutorial.id} tutorial={tutorial} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-card bg-surface py-16 text-center">
          <BookOpen className="size-8 text-neutral-300" aria-hidden />
          <p className="text-sm text-neutral-500">
            Todavía no hay tutoriales para esta búsqueda.
          </p>
        </div>
      )}
    </section>
  );
}
