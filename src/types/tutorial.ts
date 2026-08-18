export type TutorialLevel = "principiante" | "intermedio" | "avanzado";

export interface Tutorial {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  categorySlug: string;
  categoryName: string;
  level: TutorialLevel;
  durationMinutes: number;
  coverUrl?: string | null;
  videoUrl?: string | null;
  isFeatured?: boolean;
  publishedAt: string;
}

export interface TutorialQuery {
  category?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface TutorialTopic {
  slug: string;
  name: string;
}
