"use client";

import { useQuery } from "@tanstack/react-query";
import { PackageSearch } from "lucide-react";

import { ProductCard } from "@/components/catalog/product-card";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { toDisplayMessage } from "@/lib/api/api-error";
import { queryKeys } from "@/lib/query-keys";
import { catalogService } from "@/services/catalog.service";
import type { ProductQuery } from "@/types/catalog";

/**
 * Listado conectado al backend: maneja carga, error, vacío y reintento.
 */
export function ProductGrid({ query }: { query: ProductQuery }) {
  const { data, isPending, isError, error, refetch, isFetching } = useQuery({
    queryKey: queryKeys.products(query),
    queryFn: () => catalogService.products(query),
  });

  if (isPending) {
    return (
      <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="animate-pulse overflow-hidden rounded-card bg-white shadow-card"
          >
            <div className="aspect-square bg-neutral-100" />
            <div className="space-y-2 p-4">
              <div className="h-3 w-1/3 rounded bg-neutral-100" />
              <div className="h-3.5 w-3/4 rounded bg-neutral-100" />
              <div className="h-9 w-full rounded-field bg-neutral-100" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-4">
        <Alert tone="error">{toDisplayMessage(error)}</Alert>
        <Button variant="outlined" onClick={() => refetch()} isLoading={isFetching}>
          Reintentar
        </Button>
      </div>
    );
  }

  if (!data.items.length) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-card bg-surface py-20 text-center">
        <PackageSearch className="size-8 text-neutral-300" aria-hidden />
        <p className="text-sm text-neutral-500">
          No encontramos productos con estos criterios.
        </p>
      </div>
    );
  }

  return (
    <>
      <p className="mb-5 text-xs text-neutral-400">
        {data.total} {data.total === 1 ? "producto" : "productos"}
      </p>
      <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
        {data.items.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </>
  );
}
