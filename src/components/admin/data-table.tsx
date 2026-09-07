"use client";

import { Loader2, PackageSearch } from "lucide-react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { toDisplayMessage } from "@/lib/api/api-error";
import { cn } from "@/lib/utils/cn";

export interface Column<T> {
  key: string;
  header: string;
  /** Clases de la celda; sirve para alinear números a la derecha. */
  className?: string;
  render: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[] | undefined;
  rowKey: (row: T) => string | number;
  isLoading?: boolean;
  isError?: boolean;
  error?: unknown;
  onRetry?: () => void;
  emptyMessage?: string;
}

/** Tabla del panel con sus tres estados: cargando, error y vacía. */
export function DataTable<T>({
  columns,
  rows,
  rowKey,
  isLoading = false,
  isError = false,
  error,
  onRetry,
  emptyMessage = "No hay registros todavía.",
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center rounded-card bg-white py-16 shadow-card">
        <Loader2
          className="size-5 animate-spin text-primary-500"
          aria-label="Cargando"
        />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-4 rounded-card bg-white p-6 shadow-card">
        <Alert tone="error">{toDisplayMessage(error)}</Alert>
        {onRetry && (
          <Button variant="outlined" size="sm" onClick={onRetry}>
            Reintentar
          </Button>
        )}
      </div>
    );
  }

  if (!rows?.length) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-card bg-white py-16 text-center shadow-card">
        <PackageSearch className="size-8 text-neutral-300" aria-hidden />
        <p className="text-sm text-neutral-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-card bg-white shadow-card">
      <table className="w-full min-w-[40rem] border-collapse text-sm">
        <thead>
          <tr className="border-b border-line text-left">
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={cn(
                  "px-4 py-3 text-[0.7rem] font-bold uppercase tracking-[0.12em] text-neutral-500",
                  column.className,
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.map((row) => (
            <tr
              key={rowKey(row)}
              className="border-b border-line last:border-b-0 hover:bg-neutral-50"
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={cn("px-4 py-3 text-neutral-600", column.className)}
                >
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
