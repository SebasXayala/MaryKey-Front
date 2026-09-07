import type { Metadata } from "next";

import { ProductsAdmin } from "@/components/admin/products-admin";

export const metadata: Metadata = { title: "Productos" };

export default function AdminProductsPage() {
  return <ProductsAdmin />;
}
