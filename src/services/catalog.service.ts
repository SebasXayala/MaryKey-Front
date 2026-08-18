import { endpoints } from "@/lib/api/endpoints";
import { http } from "@/lib/api/http";
import type { Paginated } from "@/types/api";
import type { Category, Product, ProductQuery } from "@/types/catalog";

export const catalogService = {
  categories() {
    return http.get<Category[]>(endpoints.catalog.categories, { auth: false });
  },

  category(slug: string) {
    return http.get<Category>(endpoints.catalog.category(slug), { auth: false });
  },

  products(query: ProductQuery = {}) {
    return http.get<Paginated<Product>>(endpoints.catalog.products, {
      auth: false,
      query: {
        category: query.category,
        search: query.search,
        treatment: query.treatment,
        skinType: query.skinType,
        maxPrice: query.maxPrice,
        featured: query.featured,
        page: query.page ?? 1,
        pageSize: query.pageSize ?? 12,
        sort: query.sort,
      },
    });
  },

  product(slug: string) {
    return http.get<Product>(endpoints.catalog.product(slug), { auth: false });
  },
};
