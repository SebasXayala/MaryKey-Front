"use client";

import { SlidersHorizontal } from "lucide-react";

import { cn } from "@/lib/utils/cn";
import { formatPrice } from "@/lib/utils/format";
import type { FilterGroup, PriceRange } from "@/types/catalog";

interface CatalogFiltersProps {
  /** Grupos que definió la categoría en el backend. */
  groups: FilterGroup[];
  priceRange: PriceRange;
  /** Selección actual: { acabado: "mate" }. */
  values: Record<string, string>;
  maxPrice: number;
  onChange: (values: Record<string, string>) => void;
  onMaxPriceChange: (maxPrice: number) => void;
  onReset: () => void;
  isLoading?: boolean;
  className?: string;
}

export function CatalogFilters({
  groups,
  priceRange,
  values,
  maxPrice,
  onChange,
  onMaxPriceChange,
  onReset,
  isLoading = false,
  className,
}: CatalogFiltersProps) {
  const isDirty =
    Object.values(values).some(Boolean) || maxPrice !== priceRange.max;

  if (isLoading) {
    return (
      <aside className={cn("w-full animate-pulse space-y-6", className)}>
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="space-y-2.5">
            <div className="h-3 w-24 rounded bg-neutral-100" />
            <div className="h-3 w-20 rounded bg-neutral-100" />
            <div className="h-3 w-16 rounded bg-neutral-100" />
            <div className="h-3 w-20 rounded bg-neutral-100" />
          </div>
        ))}
      </aside>
    );
  }

  return (
    <aside className={cn("w-full", className)}>
      <div className="mb-5 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-neutral-700">
          Filtros
          <SlidersHorizontal className="size-3.5 text-primary-500" aria-hidden />
        </h2>

        {isDirty && (
          <button
            type="button"
            onClick={onReset}
            className="text-[0.7rem] font-semibold text-primary-600 hover:text-primary-700"
          >
            Limpiar
          </button>
        )}
      </div>

      {groups.map((group) => (
        <fieldset key={group.key} className="mt-7 first:mt-0">
          <legend className="text-[0.7rem] font-bold uppercase tracking-[0.12em] text-neutral-500">
            {group.label}
          </legend>

          <div className="mt-3 space-y-2.5">
            {group.options.map((option) => (
              <label
                key={`${group.key}-${option.value || "all"}`}
                className="flex cursor-pointer items-center gap-2.5 text-sm text-neutral-600 hover:text-neutral-800"
              >
                <input
                  type="radio"
                  name={group.key}
                  value={option.value}
                  checked={(values[group.key] ?? "") === option.value}
                  onChange={() =>
                    onChange({ ...values, [group.key]: option.value })
                  }
                  className="size-3.5 accent-primary-500"
                />
                {option.label}
              </label>
            ))}
          </div>
        </fieldset>
      ))}

      <fieldset className="mt-7">
        <legend className="text-[0.7rem] font-bold uppercase tracking-[0.12em] text-neutral-500">
          Rango de precios
        </legend>

        <input
          type="range"
          min={priceRange.min}
          max={priceRange.max}
          step={Math.max(1000, Math.round((priceRange.max - priceRange.min) / 20))}
          value={maxPrice}
          onChange={(event) => onMaxPriceChange(Number(event.target.value))}
          aria-label="Precio máximo"
          className="mt-4 w-full accent-primary-500"
        />

        <div className="mt-1 flex justify-between text-[0.7rem] text-neutral-400">
          <span>{formatPrice(priceRange.min)}</span>
          <span className="font-semibold text-neutral-600">
            Hasta {formatPrice(maxPrice)}
          </span>
        </div>
      </fieldset>
    </aside>
  );
}
