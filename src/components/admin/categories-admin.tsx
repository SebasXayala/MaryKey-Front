"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { CategoryForm } from "@/components/admin/category-form";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { DataTable, type Column } from "@/components/admin/data-table";
import { Button } from "@/components/ui/button";
import { queryKeys } from "@/lib/query-keys";
import {
  adminCategoriesService,
  adminProductsService,
} from "@/services/admin.service";
import { slugify, type BackendCategory } from "@/services/backend-catalog";

export function CategoriesAdmin() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<BackendCategory | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleting, setDeleting] = useState<BackendCategory | null>(null);

  const categories = useQuery({
    queryKey: queryKeys.admin.categories,
    queryFn: () => adminCategoriesService.list(),
  });

  // Solo para contar cuántos productos cuelgan de cada categoría.
  const products = useQuery({
    queryKey: queryKeys.admin.products,
    queryFn: () => adminProductsService.list(),
  });

  const removeMutation = useMutation({
    mutationFn: (id: number) => adminCategoriesService.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.admin.categories,
      });
      void queryClient.invalidateQueries({ queryKey: ["catalog"] });
      setDeleting(null);
    },
  });

  const countProducts = (categoryId: number) =>
    (products.data ?? []).filter((product) => product.category?.id === categoryId)
      .length;

  const columns: Column<BackendCategory>[] = [
    {
      key: "name",
      header: "Categoría",
      render: (category) => (
        <div className="min-w-0">
          <p className="truncate font-semibold text-neutral-700">
            {category.name}
          </p>
          <Link
            href={`/categoria/${slugify(category.name)}`}
            className="text-xs text-primary-600 hover:text-primary-700"
          >
            /categoria/{slugify(category.name)}
          </Link>
        </div>
      ),
    },
    {
      key: "description",
      header: "Descripción",
      render: (category) => (
        <span className="text-neutral-500">{category.description || "—"}</span>
      ),
    },
    {
      key: "products",
      header: "Productos",
      className: "text-right",
      render: (category) =>
        products.isPending ? "…" : countProducts(category.id),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (category) => (
        <div className="flex justify-end gap-1">
          <button
            type="button"
            aria-label={`Editar ${category.name}`}
            onClick={() => {
              setEditing(category);
              setIsFormOpen(true);
            }}
            className="rounded-field p-2 text-neutral-500 transition-colors hover:bg-primary-50 hover:text-primary-700"
          >
            <Pencil className="size-4" />
          </button>
          <button
            type="button"
            aria-label={`Eliminar ${category.name}`}
            onClick={() => setDeleting(category)}
            className="rounded-field p-2 text-neutral-500 transition-colors hover:bg-danger/10 hover:text-danger"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      ),
    },
  ];

  const productsInCategory = deleting ? countProducts(deleting.id) : 0;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl text-neutral-700">Categorías</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Arman el menú de la tienda y agrupan el catálogo.
          </p>
        </div>

        <Button
          onClick={() => {
            setEditing(null);
            setIsFormOpen(true);
          }}
        >
          <Plus className="size-4" />
          Nueva categoría
        </Button>
      </div>

      <DataTable
        columns={columns}
        rows={categories.data}
        rowKey={(category) => category.id}
        isLoading={categories.isPending}
        isError={categories.isError}
        error={categories.error}
        onRetry={() => void categories.refetch()}
        emptyMessage="Todavía no hay categorías. Crea la primera."
      />

      <CategoryForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        category={editing}
      />

      <ConfirmDialog
        isOpen={Boolean(deleting)}
        title="Eliminar categoría"
        description={
          productsInCategory > 0
            ? `"${deleting?.name}" tiene ${productsInCategory} producto(s). El backend no permite borrarla mientras existan.`
            : `Se eliminará "${deleting?.name}".`
        }
        isLoading={removeMutation.isPending}
        error={removeMutation.error}
        onConfirm={() => deleting && removeMutation.mutate(deleting.id)}
        onClose={() => {
          setDeleting(null);
          removeMutation.reset();
        }}
      />
    </div>
  );
}
