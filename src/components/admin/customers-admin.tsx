"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { CustomerForm } from "@/components/admin/customer-form";
import { DataTable, type Column } from "@/components/admin/data-table";
import { Input } from "@/components/ui/input";
import { queryKeys } from "@/lib/query-keys";
import { initials } from "@/lib/utils/format";
import { adminCustomersService } from "@/services/admin.service";
import { splitName, type BackendUser } from "@/services/backend-user";

const GENDER_LABELS: Record<string, string> = {
  female: "Femenino",
  male: "Masculino",
};

function formatDate(value?: string) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function CustomersAdmin() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<BackendUser | null>(null);
  const [deleting, setDeleting] = useState<BackendUser | null>(null);

  const customers = useQuery({
    queryKey: queryKeys.admin.customers,
    queryFn: () => adminCustomersService.list(),
  });

  const removeMutation = useMutation({
    mutationFn: (id: number) => adminCustomersService.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.admin.customers,
      });
      setDeleting(null);
    },
  });

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return customers.data ?? [];

    return (customers.data ?? []).filter(
      (customer) =>
        customer.name?.toLowerCase().includes(term) ||
        customer.email?.toLowerCase().includes(term),
    );
  }, [customers.data, search]);

  const columns: Column<BackendUser>[] = [
    {
      key: "name",
      header: "Clienta",
      render: (customer) => {
        const { firstName, lastName } = splitName(customer.name);

        return (
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-[0.7rem] font-bold text-primary-700">
              {initials(firstName, lastName)}
            </span>
            <div className="min-w-0">
              <p className="truncate font-semibold text-neutral-700">
                {customer.name}
              </p>
              <p className="truncate text-xs text-neutral-400">
                {customer.email}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      key: "age",
      header: "Edad",
      className: "text-right",
      render: (customer) => customer.age ?? "—",
    },
    {
      key: "gender",
      header: "Género",
      render: (customer) =>
        customer.gender ? GENDER_LABELS[customer.gender] : "—",
    },
    {
      key: "role",
      header: "Rol",
      render: (customer) =>
        customer.roles?.name ?? (
          <span className="text-neutral-400">Sin asignar</span>
        ),
    },
    {
      key: "createdAt",
      header: "Alta",
      render: (customer) => formatDate(customer.createdAt),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (customer) => (
        <div className="flex justify-end gap-1">
          <button
            type="button"
            aria-label={`Editar ${customer.name}`}
            onClick={() => setEditing(customer)}
            className="rounded-field p-2 text-neutral-500 transition-colors hover:bg-primary-50 hover:text-primary-700"
          >
            <Pencil className="size-4" />
          </button>
          <button
            type="button"
            aria-label={`Eliminar ${customer.name}`}
            onClick={() => setDeleting(customer)}
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
      <div className="mb-6">
        <h1 className="text-2xl text-neutral-700">Clientes</h1>
        <p className="mt-1 text-sm text-neutral-500">
          {customers.data?.length ?? 0} cuenta(s) registradas en la tienda.
        </p>
      </div>

      <div className="mb-5 max-w-sm">
        <Input
          placeholder="Buscar por nombre o correo"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          aria-label="Buscar clientes"
        />
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(customer) => customer.id}
        isLoading={customers.isPending}
        isError={customers.isError}
        error={customers.error}
        onRetry={() => void customers.refetch()}
        emptyMessage={
          customers.data?.length
            ? "Ninguna clienta coincide con la búsqueda."
            : "Todavía no hay clientas registradas."
        }
      />

      <CustomerForm
        isOpen={Boolean(editing)}
        onClose={() => setEditing(null)}
        customer={editing}
      />

      <ConfirmDialog
        isOpen={Boolean(deleting)}
        title="Eliminar clienta"
        description={`Se eliminará la cuenta de ${deleting?.name} (${deleting?.email}).`}
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
