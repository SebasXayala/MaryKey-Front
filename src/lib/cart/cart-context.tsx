"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import type { Product } from "@/types/catalog";

/**
 * Bolsa de compras.
 *
 * Hoy vive en el navegador (localStorage). Cuando el backend exponga los
 * endpoints de carrito, este provider es el único archivo que cambia:
 * las acciones ya están aisladas (`add`, `remove`, `setQuantity`, `clear`).
 */

export interface CartLine {
  product: Product;
  quantity: number;
}

interface CartContextValue {
  lines: CartLine[];
  count: number;
  subtotal: number;
  currency: string;
  add: (product: Product, quantity?: number) => void;
  remove: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
  /** Id del último producto agregado, para el feedback del botón. */
  lastAddedId: string | null;
}

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "mk_cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [lastAddedId, setLastAddedId] = useState<string | null>(null);

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      setLines(JSON.parse(raw) as CartLine[]);
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines]);

  const add = useCallback((product: Product, quantity = 1) => {
    setLines((current) => {
      const existing = current.find((line) => line.product.id === product.id);
      if (!existing) return [...current, { product, quantity }];

      return current.map((line) =>
        line.product.id === product.id
          ? { ...line, quantity: line.quantity + quantity }
          : line,
      );
    });
    setLastAddedId(product.id);
  }, []);

  const remove = useCallback((productId: string) => {
    setLines((current) => current.filter((line) => line.product.id !== productId));
  }, []);

  const setQuantity = useCallback((productId: string, quantity: number) => {
    setLines((current) =>
      quantity <= 0
        ? current.filter((line) => line.product.id !== productId)
        : current.map((line) =>
            line.product.id === productId ? { ...line, quantity } : line,
          ),
    );
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const value = useMemo<CartContextValue>(() => {
    const count = lines.reduce((total, line) => total + line.quantity, 0);
    const subtotal = lines.reduce(
      (total, line) => total + line.product.price * line.quantity,
      0,
    );

    return {
      lines,
      count,
      subtotal,
      currency: lines[0]?.product.currency ?? "USD",
      add,
      remove,
      setQuantity,
      clear,
      lastAddedId,
    };
  }, [lines, add, remove, setQuantity, clear, lastAddedId]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart debe usarse dentro de <CartProvider>.");
  }
  return context;
}
