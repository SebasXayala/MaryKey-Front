import type { ProductQuery } from "@/types/catalog";
import type { TutorialQuery } from "@/types/tutorial";

/** Claves centralizadas de React Query (evita invalidaciones con strings sueltos). */
export const queryKeys = {
  session: ["session"] as const,
  categories: ["catalog", "categories"] as const,
  category: (slug: string) => ["catalog", "category", slug] as const,
  products: (query: ProductQuery) => ["catalog", "products", query] as const,
  product: (slug: string) => ["catalog", "product", slug] as const,
  tutorials: (query: TutorialQuery) => ["tutorials", "list", query] as const,
  tutorial: (slug: string) => ["tutorials", "detail", slug] as const,
  featuredTutorial: ["tutorials", "featured"] as const,
  tutorialTopics: ["tutorials", "topics"] as const,

  /** Panel de administración: datos crudos del backend, sin adaptar. */
  admin: {
    products: ["admin", "products"] as const,
    categories: ["admin", "categories"] as const,
    customers: ["admin", "customers"] as const,
    roles: ["admin", "roles"] as const,
  },
};
