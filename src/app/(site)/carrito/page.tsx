import type { Metadata } from "next";

import { CartSummary } from "@/app/(site)/carrito/cart-summary";

export const metadata: Metadata = {
  title: "Mi bolsa",
};

export default function CartPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <CartSummary />
    </div>
  );
}
