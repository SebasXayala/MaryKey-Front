import type { Metadata } from "next";

import { CategoriesAdmin } from "@/components/admin/categories-admin";

export const metadata: Metadata = { title: "Categorías" };

export default function AdminCategoriesPage() {
  return <CategoriesAdmin />;
}
