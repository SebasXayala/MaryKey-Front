"use client";

import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowRight,
  FolderTree,
  Package,
  Users,
  Wallet,
} from "lucide-react";
import Link from "next/link";

import { DataTable, type Column } from "@/components/admin/data-table";
import { Alert } from "@/components/ui/alert";
import { IS_ADMIN_OPEN } from "@/lib/auth/permissions";
import { queryKeys } from "@/lib/query-keys";
import { formatPrice } from "@/lib/utils/format";
import {
  adminCategoriesService,
  adminCustomersService,
  adminProductsService,
} from "@/services/admin.service";
import type { BackendProduct } from "@/services/backend-catalog";

/** Debajo de esto un producto se considera por agotarse. */
const LOW_STOCK = 5;

export function AdminDashboard() {
  const products = useQuery({
    queryKey: queryKeys.admin.products,
    queryFn: () => adminProductsService.list(),
  });

  const categories = useQuery({
    queryKey: queryKeys.admin.categories,
    queryFn: () => adminCategoriesService.list(),
  });

  const customers = useQuery({
    queryKey: queryKeys.admin.customers,
    queryFn: () => adminCustomersService.list(),
  });

  const items = products.data ?? [];
  const inventoryValue = items.reduce(
    (total, product) => total + Number(product.price) * product.stock,
    0,
  );
  const lowStock = items
    .filter((product) => product.stock <= LOW_STOCK)
    .sort((a, b) => a.stock - b.stock);

  const cards = [
    {
      label: "Productos",
      value: products.isPending ? "…" : items.length,
      detail: `${items.filter((item) => item.isActive).length} visibles en la tienda`,
      icon: Package,
      href: "/admin/productos",
    },
    {
      label: "Categorías",
      value: categories.isPending ? "…" : (categories.data?.length ?? 0),
      detail: "Arman el menú de la tienda",
      icon: FolderTree,
      href: "/admin/categorias",
    },
    {
      label: "Clientes",
      value: customers.isPending ? "…" : (customers.data?.length ?? 0),
      detail: "Cuentas registradas",
      icon: Users,
      href: "/admin/clientes",
    },
    {
      label: "Valor del inventario",
      value: products.isPending ? "…" : formatPrice(inventoryValue),
      detail: "Precio por unidades en stock",
      icon: Wallet,
      href: "/admin/productos",
    },
  ];

  const columns: Column<BackendProduct>[] = [
    {
      key: "name",
      header: "Producto",
      render: (product) => (
        <span className="font-semibold text-neutral-700">{product.name}</span>
      ),
    },
    {
      key: "category",
      header: "Categoría",
      render: (product) => product.category?.name ?? "—",
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
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl text-neutral-700">Resumen</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Estado del catálogo y de las cuentas de la tienda.
        </p>
      </div>

      {IS_ADMIN_OPEN && (
        <Alert tone="info" className="mb-6">
          El panel está abierto a cualquier sesión iniciada. Para limitarlo,
          define <strong>NEXT_PUBLIC_ADMIN_EMAILS</strong> con los correos de
          las administradoras.
        </Alert>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="group rounded-card bg-white p-5 shadow-card transition-shadow hover:shadow-lg"
          >
            <div className="flex items-center justify-between">
              <span className="text-[0.7rem] font-bold uppercase tracking-[0.12em] text-neutral-500">
                {card.label}
              </span>
              <card.icon className="size-4 text-primary-400" aria-hidden />
            </div>
            <p className="mt-3 text-2xl font-semibold text-neutral-700">
              {card.value}
            </p>
            <p className="mt-1 text-xs text-neutral-400">{card.detail}</p>
          </Link>
        ))}
      </div>

      <section className="mt-10">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-neutral-700">
            <AlertTriangle className="size-4 text-primary-500" aria-hidden />
            Por reponer (stock ≤ {LOW_STOCK})
          </h2>
          <Link
            href="/admin/productos"
            className="flex items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-700"
          >
            Ver todos
            <ArrowRight className="size-3.5" />
          </Link>
        </div>

        <DataTable
          columns={columns}
          rows={lowStock}
          rowKey={(product) => product.id}
          isLoading={products.isPending}
          isError={products.isError}
          error={products.error}
          onRetry={() => void products.refetch()}
          emptyMessage="Todo el catálogo tiene stock suficiente."
        />
      </section>
    </div>
  );
}
