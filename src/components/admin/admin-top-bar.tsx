import { AdminClerkUserButton } from "@/components/admin/admin-clerk-user-button";
import { Bell, CircleHelp, Search } from "lucide-react";

const iconMd = "size-5 stroke-[1.75]";

export function AdminTopBar() {
  return (
    <header className="admin-glass-nav sticky top-0 z-10 flex h-20 shrink-0 items-center justify-between border-b border-outline-variant/15 px-8">
      <div className="relative w-full max-w-96">
        <Search
          className={`pointer-events-none absolute top-1/2 left-4 ${iconMd} -translate-y-1/2 text-on-surface-variant`}
          aria-hidden
        />
        <input
          type="search"
          placeholder="Search orders, users, or metrics..."
          className="w-full rounded-full border border-transparent bg-surface-container-low py-2.5 pr-4 pl-12 text-sm text-on-surface transition-all placeholder:text-on-surface-variant focus:border-primary/30 focus:ring-0 focus:outline-none"
        />
      </div>
      <div className="flex items-center gap-4">
        <button
          type="button"
          className="relative flex h-10 w-10 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container"
          aria-label="Notifications"
        >
          <Bell className={iconMd} aria-hidden />
          <span className="border-surface absolute top-2 right-2.5 h-2 w-2 rounded-full border-2 bg-error" />
        </button>
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container"
          aria-label="Help"
        >
          <CircleHelp className={iconMd} aria-hidden />
        </button>
        <div className="mx-2 h-8 w-px bg-outline-variant/20" />
        <AdminClerkUserButton />
      </div>
    </header>
  );
}
