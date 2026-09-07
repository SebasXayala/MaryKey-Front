import type { Paginated } from "@/types/api";
import type { Category, Product, ProductQuery } from "@/types/catalog";

/**
 * Traducción entre el catálogo del backend y el de la tienda.
 *
 * El modelo del servidor es un CRUD mínimo (`id`, `name`, `description`,
 * `price`, `stock`, `isActive`, `category`) y la tienda necesita slugs,
 * moneda, imagen y filtros. Todo lo que falta se deriva aquí, en un solo
 * archivo, para que el día que el backend agregue esos campos solo haya
 * que tocar `toCategory` y `toProduct`.
 */

/** `GET /categories` -> data */
export interface BackendCategory {
  id: number;
  name: string;
  description?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

/** `GET /products` -> data (con la relación `category` cargada). */
export interface BackendProduct {
  id: number;
  name: string;
  description?: string | null;
  /** TypeORM entrega los `decimal` como string ("89000.00"). */
  price: number | string;
  stock: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  category?: BackendCategory | null;
}

/** El backend no maneja moneda: la tienda vende en pesos colombianos. */
export const CATALOG_CURRENCY = "COP";

/** "Cuidado Facial" -> "cuidado-facial" */
export function slugify(value: string): string {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * El slug de producto lleva el id al final ("labial-mate-12") porque es la
 * única forma de que la URL sea única y estable: `name` es único en la base
 * hoy, pero dos nombres distintos pueden dar el mismo slug.
 */
export function toProductSlug(product: BackendProduct): string {
  const base = slugify(product.name);
  return base ? `${base}-${product.id}` : String(product.id);
}

/** Extrae el id de un slug de producto; `null` si no lo trae. */
export function productIdFromSlug(slug: string): number | null {
  const match = /-(\d+)$/.exec(slug) ?? /^(\d+)$/.exec(slug);
  return match ? Number(match[1]) : null;
}

export function toCategory(category: BackendCategory): Category {
  return {
    id: String(category.id),
    slug: slugify(category.name),
    name: category.name,
    description: category.description ?? undefined,
    // El backend no guarda banner ni filtros: la UI ya los trata como
    // opcionales (el hero cae al nombre y la barra de filtros se oculta).
    heroSubtitle: category.description ?? undefined,
    heroImageUrl: null,
  };
}

export function toProduct(product: BackendProduct): Product {
  const price = Number(product.price ?? 0);

  return {
    id: String(product.id),
    sku: `MK-${String(product.id).padStart(4, "0")}`,
    slug: toProductSlug(product),
    name: product.name,
    shortDescription: product.description ?? "",
    price,
    compareAtPrice: null,
    currency: CATALOG_CURRENCY,
    imageUrl: null,
    categorySlug: product.category ? slugify(product.category.name) : "",
    lineName: product.category?.name,
    badge: null,
    // `isActive` es la bandera de publicación; el stock decide la compra.
    inStock: Boolean(product.isActive) && Number(product.stock) > 0,
    createdAt: product.createdAt,
  };
}

/**
 * Filtra, ordena y pagina en el cliente.
 *
 * El backend expone `GET /products` sin query params, así que trae la lista
 * completa y el recorte se hace aquí. Cuando el servidor acepte filtros,
 * esta función se reemplaza por parámetros en la petición.
 */
export function applyProductQuery(
  products: Product[],
  query: ProductQuery = {},
): Paginated<Product> {
  let items = products.filter((item) => item.inStock || item.price > 0);

  if (query.category) {
    items = items.filter((item) => item.categorySlug === query.category);
  }

  if (query.search) {
    const search = query.search.trim().toLowerCase();
    items = items.filter(
      (item) =>
        item.name.toLowerCase().includes(search) ||
        item.shortDescription.toLowerCase().includes(search),
    );
  }

  if (query.maxPrice) {
    items = items.filter((item) => item.price <= Number(query.maxPrice));
  }

  // `query.attributes` (acabado, tipo de piel…) se ignora a propósito: el
  // backend no guarda atributos, y filtrar por ellos vaciaría la grilla.

  const newest = (a: Product, b: Product) =>
    (b.createdAt ?? "").localeCompare(a.createdAt ?? "");

  if (query.sort === "price_asc") items.sort((a, b) => a.price - b.price);
  else if (query.sort === "price_desc") items.sort((a, b) => b.price - a.price);
  else if (query.sort === "newest") items.sort(newest);

  // No hay campo "destacado" en el backend: el carrusel muestra lo más
  // reciente en lugar de quedarse vacío.
  if (query.featured) items.sort(newest);

  const page = Number(query.page ?? 1);
  const pageSize = Number(query.pageSize ?? 12);
  const start = (page - 1) * pageSize;

  return {
    items: items.slice(start, start + pageSize),
    page,
    pageSize,
    total: items.length,
    totalPages: Math.max(1, Math.ceil(items.length / pageSize)),
  };
}
