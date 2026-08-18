export interface FilterOption {
  value: string;
  label: string;
}

/**
 * Grupo de filtros de la barra lateral.
 * Cada categoría define los suyos (Maquillaje no filtra por tipo de piel),
 * así que los entrega el backend junto con la categoría.
 */
export interface FilterGroup {
  /** Nombre del parámetro que se envía al backend, ej. "acabado". */
  key: string;
  label: string;
  options: FilterOption[];
}

export interface PriceRange {
  min: number;
  max: number;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  description?: string;
  /** Contenido del banner superior de la categoría. */
  heroTitle?: string;
  heroSubtitle?: string;
  heroImageUrl?: string | null;
  /** Filtros disponibles para esta categoría. */
  filters?: FilterGroup[];
  priceRange?: PriceRange;
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
  /** Valores por los que filtra la barra lateral: { acabado: "mate" }. */
  attributes?: Record<string, string>;
  rating?: number;
  isFeatured?: boolean;
  inStock: boolean;
}

export type ProductSort = "relevance" | "price_asc" | "price_desc" | "newest";

export interface ProductQuery {
  category?: string;
  search?: string;
  /** Filtros dinámicos; cada clave viaja como query param. */
  attributes?: Record<string, string>;
  maxPrice?: number;
  featured?: boolean;
  page?: number;
  pageSize?: number;
  sort?: ProductSort;
}

export const SORT_OPTIONS: { value: ProductSort; label: string }[] = [
  { value: "newest", label: "Más recientes" },
  { value: "relevance", label: "Relevancia" },
  { value: "price_asc", label: "Menor precio" },
  { value: "price_desc", label: "Mayor precio" },
];
