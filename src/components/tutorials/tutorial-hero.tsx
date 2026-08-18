import { ArrowRight } from "lucide-react";

import { ButtonLink } from "@/components/ui/button";

export function TutorialHero() {
  return (
    <section className="relative overflow-hidden rounded-card bg-primary-100">
      {/* Arcos dorados decorativos del diseño. */}
      <div
        aria-hidden
        className="absolute -right-24 -top-24 size-96 rounded-full border-[18px] border-gold-200/70"
      />
      <div
        aria-hidden
        className="absolute -bottom-32 right-16 size-80 rounded-full border-[14px] border-gold-400/40"
      />

      <div className="relative max-w-xl px-8 py-14 sm:px-12 sm:py-16">
        <span className="inline-block rounded-full bg-white/70 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.14em] text-primary-700">
          Expertas Mary Kay
        </span>

        <h1 className="mt-5 font-display text-4xl leading-tight text-secondary-700 sm:text-5xl">
          Tu Belleza, Nuestra Guía
        </h1>

        <p className="mt-4 max-w-md text-sm leading-relaxed text-neutral-600">
          Descubre los secretos de nuestras expertas para realzar tu belleza
          natural. Aprende técnicas profesionales y rutinas personalizadas de
          aplicación paso a paso para cada tipo de piel.
        </p>

        <ButtonLink href="#tutoriales" size="lg" className="mt-8">
          Explorar Ahora
          <ArrowRight className="size-4" />
        </ButtonLink>
      </div>
    </section>
  );
}
