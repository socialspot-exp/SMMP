import { Plus } from "lucide-react";

export function MobileFab() {
  return (
    <div className="fixed right-6 bottom-[calc(6rem+env(safe-area-inset-bottom))] z-40 lg:hidden">
      <button
        type="button"
        className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-on-primary shadow-xl transition-transform active:scale-90"
        aria-label="Quick add"
      >
        <Plus className="h-7 w-7" strokeWidth={2.5} aria-hidden />
      </button>
    </div>
  );
}
