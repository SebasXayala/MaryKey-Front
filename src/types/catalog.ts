export interface Category {
  id: string;
  slug: string;
  name: string;
  description?: string;
  /** Contenido del banner superior de la categoría (lo define el backend). */
  heroTitle?: string;
  heroSubtitle?: string;
  heroImageUrl?: string | null;
}

export type ProductBadge = "nuevo" | "best_seller" | "oferta";

export interface Product {
  id: string;
  sku: string;
  slug: string;
  name: string;
  shortDescription: string;
  price: number;
  compareAtPrice?: number | null;
  currency: string;
  imageUrl?: string | null;
  categorySlug: string;
  /** Nombre de la línea a la que pertenece, ej. "Cuidado de la piel". */
  lineName?: string;
  badge?: ProductBadge | null;
  /** Filtros de la barra lateral. */
  treatment?: string | null;
  skinTypes?: string[];
  rating?: number;
  isFeatured?: boolean;
  inStock: boolean;
}

export type ProductSort = "relevance" | "price_asc" | "price_desc" | "newest";

export interface ProductQuery {
  category?: string;
  search?: string;
  treatment?: string;
  skinType?: string;
  maxPrice?: number;
  featured?: boolean;
  page?: number;
  pageSize?: number;
  sort?: ProductSort;
}

/** Opciones de la barra de filtros; el backend las puede servir por categoría. */
export const TREATMENT_OPTIONS = [
  { value: "", label: "Todos" },
  { value: "serums", label: "Sérums" },
  { value: "cremas", label: "Cremas" },
  { value: "limpieza", label: "Limpieza" },
] as const;

export const SKIN_TYPE_OPTIONS = [
  { value: "", label: "Todas" },
  { value: "seca", label: "Seca" },
  { value: "mixta", label: "Mixta" },
  { value: "grasa", label: "Grasa" },
] as const;

export const SORT_OPTIONS: { value: ProductSort; label: string }[] = [
  { value: "newest", label: "Más recientes" },
  { value: "relevance", label: "Relevancia" },
  { value: "price_asc", label: "Menor precio" },
  { value: "price_desc", label: "Mayor precio" },
];
