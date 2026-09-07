"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/textarea";
import { ApiError, toDisplayMessage } from "@/lib/api/api-error";
import { queryKeys } from "@/lib/query-keys";
import {
  categorySchema,
  type CategoryFormValues,
} from "@/lib/validation/admin-schemas";
import { adminCategoriesService } from "@/services/admin.service";
import type { BackendCategory } from "@/services/backend-catalog";

interface CategoryFormProps {
  isOpen: boolean;
  onClose: () => void;
  /** `null` = alta; con categoría = edición. */
  category: BackendCategory | null;
}

const EMPTY: CategoryFormValues = { name: "", description: "" };

export function CategoryForm({ isOpen, onClose, category }: CategoryFormProps) {
  const queryClient = useQueryClient();
  const isEditing = Boolean(category);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: EMPTY,
  });

  useEffect(() => {
    if (!isOpen) return;

    reset(
      category
        ? { name: category.name, description: category.description ?? "" }
        : EMPTY,
    );
  }, [isOpen, category, reset]);

  const mutation = useMutation({
    mutationFn: (values: CategoryFormValues) =>
      category
        ? adminCategoriesService.update(category.id, values)
        : adminCategoriesService.create(values),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.admin.categories,
      });
      // El nombre alimenta el menú y el slug de la tienda.
      void queryClient.invalidateQueries({ queryKey: ["catalog"] });
      onClose();
    },
    onError: (error) => {
      if (error instanceof ApiError && error.fieldErrors) {
        for (const [field, message] of Object.entries(error.fieldErrors)) {
          if (field in EMPTY) {
            setError(field as keyof CategoryFormValues, { message });
          }
        }
      }
    },
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Editar categoría" : "Nueva categoría"}
      description="El nombre arma el menú de la tienda y la dirección de la página."
      className="sm:max-w-md"
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
            form="category-form"
            type="submit"
            isLoading={mutation.isPending}
          >
            {isEditing ? "Guardar cambios" : "Crear categoría"}
          </Button>
        </>
      }
    >
      <form
        id="category-form"
        noValidate
        onSubmit={handleSubmit((values) => mutation.mutate(values))}
        className="space-y-5"
      >
        {mutation.isError && (
          <Alert tone="error">{toDisplayMessage(mutation.error)}</Alert>
        )}

        <Input
          label="Nombre"
          placeholder="Cuidado de la piel"
          error={errors.name?.message}
          {...register("name")}
        />

        <Textarea
          label="Descripción"
          placeholder="Aparece bajo el título de la categoría (máx. 255 caracteres)."
          error={errors.description?.message}
          {...register("description")}
        />
      </form>
    </Modal>
  );
}
