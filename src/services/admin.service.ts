import { endpoints } from "@/lib/api/endpoints";
import { http } from "@/lib/api/http";
import type {
  BackendCategory,
  BackendProduct,
} from "@/services/backend-catalog";
import type { BackendUser } from "@/services/backend-user";
import type { Gender } from "@/types/auth";

/**
 * Servicios del panel de administración.
 *
 * A diferencia de `catalog.service.ts` —que traduce el catálogo al modelo
 * de la tienda (slug, moneda, filtros)— aquí se trabaja con el modelo
 * crudo del backend: ids numéricos, `category_id`, `isActive`. Es lo que
 * esperan sus DTOs, y el panel edita justamente eso.
 *
 * Todos estos endpoints exigen JWT; el panel solo se abre con sesión.
 */

/** Campos que acepta CreateProductDto (ValidationPipe rechaza extras). */
export interface ProductInput {
  name: string;
  description?: string;
  price: number;
  stock: number;
  isActive: boolean;
  category_id: number;
}

export interface CategoryInput {
  name: string;
  description?: string;
}

/** Campos que acepta UpdateUserDto; todos opcionales. */
export interface CustomerInput {
  name?: string;
  age?: number;
  gender?: Gender;
  email?: string;
  role_id?: number;
}

export interface BackendRole {
  id: number;
  name: string;
  description?: string | null;
}

/** El backend responde { success, message, data: { id } } al borrar. */
type DeletedResource = { id: number };

/** Quita las claves vacías: el DTO admite omitirlas, pero no un "". */
function clean<T extends object>(input: T): T {
  return Object.fromEntries(
    Object.entries(input).filter(
      ([, value]) => value !== undefined && value !== "",
    ),
  ) as T;
}

export const adminProductsService = {
  list() {
    return http.get<BackendProduct[]>(endpoints.catalog.products);
  },

  create(input: ProductInput) {
    return http.post<BackendProduct>(endpoints.catalog.products, clean(input));
  },

  update(id: number, input: Partial<ProductInput>) {
    return http.patch<BackendProduct>(
      endpoints.catalog.product(id),
      clean(input),
    );
  },

  remove(id: number) {
    return http.delete<DeletedResource>(endpoints.catalog.product(id));
  },
};

export const adminCategoriesService = {
  list() {
    return http.get<BackendCategory[]>(endpoints.catalog.categories);
  },

  create(input: CategoryInput) {
    return http.post<BackendCategory>(
      endpoints.catalog.categories,
      clean(input),
    );
  },

  update(id: number, input: Partial<CategoryInput>) {
    return http.patch<BackendCategory>(
      endpoints.catalog.category(id),
      clean(input),
    );
  },

  remove(id: number) {
    return http.delete<DeletedResource>(endpoints.catalog.category(id));
  },
};

export const adminCustomersService = {
  list() {
    return http.get<BackendUser[]>(endpoints.users.list);
  },

  update(id: number, input: CustomerInput) {
    return http.patch<BackendUser>(endpoints.users.detail(id), clean(input));
  },

  remove(id: number) {
    return http.delete<DeletedResource>(endpoints.users.detail(id));
  },

  roles() {
    return http.get<BackendRole[]>(endpoints.roles.list);
  },
};
