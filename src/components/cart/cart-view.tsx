"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth/auth-context";
import {
  ArrowRight,
  Coins,
  CreditCard,
  Headphones,
  History,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingCart,
  Smartphone,
  Trash2,
  UserCircle,
  Wallet,
} from "lucide-react";
import { SocialBrandIcon } from "@/components/home/social-brand";
import { PremiumBrandMark } from "@/components/product/premium-brand-mark";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/components/cart/cart-context";
import { cn } from "@/lib/utils";

const SERVICE_FEE = 0.99;

const fieldClass =
  "rounded-lg border border-transparent bg-surface-container-low px-4 py-3 text-sm text-on-surface outline-none transition-all placeholder:text-outline focus-visible:border-primary focus-visible:ring-0";

type CheckoutGateway = {
  key: string;
  label: string;
  isEnabled: boolean;
};

export function CartView() {
  const router = useRouter();
  const { user, ready, signOut } = useAuth();
  const { line, updateSmmProfileUrl, updatePremiumEmail, clearCart } = useCart();
  const [profileDraft, setProfileDraft] = useState("");
  const [emailDraft, setEmailDraft] = useState("");
  const [savedFlash, setSavedFlash] = useState(false);
  const [gateways, setGateways] = useState<CheckoutGateway[]>([]);
  const [orderCreating, setOrderCreating] = useState(false);
  const [orderCreateError, setOrderCreateError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      try {
        const res = await fetch("/api/payments/gateways", { cache: "no-store" });
        const data = await res.json();
        if (!mounted) return;
        setGateways(Array.isArray(data.gateways) ? data.gateways : []);
      } catch {
        if (!mounted) return;
        setGateways([]);
      }
    };
    void run();
    return () => {
      mounted = false;
    };
  }, []);

  const productHref = useMemo(() => {
    if (!line) return "/services";
    return line.kind === "smm"
      ? `/services/smm/${line.productId}`
      : `/services/premium/${line.productId}`;
  }, [line]);

  useEffect(() => {
    if (line?.kind === "smm") setProfileDraft(line.profileUrl);
    else if (line?.kind === "premium") setEmailDraft(line.deliveryEmail);
  }, [line]);

  if (!line) {
    return (
      <div className="mx-auto min-h-[50vh] max-w-7xl px-6 py-12 lg:px-12 lg:py-16">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:items-start">
          <div className="lg:col-span-2">
            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-outline-variant/30 p-10 text-center opacity-90">
              <ShoppingCart
                className="mb-3 h-12 w-12 text-outline"
                strokeWidth={1.25}
                aria-hidden
              />
              <p className="font-medium text-on-surface-variant">
                Your cart is empty — one product at a time. Add a service to continue.
              </p>
              <Link
                href="/services"
                className="mt-5 font-headline text-sm font-bold text-primary hover:underline"
              >
                Continue browsing
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const initialLetter = line.productName.trim().charAt(0).toUpperCase() || "P";
  const subtotal = line.price;
  const total = subtotal + SERVICE_FEE;
  const deliveryOk =
    line.kind === "smm"
      ? profileDraft.trim().length > 0
      : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailDraft.trim());

  function saveDelivery() {
    if (!line) return;
    if (line.kind === "smm") updateSmmProfileUrl(profileDraft.trim());
    else updatePremiumEmail(emailDraft.trim());
    setSavedFlash(true);
    window.setTimeout(() => setSavedFlash(false), 2000);
  }

  function persistDraftAndPayStub() {
    if (!line) return;
    if (line.kind === "smm") {
      if (!profileDraft.trim()) return;
      updateSmmProfileUrl(profileDraft.trim());
    } else {
      const em = emailDraft.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) return;
      updatePremiumEmail(em);
    }
  }

  async function createOrderAndContinue() {
    if (!line) return;
    setOrderCreateError(null);
    if (!deliveryOk) return;

    // Persist delivery inputs into cart context first.
    persistDraftAndPayStub();

    if (line.kind === "smm") {
      const targetUrl = profileDraft.trim();
      if (!targetUrl) {
        setOrderCreateError("Target link is required.");
        return;
      }
      setOrderCreating(true);
      try {
        const res = await fetch("/api/smm-orders/create", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId: line.productId,
            productName: line.productName,
            platform: line.platform,
            tierId: line.tierId,
            tierSummary: line.tierSummary,
            price: line.price,
            targetUrl,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setOrderCreateError(typeof data?.error === "string" ? data.error : "Failed to create order");
          return;
        }
        clearCart();
        router.push("/dashboard/orders");
      } catch (e) {
        setOrderCreateError(e instanceof Error ? e.message : "Failed to create order");
      } finally {
        setOrderCreating(false);
      }
    }

    if (line.kind === "premium") {
      const deliveryEmail = emailDraft.trim();
      if (!deliveryEmail) {
        setOrderCreateError("Delivery email is required.");
        return;
      }

      setOrderCreating(true);
      try {
        const res = await fetch("/api/premium-orders/create", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId: line.productId,
            productName: line.productName,
            deliveryEmail,
            planSummary: line.planSummary,
            price: line.price,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          setOrderCreateError(typeof data?.error === "string" ? data.error : "Failed to create order");
          return;
        }

        clearCart();
        router.push("/dashboard/subscriptions");
      } catch (e) {
        setOrderCreateError(e instanceof Error ? e.message : "Failed to create order");
      } finally {
        setOrderCreating(false);
      }
    }
  }

  function changeAccount() {
    signOut();
    router.push("/login");
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 pb-24 lg:px-12 lg:py-12 lg:pb-20">

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Account — minimal: signed-in summary or Login / Sign up */}
          <div className="rounded-xl border border-primary/10 bg-primary-container/10 p-4 md:p-5">
            <div className="mb-3 flex items-center gap-3">
              <UserCircle className="h-6 w-6 shrink-0 text-primary" strokeWidth={1.75} aria-hidden />
              <h2 className="font-headline text-sm font-bold text-on-surface">
                {user ? "Your account" : "Account"}
              </h2>
            </div>
            {!ready ? (
              <p className="text-xs text-on-surface-variant">Loading…</p>
            ) : user ? (
              <div className="space-y-3">
                {user.name ? (
                  <p className="font-headline text-base font-bold text-on-surface">{user.name}</p>
                ) : null}
                <p className="text-sm text-on-surface-variant">{user.email}</p>
                <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-lg border-outline-variant/40 font-semibold"
                    onClick={changeAccount}
                  >
                    Change account
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="rounded-lg font-semibold text-on-surface-variant hover:text-error"
                    onClick={() => signOut()}
                  >
                    Log out
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-on-surface-variant">
                  Sign in for order history and faster checkout — or continue as a guest.
                </p>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Link
                    href="/login"
                    className={cn(
                      buttonVariants({ size: "lg" }),
                      "h-10 flex-1 rounded-full font-headline text-sm font-bold"
                    )}
                  >
                    Log in
                  </Link>
                  <Link
                    href="/signup"
                    className={cn(
                      buttonVariants({ variant: "outline", size: "lg" }),
                      "h-10 flex-1 rounded-full border-outline-variant/40 font-headline text-sm font-bold"
                    )}
                  >
                    Sign up
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Single line item */}
          <div className="flex flex-col gap-6 rounded-xl bg-surface-container-lowest p-6 ambient-shadow md:flex-row">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-lg bg-surface-container-low">
              {line.kind === "smm" ? (
                <SocialBrandIcon id={line.platform} className="h-12 w-12" />
              ) : (
                <PremiumBrandMark
                  brandId={line.brandId}
                  productName={line.productName}
                  fallbackLetter={initialLetter}
                  size="md"
                />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                <div>
                  <h3 className="font-headline text-lg font-bold text-on-surface">
                    {line.productName}
                  </h3>
                  <p className="text-sm text-on-surface-variant">
                    {line.kind === "smm" ? line.tierSummary : line.planSummary}
                  </p>
                  <Link
                    href={productHref}
                    className="mt-2 inline-block text-xs font-semibold text-primary hover:underline"
                  >
                    Edit package on product page
                  </Link>
                </div>
                <span className="font-headline text-xl font-bold text-primary whitespace-nowrap">
                  ${subtotal.toFixed(2)}
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="cart-delivery"
                    className="mb-2 block text-xs font-bold tracking-wider text-on-surface-variant uppercase"
                  >
                    {line.kind === "smm"
                      ? "Target link (profile or post URL)"
                      : "Delivery email"}
                  </label>
                  {line.kind === "smm" ? (
                    <input
                      id="cart-delivery"
                      type="text"
                      value={profileDraft}
                      onChange={(e) => setProfileDraft(e.target.value)}
                      onBlur={saveDelivery}
                      placeholder="https://www.tiktok.com/@username"
                      className={cn("w-full", fieldClass)}
                    />
                  ) : (
                    <input
                      id="cart-delivery"
                      type="email"
                      value={emailDraft}
                      onChange={(e) => setEmailDraft(e.target.value)}
                      onBlur={() => {
                        if (emailDraft.trim() && deliveryOk) saveDelivery();
                      }}
                      placeholder="your@email.com"
                      className={cn("w-full", fieldClass)}
                    />
                  )}
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="rounded-lg text-xs font-bold"
                      onClick={saveDelivery}
                    >
                      Save
                    </Button>
                    {savedFlash ? (
                      <span className="text-xs font-semibold text-green-600">Saved.</span>
                    ) : null}
                  </div>
                </div>

                <div className="flex flex-col gap-4 pt-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex w-fit items-center rounded-full bg-surface-container-low px-2 py-1">
                    <button
                      type="button"
                      disabled
                      className="flex h-8 w-8 cursor-not-allowed items-center justify-center rounded-full text-on-surface opacity-40"
                      aria-label="Decrease quantity (not available)"
                    >
                      <Minus className="h-4 w-4" aria-hidden />
                    </button>
                    <span className="px-4 text-sm font-bold">1</span>
                    <button
                      type="button"
                      disabled
                      className="flex h-8 w-8 cursor-not-allowed items-center justify-center rounded-full text-on-surface opacity-40"
                      aria-label="Increase quantity (not available)"
                    >
                      <Plus className="h-4 w-4" aria-hidden />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm("Remove this item from your cart?")) clearCart();
                    }}
                    className="flex items-center gap-2 text-sm font-semibold text-error transition-opacity hover:opacity-75"
                  >
                    <Trash2 className="h-5 w-5" aria-hidden />
                    Remove
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Cross-sell */}
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-outline-variant/30 p-8 text-center opacity-80">
            <ShoppingCart className="mb-3 h-10 w-10 text-outline" strokeWidth={1.25} aria-hidden />
            <p className="font-medium text-on-surface-variant">
              Swap this item by browsing — only one product is held at a time.
            </p>
            <Link
              href="/services"
              className="mt-4 font-headline text-sm font-bold text-primary hover:underline"
            >
              Continue browsing
            </Link>
          </div>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-xl bg-surface-container-lowest p-6 ambient-shadow">
            <h2 className="mb-6 font-headline text-xl font-bold text-on-surface">Order summary</h2>
            <div className="mb-6 space-y-4">
              <div className="flex justify-between text-on-surface-variant">
                <span>Subtotal</span>
                <span className="font-semibold text-on-surface">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-on-surface-variant">
                <span>Service fee</span>
                <span className="font-semibold text-on-surface">${SERVICE_FEE.toFixed(2)}</span>
              </div>
              <div className="h-px bg-surface-container" />
              <div className="flex justify-between text-lg">
                <span className="font-bold">Total</span>
                <span className="font-headline font-extrabold text-primary">
                  ${total.toFixed(2)}
                </span>
              </div>
            </div>

            <Button
              className="mb-0 flex h-auto w-full items-center justify-center gap-2 rounded-full py-4 font-headline text-base font-bold shadow-lg shadow-primary/20"
              size="lg"
              type="button"
              disabled={!deliveryOk}
              onClick={() => void createOrderAndContinue()}
            >
              {orderCreating ? "Creating..." : "Proceed to checkout"}
              <ArrowRight className="h-5 w-5" aria-hidden />
            </Button>
            <p className="mt-3 text-center text-[10px] text-on-surface-variant">
              Payment methods are loaded dynamically from admin settings.
            </p>
            {orderCreateError ? (
              <p className="mt-3 rounded-lg border border-error/30 bg-error-container/20 px-3 py-2 text-center text-xs font-medium text-on-error-container">
                {orderCreateError}
              </p>
            ) : null}

            {gateways.length > 0 ? (
              <div className="mt-4 grid gap-2">
                {gateways.map((g) => (
                  <button
                    key={g.key}
                    type="button"
                    className="inline-flex w-full items-center justify-between rounded-lg border border-outline-variant/20 bg-surface px-3 py-2 text-left text-xs font-semibold text-on-surface"
                    onClick={() => void createOrderAndContinue()}
                  >
                    <span>{g.label}</span>
                    <span className="rounded bg-primary/10 px-2 py-0.5 font-mono text-[10px] uppercase text-primary">
                      {g.key}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-center text-[11px] text-on-surface-variant">
                No payment gateway enabled yet.
              </p>
            )}

            <div className="mt-8 space-y-4 border-t border-surface-container pt-6">
              <div className="flex items-center gap-3 text-on-surface-variant">
                <ShieldCheck className="h-5 w-5 shrink-0 text-primary-dim" strokeWidth={1.75} />
                <span className="text-xs font-medium">SSL secure 256-bit checkout</span>
              </div>
              <div className="flex items-center gap-3 text-on-surface-variant">
                <Headphones className="h-5 w-5 shrink-0 text-primary-dim" strokeWidth={1.75} />
                <span className="text-xs font-medium">24/7 priority curator support</span>
              </div>
              <div className="flex items-center gap-3 text-on-surface-variant">
                <History className="h-5 w-5 shrink-0 text-primary-dim" strokeWidth={1.75} />
                <span className="text-xs font-medium">Guaranteed refund policy</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl bg-surface-container/50 px-6 py-4">
            <CreditCard className="h-6 w-6 text-on-surface-variant opacity-50" strokeWidth={1.5} />
            <Wallet className="h-6 w-6 text-on-surface-variant opacity-50" strokeWidth={1.5} />
            <Coins className="h-6 w-6 text-on-surface-variant opacity-50" strokeWidth={1.5} />
            <Smartphone className="h-6 w-6 text-on-surface-variant opacity-50" strokeWidth={1.5} />
          </div>
        </aside>
      </div>

    </div>
  );
}
