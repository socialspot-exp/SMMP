"use client";

import { CATEGORY_ICON_MAP, CATEGORY_ICON_OPTIONS, type CategoryIconName } from "@/lib/category-icons";
import { cn } from "@/lib/utils";

export function AdminCategoryIconSelect({
  value,
  onChange,
  className,
  id,
}: {
  value: CategoryIconName;
  onChange: (v: CategoryIconName) => void;
  className?: string;
  id?: string;
}) {
  const Icon = CATEGORY_ICON_MAP[value];
  return (
    <div className={cn("flex min-w-0 items-center gap-2", className)}>
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-outline-variant/20 bg-surface-container-low text-on-surface"
        aria-hidden
      >
        <Icon className="size-4 stroke-[1.75]" />
      </div>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value as CategoryIconName)}
        className="min-w-0 flex-1 rounded-lg border border-outline-variant/25 bg-surface-container-lowest px-2 py-2 text-xs font-semibold text-on-surface focus:ring-2 focus:ring-primary/20 focus:outline-none"
      >
        {CATEGORY_ICON_OPTIONS.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>
    </div>
  );
}
