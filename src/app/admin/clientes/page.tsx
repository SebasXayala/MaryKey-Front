import type { Metadata } from "next";

import { CustomersAdmin } from "@/components/admin/customers-admin";

export const metadata: Metadata = { title: "Clientes" };

export default function AdminCustomersPage() {
  return <CustomersAdmin />;
}
