import { endpoints } from "@/lib/api/endpoints";
import { http } from "@/lib/api/http";
import type { Paginated } from "@/types/api";
import type { Tutorial, TutorialQuery, TutorialTopic } from "@/types/tutorial";

export const tutorialsService = {
  list(query: TutorialQuery = {}) {
    return http.get<Paginated<Tutorial>>(endpoints.tutorials.list, {
      auth: false,
      query: {
        category: query.category,
        search: query.search,
        page: query.page ?? 1,
        pageSize: query.pageSize ?? 9,
      },
    });
  },

  /** Tutorial destacado del mes (el que abre la página). */
  async featured() {
    const response = await http.get<Paginated<Tutorial>>(endpoints.tutorials.list, {
      auth: false,
      query: { featured: true, pageSize: 1 },
    });
    return response.items[0] ?? null;
  },

  topics() {
    return http.get<TutorialTopic[]>(endpoints.tutorials.topics, { auth: false });
  },

  tutorial(slug: string) {
    return http.get<Tutorial>(endpoints.tutorials.tutorial(slug), { auth: false });
  },
};
