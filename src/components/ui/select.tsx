"use client";

import { forwardRef, useId } from "react";

import { cn } from "@/lib/utils/cn";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: SelectOption[];
  /** Opción vacía inicial, ej. "Selecciona…". */
  placeholder?: string;
}

/** Mismo lenguaje visual que <Input>, para formularios mixtos. */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, options, placeholder, className, id, ...props }, ref) => {
    const generatedId = useId();
    const selectId = id ?? generatedId;
    const describedBy = error
      ? `${selectId}-error`
      : hint
        ? `${selectId}-hint`
        : undefined;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={selectId} className="label-field mb-2">
            {label}
          </label>
        )}

        <select
          ref={ref}
          id={selectId}
          defaultValue={props.defaultValue ?? (placeholder ? "" : undefined)}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={describedBy}
          className={cn(
            "h-12 w-full rounded-field border border-neutral-200 bg-white px-4 text-sm text-neutral-700 shadow-field",
            "transition-colors focus:border-primary-400 focus:outline-none focus:ring-4 focus:ring-primary-100",
            "disabled:cursor-not-allowed disabled:bg-neutral-50",
            error && "border-danger focus:border-danger focus:ring-danger/15",
            className,
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {error ? (
          <p id={`${selectId}-error`} className="mt-1.5 text-xs text-danger">
            {error}
          </p>
        ) : hint ? (
          <p id={`${selectId}-hint`} className="mt-1.5 text-xs text-neutral-400">
            {hint}
          </p>
        ) : null}
      </div>
    );
  },
);
Select.displayName = "Select";
