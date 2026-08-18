"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { toDisplayMessage } from "@/lib/api/api-error";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Aquí se engancha el servicio de observabilidad (Sentry, Datadog, etc.).
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <h1 className="text-3xl text-neutral-700">Algo salió mal</h1>
      <p className="mt-3 max-w-md text-sm text-neutral-500">
        {toDisplayMessage(error)}
      </p>
      <Button className="mt-8" onClick={reset}>
        Intentar de nuevo
      </Button>
    </div>
  );
}
