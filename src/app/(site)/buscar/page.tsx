import type { Metadata } from "next";

import { ProductGrid } from "@/components/catalog/product-grid";

export const metadata: Metadata = {
  title: "Búsqueda",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl text-neutral-700">Resultados</h1>
      <p className="mb-8 mt-2 text-sm text-neutral-500">
        {q ? (
          <>
            Búsqueda para <strong className="text-neutral-700">“{q}”</strong>
          </>
        ) : (
          "Escribe algo en el buscador para empezar."
        )}
      </p>

      {q && <ProductGrid query={{ search: q, pageSize: 12 }} />}
    </div>
  );
}
