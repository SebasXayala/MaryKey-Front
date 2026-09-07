"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { DataTable, type Column } from "@/components/admin/data-table";
import { ProductForm } from "@/components/admin/product-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { queryKeys } from "@/lib/query-keys";
import { formatPrice } from "@/lib/utils/format";
import {
  adminCategoriesService,
  adminProductsService,
} from "@/services/admin.service";
import type { BackendProduct } from "@/services/backend-catalog";

export function ProductsAdmin() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [editing, setEditing] = useState<BackendProduct | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleting, setDeleting] = useState<BackendProduct | null>(null);

  const products = useQuery({
    queryKey: queryKeys.admin.products,
    queryFn: () => adminProductsService.list(),
  });

  const categories = useQuery({
    queryKey: queryKeys.admin.categories,
    queryFn: () => adminCategoriesService.list(),
  });

  const removeMutation = useMutation({
    mutationFn: (id: number) => adminProductsService.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.products });
      void queryClient.invalidateQueries({ queryKey: ["catalog"] });
      setDeleting(null);
    },
  });

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();

    return (products.data ?? []).filter((product) => {
      const matchesTerm =
        !term ||
        product.name.toLowerCase().includes(term) ||
        (product.description ?? "").toLowerCase().includes(term);
      const matchesCategory =
        !categoryId || String(product.category?.id ?? "") === categoryId;

      return matchesTerm && matchesCategory;
    });
  }, [products.data, search, categoryId]);

  const columns: Column<BackendProduct>[] = [
    {
      key: "name",
      header: "Producto",
      render: (product) => (
        <div className="min-w-0">
          <p className="truncate font-semibold text-neutral-700">
            {product.name}
          </p>
          {product.description && (
            <p className="truncate text-xs text-neutral-400">
              {product.description}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "category",
      header: "Categoría",
      render: (product) => product.category?.name ?? "—",
    },
    {
      key: "price",
      header: "Precio",
      className: "text-right",
      render: (product) => formatPrice(Number(product.price)),
    },
    {
      key: "stock",
      header: "Stock",
      className: "text-right",
      render: (product) => (
        <span
          className={
            product.stock > 0 ? "text-neutral-600" : "font-semibold text-danger"
          }
        >
          {product.stock}
        </span>
      ),
    },
    {
      key: "isActive",
      header: "Estado",
      render: (product) => (
        <span
          className={`inline-block rounded-full px-2.5 py-1 text-[0.7rem] font-semibold ${
            product.isActive
              ? "bg-success/10 text-success"
              : "bg-neutral-100 text-neutral-500"
          }`}
        >
          {product.isActive ? "Visible" : "Oculto"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (product) => (
        <div className="flex justify-end gap-1">
          <button
            type="button"
            aria-label={`Editar ${product.name}`}
            onClick={() => {
              setEditing(product);
              setIsFormOpen(true);
            }}
            className="rounded-field p-2 text-neutral-500 transition-colors hover:bg-primary-50 hover:text-primary-700"
          >
            <Pencil className="size-4" />
          </button>
          <button
            type="button"
            aria-label={`Eliminar ${product.name}`}
            onClick={() => setDeleting(product)}
            className="rounded-field p-2 text-neutral-500 transition-colors hover:bg-danger/10 hover:text-danger"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl text-neutral-700">Productos</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {products.data?.length ?? 0} en el catálogo.
          </p>
        </div>

        <Button
          onClick={() => {
            setEditing(null);
            setIsFormOpen(true);
          }}
          disabled={!categories.data?.length}
        >
          <Plus className="size-4" />
          Nuevo producto
        </Button>
      </div>

      {!categories.isPending && !categories.data?.length && (
        <p className="mb-6 rounded-field border border-primary-200 bg-primary-50 px-4 py-3 text-xs text-primary-700">
          Crea primero una categoría: cada producto debe pertenecer a una.
        </p>
      )}

      <div className="mb-5 grid gap-3 sm:grid-cols-[1fr_14rem]">
        <Input
          placeholder="Buscar por nombre o descripción"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          aria-label="Buscar productos"
        />
        <Select
          aria-label="Filtrar por categoría"
          value={categoryId}
          onChange={setCategoryId}
          placeholder="Todas las categorías"
          allowEmpty
          options={(categories.data ?? []).map((category) => ({
            value: String(category.id),
            label: category.name,
          }))}
        />
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(product) => product.id}
        isLoading={products.isPending}
        isError={products.isError}
        error={products.error}
        onRetry={() => void products.refetch()}
        emptyMessage={
          products.data?.length
            ? "Ningún producto coincide con el filtro."
            : "Todavía no hay productos. Crea el primero."
        }
      />

      <ProductForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        product={editing}
        categories={categories.data ?? []}
      />

      <ConfirmDialog
        isOpen={Boolean(deleting)}
        title="Eliminar producto"
        description={`Se eliminará "${deleting?.name}" del catálogo.`}
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
