"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ApiError, toDisplayMessage } from "@/lib/api/api-error";
import { queryKeys } from "@/lib/query-keys";
import {
  productSchema,
  type ProductFormValues,
} from "@/lib/validation/admin-schemas";
import { adminProductsService } from "@/services/admin.service";
import type {
  BackendCategory,
  BackendProduct,
} from "@/services/backend-catalog";

interface ProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  /** `null` = alta; con producto = edición. */
  product: BackendProduct | null;
  categories: BackendCategory[];
}

const EMPTY: ProductFormValues = {
  name: "",
  description: "",
  price: 0,
  stock: 0,
  isActive: true,
  category_id: 0,
};

export function ProductForm({
  isOpen,
  onClose,
  product,
  categories,
}: ProductFormProps) {
  const queryClient = useQueryClient();
  const isEditing = Boolean(product);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: EMPTY,
  });

  // Al abrir, el formulario se llena con el producto elegido (o se vacía).
  useEffect(() => {
    if (!isOpen) return;

    reset(
      product
        ? {
            name: product.name,
            description: product.description ?? "",
            price: Number(product.price),
            stock: product.stock,
            isActive: product.isActive,
            category_id: product.category?.id ?? 0,
          }
        : EMPTY,
    );
  }, [isOpen, product, reset]);

  const mutation = useMutation({
    mutationFn: (values: ProductFormValues) =>
      product
        ? adminProductsService.update(product.id, values)
        : adminProductsService.create(values),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.products });
      // La vitrina lee los mismos productos por otra clave.
      void queryClient.invalidateQueries({ queryKey: ["catalog"] });
      onClose();
    },
    onError: (error) => {
      if (error instanceof ApiError && error.fieldErrors) {
        for (const [field, message] of Object.entries(error.fieldErrors)) {
          if (field in EMPTY) {
            setError(field as keyof ProductFormValues, { message });
          }
        }
      }
    },
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Editar producto" : "Nuevo producto"}
      description={
        isEditing
          ? "Los cambios se ven de inmediato en la tienda."
          : "Se publica en la categoría que elijas."
      }
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
            form="product-form"
            type="submit"
            isLoading={mutation.isPending}
          >
            {isEditing ? "Guardar cambios" : "Crear producto"}
          </Button>
        </>
      }
    >
      <form
        id="product-form"
        noValidate
        onSubmit={handleSubmit((values) => mutation.mutate(values))}
        className="space-y-5"
      >
        {mutation.isError && (
          <Alert tone="error">{toDisplayMessage(mutation.error)}</Alert>
        )}

        <Input
          label="Nombre"
          placeholder="Sérum reafirmante"
          error={errors.name?.message}
          {...register("name")}
        />

        <Textarea
          label="Descripción"
          placeholder="Qué es y para qué sirve (máx. 255 caracteres)."
          error={errors.description?.message}
          {...register("description")}
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            label="Precio (COP)"
            type="number"
            step="0.01"
            min={0}
            inputMode="decimal"
            placeholder="89000"
            error={errors.price?.message}
            {...register("price")}
          />
          <Input
            label="Stock"
            type="number"
            min={0}
            inputMode="numeric"
            placeholder="20"
            error={errors.stock?.message}
            {...register("stock")}
          />
        </div>

        <Select
          label="Categoría"
          placeholder="Selecciona…"
          options={categories.map((category) => ({
            value: String(category.id),
            label: category.name,
          }))}
          error={errors.category_id?.message}
          {...register("category_id")}
        />

        <Checkbox
          label="Visible en la tienda"
          {...register("isActive")}
        />
      </form>
    </Modal>
  );
}
