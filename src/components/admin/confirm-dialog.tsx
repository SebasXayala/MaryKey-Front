"use client";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { toDisplayMessage } from "@/lib/api/api-error";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  isLoading?: boolean;
  error?: unknown;
  onConfirm: () => void;
  onClose: () => void;
}

/** Confirmación para acciones que no se pueden deshacer. */
export function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmLabel = "Eliminar",
  isLoading = false,
  error,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={description}
      className="sm:max-w-md"
      footer={
        <>
          <Button variant="outlined" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button variant="inverted" onClick={onConfirm} isLoading={isLoading}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      {error ? (
        <Alert tone="error">{toDisplayMessage(error)}</Alert>
      ) : (
        <p className="text-sm text-neutral-500">
          Esta acción no se puede deshacer.
        </p>
      )}
    </Modal>
  );
}
