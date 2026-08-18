import { ButtonLink } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <Logo size="lg" />
      <h1 className="mt-8 text-4xl text-neutral-700">Página no encontrada</h1>
      <p className="mt-3 text-sm text-neutral-500">
        El enlace que seguiste no existe o cambió de lugar.
      </p>
      <ButtonLink href="/" className="mt-8">
        Volver al inicio
      </ButtonLink>
    </div>
  );
}
