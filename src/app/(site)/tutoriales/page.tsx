import type { Metadata } from "next";

import { FeaturedTutorial } from "@/components/tutorials/featured-tutorial";
import { NewsletterCta } from "@/components/tutorials/newsletter-cta";
import { TutorialExplorer } from "@/components/tutorials/tutorial-explorer";
import { TutorialHero } from "@/components/tutorials/tutorial-hero";

export const metadata: Metadata = {
  title: "Tutoriales",
  description:
    "Técnicas profesionales y rutinas paso a paso de las Consultoras de Belleza Mary Kay.",
};

export default function TutorialsPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-14 px-4 py-10 sm:px-6 lg:px-8">
      <TutorialHero />
      <FeaturedTutorial />
      <TutorialExplorer />
      <NewsletterCta />
    </div>
  );
}
