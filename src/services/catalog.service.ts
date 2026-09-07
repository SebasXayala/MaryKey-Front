import { ApiError } from "@/lib/api/api-error";
import { apiConfig } from "@/lib/api/config";
import { endpoints } from "@/lib/api/endpoints";
import { http, type RequestOptions } from "@/lib/api/http";
import { mockRequest } from "@/lib/api/mock/mock-server";
import {
  applyProductQuery,
  productIdFromSlug,
  toCategory,
  toProduct,
  type BackendCategory,
  type BackendProduct,
} from "@/services/backend-catalog";
import type { Paginated } from "@/types/api";
import type { Category, Product, ProductQuery } from "@/types/catalog";

/**
 * Catálogo de la tienda contra el backend real (`/categories`, `/products`).
 *
 * Dos cosas del backend condicionan este archivo:
 *
 * 1. Ambos recursos están detrás del guard JWT, y la tienda es pública. Se
 *    manda el token si la clienta inició sesión, y si el servidor responde
 *    401/404/red se cae al catálogo simulado (mientras
 *    NEXT_PUBLIC_API_MOCKS siga en true) en vez de dejar la vitrina vacía.
 *    Cuando el backend abra los GET al público, esto deja de activarse solo.
 *
 * 2. `GET /products` no acepta filtros ni paginación: se traen todos y el
 *    recorte se hace en el cliente (`applyProductQuery`).
 */

/**
 * `silentUnauthorized`: un 401 aquí significa "el catálogo pide token", no
 * "tu sesión venció"; sin esto un visitante anónimo terminaría en /login.
 */
const CATALOG_REQUEST: RequestOptions = { silentUnauthorized: true };

export const catalogService = {
  async categories(): Promise<Category[]> {
    try {
      const data = await http.get<BackendCategory[]>(
        endpoints.catalog.categories,
        CATALOG_REQUEST,
      );
      return data.map(toCategory);
    } catch (error) {
      return fallback(error, () =>
        mockRequest<Category[]>(endpoints.catalog.categories, {
          method: "GET",
        }),
      );
    }
  },

  /** La tienda navega por slug; el backend no lo guarda, así que se busca. */
  async category(slug: string): Promise<Category> {
    const categories = await catalogService.categories();
    const category = categories.find((item) => item.slug === slug);

    if (!category) {
      throw new ApiError({
        status: 404,
        code: "CATEGORY_NOT_FOUND",
        message: "No encontramos esa categoría.",
      });
    }

    return category;
  },

  async products(query: ProductQuery = {}): Promise<Paginated<Product>> {
    try {
      const data = await http.get<BackendProduct[]>(
        endpoints.catalog.products,
        CATALOG_REQUEST,
      );
      return applyProductQuery(data.map(toProduct), query);
    } catch (error) {
      return fallback(error, () =>
        mockRequest<Paginated<Product>>(endpoints.catalog.products, {
          method: "GET",
          query: {
            category: query.category,
            search: query.search,
            maxPrice: query.maxPrice,
            featured: query.featured,
            page: query.page ?? 1,
            pageSize: query.pageSize ?? 12,
            sort: query.sort,
            ...query.attributes,
          },
        }),
      );
    }
  },

  /**
   * El slug termina en el id del producto ("labial-mate-12"), así que el
   * detalle se pide directo a `GET /products/:id` sin traer la lista.
   */
  async product(slug: string): Promise<Product> {
    const id = productIdFromSlug(slug);

    if (id !== null) {
      try {
        const data = await http.get<BackendProduct>(
          endpoints.catalog.product(id),
          CATALOG_REQUEST,
        );
        return toProduct(data);
      } catch (error) {
        return fallback(error, () =>
          mockRequest<Product>(`${endpoints.catalog.products}/${slug}`, {
            method: "GET",
          }),
        );
      }
    }

    // Slug sin id (enlace viejo o dato simulado): se busca en la lista.
    const { items } = await catalogService.products({ pageSize: 1000 });
    const product = items.find((item) => item.slug === slug);

    if (!product) {
      throw new ApiError({
        status: 404,
        code: "PRODUCT_NOT_FOUND",
        message: "No encontramos ese producto.",
      });
    }

    return product;
  },
};

/** Errores que significan "el backend todavía no me deja ver el catálogo". */
function isRecoverable(error: unknown): boolean {
  return (
    error instanceof ApiError &&
    [0, 401, 403, 404].includes(error.status)
  );
}

let warned = false;

function fallback<T>(error: unknown, runMock: () => Promise<T>): Promise<T> {
  if (!apiConfig.useMocks || !isRecoverable(error)) throw error;

  if (!warned) {
    warned = true;
    console.warn(
      "[catálogo] El backend no entregó el catálogo (%s). Se muestra el catálogo simulado; " +
        "abre los GET de /categories y /products al público o inicia sesión para ver los datos reales.",
      error instanceof ApiError ? `${error.status} ${error.code}` : error,
    );
  }

  return runMock();
}
