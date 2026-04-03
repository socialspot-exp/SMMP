import type { Metadata } from "next";
import { ServicesChrome } from "@/components/layout/services-chrome";
import { CartView } from "@/components/cart/cart-view";

export const metadata: Metadata = {
  title: "Cart | Curator Market",
  description: "Review your order — one service at a time.",
};

export default function CartPage() {
  return (
    <ServicesChrome showFab={false}>
      <CartView />
    </ServicesChrome>
  );
}
