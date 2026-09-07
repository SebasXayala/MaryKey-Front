"use client";

import { Check, ChevronDown } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState } from "react";

import { useClickOutside } from "@/lib/hooks/use-click-outside";
import { cn } from "@/lib/utils/cn";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  label?: string;
  error?: string;
  hint?: string;
  options: SelectOption[];
  /** Texto cuando no hay nada elegido, ej. "Selecciona…". */
  placeholder?: string;
  /** Deja elegible la opción vacía (filtros, campos opcionales). */
  allowEmpty?: boolean;
  value?: string | number | null;
  onChange: (value: string) => void;
  onBlur?: () => void;
  name?: string;
  id?: string;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
}

/**
 * Desplegable propio (no un `<select>`).
 *
 * El nativo pinta su lista con el estilo del sistema operativo —fuente,
 * azul de selección— y eso no se puede cambiar con CSS. Aquí la lista es
 * marcado normal, así que sigue el mismo lenguaje visual que el resto del
 * formulario, y se conservan el rol `listbox` y el manejo de teclado para
 * que funcione igual sin ratón.
 */
export function Select({
  label,
  error,
  hint,
  options,
  placeholder = "Selecciona…",
  allowEmpty = false,
  value,
  onChange,
  onBlur,
  name,
  id,
  disabled = false,
  className,
  "aria-label": ariaLabel,
}: SelectProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const listId = `${selectId}-list`;

  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);

  const current = value === null || value === undefined ? "" : String(value);

  /** La opción vacía se ofrece como una más cuando está permitida. */
  const items: SelectOption[] = allowEmpty
    ? [{ value: "", label: placeholder }, ...options]
    : options;

  const selected = items.find((option) => option.value === current);

  const close = useCallback(() => setIsOpen(false), []);
  useClickOutside(containerRef, close, isOpen);

  /** Al abrir, el resaltado arranca en la opción ya elegida. */
  function open() {
    const index = items.findIndex((option) => option.value === current);
    setHighlighted(index >= 0 ? index : 0);
    setIsOpen(true);
  }

  // Mantiene visible la opción resaltada al navegar con el teclado.
  useEffect(() => {
    if (!isOpen) return;
    listRef.current?.children[highlighted]?.scrollIntoView({ block: "nearest" });
  }, [isOpen, highlighted]);

  function choose(option: SelectOption) {
    onChange(option.value);
    setIsOpen(false);
    onBlur?.();
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    if (disabled) return;

    if (!isOpen) {
      if (["Enter", " ", "ArrowDown", "ArrowUp"].includes(event.key)) {
        event.preventDefault();
        open();
      }
      return;
    }

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setHighlighted((index) => Math.min(index + 1, items.length - 1));
        break;
      case "ArrowUp":
        event.preventDefault();
        setHighlighted((index) => Math.max(index - 1, 0));
        break;
      case "Home":
        event.preventDefault();
        setHighlighted(0);
        break;
      case "End":
        event.preventDefault();
        setHighlighted(items.length - 1);
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        if (items[highlighted]) choose(items[highlighted]);
        break;
      case "Tab":
        setIsOpen(false);
        break;
    }
  }

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="label-field mb-2">
          {label}
        </label>
      )}

      <div ref={containerRef} className="relative">
        <button
          type="button"
          id={selectId}
          name={name}
          disabled={disabled}
          onClick={() => (isOpen ? setIsOpen(false) : open())}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            if (!isOpen) onBlur?.();
          }}
          role="combobox"
          aria-controls={listId}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-label={ariaLabel}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={
            error
              ? `${selectId}-error`
              : hint
                ? `${selectId}-hint`
                : undefined
          }
          className={cn(
            "flex h-12 w-full items-center justify-between gap-2 rounded-field border border-neutral-200 bg-white px-4 text-left text-sm shadow-field",
            "transition-colors hover:border-neutral-300 focus:border-primary-400 focus:outline-none focus:ring-4 focus:ring-primary-100",
            "disabled:cursor-not-allowed disabled:bg-neutral-50",
            selected && selected.value ? "text-neutral-700" : "text-neutral-400",
            error && "border-danger focus:border-danger focus:ring-danger/15",
            className,
          )}
        >
          <span className="truncate">{selected?.label ?? placeholder}</span>
          <ChevronDown
            className={cn(
              "size-4 shrink-0 text-neutral-400 transition-transform",
              isOpen && "rotate-180",
            )}
            aria-hidden
          />
        </button>

        {isOpen && (
          <ul
            ref={listRef}
            id={listId}
            role="listbox"
            aria-label={label ?? ariaLabel}
            tabIndex={-1}
            className="absolute z-50 mt-1.5 max-h-60 w-full overflow-y-auto rounded-card border border-line bg-white py-1.5 shadow-card"
          >
            {items.length === 0 && (
              <li className="px-4 py-2.5 text-sm text-neutral-400">
                No hay opciones.
              </li>
            )}

            {items.map((option, index) => {
              const isSelected = option.value === current;

              return (
                <li key={option.value || "__empty"}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onMouseEnter={() => setHighlighted(index)}
                    onClick={() => choose(option)}
                    className={cn(
                      "flex w-full items-center justify-between gap-2 px-4 py-2.5 text-left text-sm transition-colors",
                      index === highlighted
                        ? "bg-primary-50 text-primary-700"
                        : "text-neutral-600",
                      isSelected && "font-semibold text-primary-700",
                      !option.value && "text-neutral-400",
                    )}
                  >
                    <span className="truncate">{option.label}</span>
                    {isSelected && (
                      <Check className="size-4 shrink-0 text-primary-500" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

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
}
