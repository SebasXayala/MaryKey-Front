import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";

import { FeaturedCarousel } from "@/components/catalog/featured-carousel";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Inicio",
};

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden bg-linear-to-br from-primary-50 via-white to-primary-100">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-28">
          <div>
            <p className="wordmark text-xs text-primary-500">Mary Kay</p>
            <h1 className="mt-4 text-4xl leading-tight text-primary-700 sm:text-5xl">
              Tu belleza, tu poder.
            </h1>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-neutral-500">
              Empoderando a las mujeres a través de la belleza y la oportunidad
              durante más de 60 años.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/categoria/skincare" size="lg">
                Ver Skincare
                <ArrowRight className="size-4" />
              </ButtonLink>
              <ButtonLink href="/registro" size="lg" variant="outlined">
                Crear cuenta
              </ButtonLink>
            </div>
          </div>

          <div
            aria-hidden
            className="hidden aspect-4/3 rounded-card bg-linear-to-br from-primary-200 via-primary-300 to-secondary-300 bg-[url('/images/auth-hero.jpg')] bg-cover bg-center shadow-card lg:block"
          />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <FeaturedCarousel
          title="Destacados"
          subtitle="Lo más elegido por nuestras clientas."
        />
      </section>
    </>
  );
}
