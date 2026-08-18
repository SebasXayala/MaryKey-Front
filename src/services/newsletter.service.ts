import { endpoints } from "@/lib/api/endpoints";
import { http } from "@/lib/api/http";

export const newsletterService = {
  subscribe(email: string, source = "tutoriales") {
    return http.post<{ message: string }>(
      endpoints.newsletter.subscribe,
      { email: email.trim().toLowerCase(), source },
      { auth: false },
    );
  },
};
