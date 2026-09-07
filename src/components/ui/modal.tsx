"use client";

import { X } from "lucide-react";
import { useEffect } from "react";

import { cn } from "@/lib/utils/cn";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  /** Botones del pie; se alinean a la derecha. */
  footer?: React.ReactNode;
  className?: string;
}

/**
 * Diálogo modal simple: fondo oscuro, cierre con Escape o clic fuera y
 * bloqueo del scroll de la página mientras está abierto.
 */
export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  className,
}: ModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-100 flex items-end justify-center bg-neutral-900/40 p-0 sm:items-center sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          "max-h-[92dvh] w-full overflow-y-auto rounded-t-card bg-white p-6 shadow-card sm:max-w-lg sm:rounded-card",
          className,
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl text-neutral-700">{title}</h2>
            {description && (
              <p className="mt-1 text-xs leading-relaxed text-neutral-500">
                {description}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="rounded-full p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="mt-5">{children}</div>

        {footer && (
          <div className="mt-6 flex flex-wrap justify-end gap-3">{footer}</div>
        )}
      </div>
    </div>
  );
}
