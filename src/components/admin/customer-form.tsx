"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { ApiError, toDisplayMessage } from "@/lib/api/api-error";
import { queryKeys } from "@/lib/query-keys";
import {
  customerSchema,
  type CustomerFormValues,
} from "@/lib/validation/admin-schemas";
import {
  adminCustomersService,
  type CustomerInput,
} from "@/services/admin.service";
import type { BackendUser } from "@/services/backend-user";

interface CustomerFormProps {
  isOpen: boolean;
  onClose: () => void;
  customer: BackendUser | null;
}

const EMPTY: CustomerFormValues = {
  name: "",
  age: 18,
  gender: "female",
  email: "",
  role_id: "",
};

/**
 * Edición de una clienta. No hay alta desde aquí a propósito: las cuentas
 * se crean desde el registro de la tienda, que además guarda la contraseña
 * cifrada (`POST /users` la guardaría en texto plano).
 */
export function CustomerForm({ isOpen, onClose, customer }: CustomerFormProps) {
  const queryClient = useQueryClient();

  const roles = useQuery({
    queryKey: queryKeys.admin.roles,
    queryFn: () => adminCustomersService.roles(),
    staleTime: 10 * 60_000,
  });

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: EMPTY,
  });

  useEffect(() => {
    if (!isOpen || !customer) return;

    reset({
      name: customer.name,
      age: customer.age,
      gender: customer.gender ?? "female",
      email: customer.email,
      role_id: customer.roles?.id ? String(customer.roles.id) : "",
    });
  }, [isOpen, customer, reset]);

  const mutation = useMutation({
    mutationFn: (values: CustomerFormValues) => {
      const input: CustomerInput = {
        name: values.name,
        age: values.age,
        gender: values.gender,
        email: values.email,
      };

      if (values.role_id) input.role_id = Number(values.role_id);

      return adminCustomersService.update(customer!.id, input);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.admin.customers,
      });
      onClose();
    },
    onError: (error) => {
      if (error instanceof ApiError && error.fieldErrors) {
        for (const [field, message] of Object.entries(error.fieldErrors)) {
          if (field in EMPTY) {
            setError(field as keyof CustomerFormValues, { message });
          }
        }
      }
    },
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Editar clienta"
      description="Los datos son los que la clienta registró en la tienda."
      footer={
        <>
          <Button
            variant="outlined"
            onClick={onClose}
            disabled={mutation.isPending}
          >
            Cancelar
          </Button>
          <Button
            form="customer-form"
            type="submit"
            isLoading={mutation.isPending}
          >
            Guardar cambios
          </Button>
        </>
      }
    >
      <form
        id="customer-form"
        noValidate
        onSubmit={handleSubmit((values) => mutation.mutate(values))}
        className="space-y-5"
      >
        {mutation.isError && (
          <Alert tone="error">{toDisplayMessage(mutation.error)}</Alert>
        )}

        <Input
          label="Nombre completo"
          error={errors.name?.message}
          {...register("name")}
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            label="Edad"
            type="number"
            min={18}
            max={120}
            inputMode="numeric"
            error={errors.age?.message}
            {...register("age")}
          />
          <Select
            label="Género"
            options={[
              { value: "female", label: "Femenino" },
              { value: "male", label: "Masculino" },
            ]}
            error={errors.gender?.message}
            {...register("gender")}
          />
        </div>

        <Input
          label="Correo"
          type="email"
          error={errors.email?.message}
          {...register("email")}
        />

        <Select
          label="Rol"
          placeholder={roles.isPending ? "Cargando…" : "Sin cambios"}
          allowEmpty
          hint="Define los permisos de la cuenta. Se aplica en su próxima sesión."
          options={(roles.data ?? []).map((role) => ({
            value: String(role.id),
            label: role.name,
          }))}
          error={errors.role_id?.message}
          {...register("role_id")}
        />
      </form>
    </Modal>
  );
}
