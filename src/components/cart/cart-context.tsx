"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CartLine, CartPremiumLine, CartSmmLine } from "@/lib/cart-types";
import { loadCartFromStorage, saveCartToStorage } from "@/lib/cart-types";

type CartContextValue = {
  line: CartLine | null;
  /** Always 0 or 1 (single-item cart). */
  itemCount: number;
  setSmmLine: (payload: Omit<CartSmmLine, "kind">) => void;
  setPremiumLine: (payload: Omit<CartPremiumLine, "kind">) => void;
  updateSmmProfileUrl: (profileUrl: string) => void;
  updatePremiumEmail: (deliveryEmail: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [line, setLine] = useState<CartLine | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setLine(loadCartFromStorage());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveCartToStorage(line);
  }, [line, hydrated]);

  const setSmmLine = useCallback((payload: Omit<CartSmmLine, "kind">) => {
    setLine({ kind: "smm", ...payload });
  }, []);

  const setPremiumLine = useCallback((payload: Omit<CartPremiumLine, "kind">) => {
    setLine({ kind: "premium", ...payload });
  }, []);

  const updateSmmProfileUrl = useCallback((profileUrl: string) => {
    setLine((prev) =>
      prev?.kind === "smm" ? { ...prev, profileUrl } : prev
    );
  }, []);

  const updatePremiumEmail = useCallback((deliveryEmail: string) => {
    setLine((prev) =>
      prev?.kind === "premium" ? { ...prev, deliveryEmail } : prev
    );
  }, []);

  const clearCart = useCallback(() => setLine(null), []);

  const value = useMemo(
    () => ({
      line,
      itemCount: line ? 1 : 0,
      setSmmLine,
      setPremiumLine,
      updateSmmProfileUrl,
      updatePremiumEmail,
      clearCart,
    }),
    [
      line,
      setSmmLine,
      setPremiumLine,
      updateSmmProfileUrl,
      updatePremiumEmail,
      clearCart,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
