"use client";

import { SlidersHorizontal } from "lucide-react";

import { cn } from "@/lib/utils/cn";
import { formatPrice } from "@/lib/utils/format";
import { SKIN_TYPE_OPTIONS, TREATMENT_OPTIONS } from "@/types/catalog";

export interface CatalogFiltersValue {
  treatment: string;
  skinType: string;
  maxPrice: number;
}

export const MAX_PRICE_LIMIT = 150;

export const emptyFilters: CatalogFiltersValue = {
  treatment: "",
  skinType: "",
  maxPrice: MAX_PRICE_LIMIT,
};

interface CatalogFiltersProps {
  value: CatalogFiltersValue;
  onChange: (value: CatalogFiltersValue) => void;
  className?: string;
}

export function CatalogFilters({
  value,
  onChange,
  className,
}: CatalogFiltersProps) {
  const isDirty =
    value.treatment !== "" ||
    value.skinType !== "" ||
    value.maxPrice !== MAX_PRICE_LIMIT;

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
            onClick={() => onChange(emptyFilters)}
            className="text-[0.7rem] font-semibold text-primary-600 hover:text-primary-700"
          >
            Limpiar
          </button>
        )}
      </div>

      <FilterGroup
        legend="Tratamiento"
        name="treatment"
        options={TREATMENT_OPTIONS}
        selected={value.treatment}
        onSelect={(treatment) => onChange({ ...value, treatment })}
      />

      <FilterGroup
        legend="Tipo de piel"
        name="skinType"
        options={SKIN_TYPE_OPTIONS}
        selected={value.skinType}
        onSelect={(skinType) => onChange({ ...value, skinType })}
      />

      <fieldset className="mt-7">
        <legend className="text-[0.7rem] font-bold uppercase tracking-[0.12em] text-neutral-500">
          Rango de precios
        </legend>

        <input
          type="range"
          min={10}
          max={MAX_PRICE_LIMIT}
          step={5}
          value={value.maxPrice}
          onChange={(event) =>
            onChange({ ...value, maxPrice: Number(event.target.value) })
          }
          aria-label="Precio máximo"
          className="mt-4 w-full accent-primary-500"
        />

        <div className="mt-1 flex justify-between text-[0.7rem] text-neutral-400">
          <span>{formatPrice(10)}</span>
          <span className="font-semibold text-neutral-600">
            Hasta {formatPrice(value.maxPrice)}
          </span>
        </div>
      </fieldset>
    </aside>
  );
}

function FilterGroup({
  legend,
  name,
  options,
  selected,
  onSelect,
}: {
  legend: string;
  name: string;
  options: readonly { value: string; label: string }[];
  selected: string;
  onSelect: (value: string) => void;
}) {
  return (
    <fieldset className="mt-7 first:mt-0">
      <legend className="text-[0.7rem] font-bold uppercase tracking-[0.12em] text-neutral-500">
        {legend}
      </legend>

      <div className="mt-3 space-y-2.5">
        {options.map((option) => (
          <label
            key={option.value || "all"}
            className="flex cursor-pointer items-center gap-2.5 text-sm text-neutral-600 hover:text-neutral-800"
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={selected === option.value}
              onChange={() => onSelect(option.value)}
              className="size-3.5 accent-primary-500"
            />
            {option.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
