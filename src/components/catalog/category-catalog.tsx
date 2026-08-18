"use client";

import { useQuery } from "@tanstack/react-query";
import { PackageSearch, SlidersHorizontal } from "lucide-react";
import { useState } from "react";

import {
  CatalogFilters,
  emptyFilters,
  MAX_PRICE_LIMIT,
  type CatalogFiltersValue,
} from "@/components/catalog/catalog-filters";
import { Pagination } from "@/components/catalog/pagination";
import { ProductCard } from "@/components/catalog/product-card";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { toDisplayMessage } from "@/lib/api/api-error";
import { queryKeys } from "@/lib/query-keys";
import { catalogService } from "@/services/catalog.service";
import { SORT_OPTIONS, type ProductSort } from "@/types/catalog";

const PAGE_SIZE = 6;

/**
 * Vista de categoría: filtros + orden + grilla + paginación.
 * Todo el estado vive aquí y se traduce a una sola consulta al backend.
 */
export function CategoryCatalog({ category }: { category: string }) {
  const [filters, setFilters] = useState<CatalogFiltersValue>(emptyFilters);
  const [sort, setSort] = useState<ProductSort>("newest");
  const [page, setPage] = useState(1);
  const [showFiltersOnMobile, setShowFiltersOnMobile] = useState(false);

  const query = {
    category,
    treatment: filters.treatment || undefined,
    skinType: filters.skinType || undefined,
    maxPrice: filters.maxPrice < MAX_PRICE_LIMIT ? filters.maxPrice : undefined,
    sort,
    page,
    pageSize: PAGE_SIZE,
  };

  const { data, isPending, isError, error, refetch, isFetching } = useQuery({
    queryKey: queryKeys.products(query),
    queryFn: () => catalogService.products(query),
  });

  function updateFilters(next: CatalogFiltersValue) {
    setFilters(next);
    setPage(1);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
      <div>
        <Button
          variant="outlined"
          size="sm"
          fullWidth
          className="lg:hidden"
          onClick={() => setShowFiltersOnMobile((open) => !open)}
        >
          <SlidersHorizontal className="size-4" />
          {showFiltersOnMobile ? "Ocultar filtros" : "Mostrar filtros"}
        </Button>

        <CatalogFilters
          value={filters}
          onChange={updateFilters}
          className={showFiltersOnMobile ? "mt-6" : "mt-6 hidden lg:block"}
        />
      </div>

      <div>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
          <p className="text-xs text-neutral-500">
            {isPending || !data
              ? "Cargando productos…"
              : `${data.total} ${data.total === 1 ? "producto encontrado" : "productos encontrados"}`}
          </p>

          <label className="flex items-center gap-2 text-xs text-neutral-500">
            Ordenar por
            <select
              value={sort}
              onChange={(event) => {
                setSort(event.target.value as ProductSort);
                setPage(1);
              }}
              className="rounded-field border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 focus:border-primary-400 focus:outline-none"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {isError ? (
          <div className="space-y-4">
            <Alert tone="error">{toDisplayMessage(error)}</Alert>
            <Button variant="outlined" onClick={() => refetch()} isLoading={isFetching}>
              Reintentar
            </Button>
          </div>
        ) : isPending ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: PAGE_SIZE }).map((_, index) => (
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
        ) : data.items.length ? (
          <>
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {data.items.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            <Pagination
              page={data.page}
              totalPages={data.totalPages}
              onPageChange={setPage}
            />
          </>
        ) : (
          <div className="flex flex-col items-center gap-3 rounded-card bg-surface py-20 text-center">
            <PackageSearch className="size-8 text-neutral-300" aria-hidden />
            <p className="text-sm text-neutral-500">
              No hay productos con estos filtros.
            </p>
            <Button variant="secondary" size="sm" onClick={() => updateFilters(emptyFilters)}>
              Limpiar filtros
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
