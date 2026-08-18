import type { Metadata } from "next";

import { CategoryCatalog } from "@/components/catalog/category-catalog";
import { CategoryHero } from "@/components/catalog/category-hero";
import { FeaturedCarousel } from "@/components/catalog/featured-carousel";

interface PageProps {
  params: Promise<{ slug: string }>;
}

function toTitle(slug: string) {
  return slug.charAt(0).toUpperCase() + slug.slice(1);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  return { title: toTitle(slug) };
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;

  return (
    <div className="mx-auto max-w-7xl space-y-12 px-4 py-10 sm:px-6 lg:px-8">
      <CategoryHero slug={slug} />

      <FeaturedCarousel
        title="Destacados"
        subtitle={`Lo más elegido en ${toTitle(slug)}.`}
        category={slug}
      />

      <CategoryCatalog category={slug} />
    </div>
  );
}
