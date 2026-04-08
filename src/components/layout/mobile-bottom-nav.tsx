"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Layers, ShoppingBag, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function MobileBottomNav() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isServices = pathname === "/services";
  const isAuth = pathname === "/login" || pathname === "/signup";
  const isCart = pathname === "/cart";
  const isProfile = pathname === "/dashboard" || pathname.startsWith("/dashboard/");

  const itemClass = (active: boolean) =>
    cn(
      "flex cursor-pointer flex-col items-center justify-center px-4 py-2 transition-transform active:scale-90",
      active
        ? "rounded-2xl bg-primary/10 text-primary"
        : "text-slate-400 hover:text-primary"
    );

  return (
    <nav className="fixed bottom-0 z-50 flex w-full items-center justify-around rounded-t-[1.5rem] bg-white/80 px-4 pt-3 shadow-[0_-10px_40px_-10px_rgba(44,47,50,0.06)] backdrop-blur-xl pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
      <Link href="/" className={itemClass(isHome)}>
        <Compass className="h-6 w-6" strokeWidth={2} aria-hidden />
        <span className="mt-1 font-label text-[10px] font-semibold tracking-wider uppercase">
          Explore
        </span>
      </Link>
      <Link href="/services" className={itemClass(isServices)}>
        <Layers className="h-6 w-6" strokeWidth={2} aria-hidden />
        <span className="mt-1 font-label text-[10px] font-semibold tracking-wider uppercase">
          Services
        </span>
      </Link>
      <Link href="/cart" className={itemClass(isCart)}>
        <ShoppingBag className="h-6 w-6" strokeWidth={2} aria-hidden />
        <span className="mt-1 font-label text-[10px] font-semibold tracking-wider uppercase">
          Cart
        </span>
      </Link>
      <Link href="/dashboard" className={itemClass(isProfile || isAuth)}>
        <User className="h-6 w-6" strokeWidth={2} aria-hidden />
        <span className="mt-1 font-label text-[10px] font-semibold tracking-wider uppercase">
          Profile
        </span>
      </Link>
    </nav>
  );
}
