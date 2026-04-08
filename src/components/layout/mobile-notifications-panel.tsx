"use client";

import { useEffect, useRef } from "react";
import {
  Bell,
  CheckCircle2,
  Package,
  Sparkles,
  TrendingUp,
  Wallet,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const DUMMY_NOTIFICATIONS = [
  {
    id: "1",
    Icon: CheckCircle2,
    iconClass: "text-emerald-600",
    iconBg: "bg-emerald-50",
    title: "Order Completed",
    message: "Your order #9821 (2,500 TikTok Followers) has been delivered successfully.",
    time: "2 hours ago",
    unread: true,
  },
  {
    id: "2",
    Icon: TrendingUp,
    iconClass: "text-blue-600",
    iconBg: "bg-blue-50",
    title: "Order In Progress",
    message: "Order #9918 is 75% complete. Expected delivery in 6 hours.",
    time: "5 hours ago",
    unread: true,
  },
  {
    id: "3",
    Icon: Wallet,
    iconClass: "text-primary",
    iconBg: "bg-primary/10",
    title: "Wallet Top-up Successful",
    message: "Your wallet has been credited with $50.00 via Stripe.",
    time: "Yesterday",
    unread: false,
  },
  {
    id: "4",
    Icon: Sparkles,
    iconClass: "text-purple-600",
    iconBg: "bg-purple-50",
    title: "New Subscription Active",
    message: "Your Netflix Premium UHD subscription is now active.",
    time: "2 days ago",
    unread: false,
  },
  {
    id: "5",
    Icon: Package,
    iconClass: "text-orange-600",
    iconBg: "bg-orange-50",
    title: "Order Received",
    message: "We've received your order #9925 for 1,000 Instagram Likes.",
    time: "3 days ago",
    unread: false,
  },
] as const;

interface MobileNotificationsPanelProps {
  open: boolean;
  onClose: () => void;
}

export function MobileNotificationsPanel({
  open,
  onClose,
}: MobileNotificationsPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, onClose]);

  if (!open) return null;

  const unreadCount = DUMMY_NOTIFICATIONS.filter((n) => n.unread).length;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[60] bg-black/10 md:hidden"
        aria-hidden="true"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className="fixed top-20 right-[4%] z-[70] w-[min(92vw,26rem)] overflow-hidden rounded-2xl border border-outline-variant/10 bg-surface-container-lowest shadow-2xl md:hidden"
        role="dialog"
        aria-label="Notifications"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-outline-variant/10 bg-surface-container-lowest px-5 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
              <Bell className="size-4 stroke-[1.75] text-primary" />
            </div>
            <div>
              <h2 className="font-headline text-base font-bold text-on-surface">
                Notifications
              </h2>
              {unreadCount > 0 ? (
                <p className="text-[11px] text-on-surface-variant">
                  {unreadCount} unread
                </p>
              ) : null}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container active:scale-95"
            aria-label="Close notifications"
          >
            <X className="size-4 stroke-[2]" />
          </button>
        </div>

        {/* Notifications List */}
        <div className="max-h-[min(70vh,32rem)] overflow-y-auto">
          {DUMMY_NOTIFICATIONS.map((notif) => {
            const NotifIcon = notif.Icon;
            return (
              <button
                key={notif.id}
                type="button"
                className={cn(
                  "flex w-full items-start gap-3 border-b border-outline-variant/5 px-5 py-3.5 text-left transition-colors hover:bg-surface-container-low active:bg-surface-container",
                  notif.unread && "bg-primary/[0.02]"
                )}
              >
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                    notif.iconBg
                  )}
                >
                  <NotifIcon
                    className={cn("size-5 stroke-[1.75]", notif.iconClass)}
                    aria-hidden
                  />
                </div>
                <div className="min-w-0 flex-1 pt-0.5">
                  <div className="mb-1 flex items-start justify-between gap-2">
                    <p
                      className={cn(
                        "text-[13px] font-bold leading-tight text-on-surface",
                        notif.unread && "text-primary"
                      )}
                    >
                      {notif.title}
                    </p>
                    {notif.unread ? (
                      <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                    ) : null}
                  </div>
                  <p className="mb-1.5 text-[12px] leading-relaxed text-on-surface-variant">
                    {notif.message}
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/60">
                    {notif.time}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 border-t border-outline-variant/10 bg-surface-container-lowest px-5 py-3">
          <button
            type="button"
            className="w-full rounded-xl bg-surface-container py-2 text-[13px] font-bold text-on-surface transition-colors hover:bg-surface-container-high active:scale-[0.98]"
          >
            Mark all as read
          </button>
        </div>
      </div>
    </>
  );
}
