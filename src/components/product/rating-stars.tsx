import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function RatingStars({
  value,
  className,
  size = "sm",
}: {
  value: number;
  className?: string;
  size?: "sm" | "md";
}) {
  const rounded = Math.round(value * 2) / 2;
  const starClass = size === "md" ? "h-4 w-4" : "h-3.5 w-3.5";
  const textClass = size === "md" ? "text-sm" : "text-xs";

  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn(
            starClass,
            i <= rounded
              ? "fill-amber-400 text-amber-400"
              : "fill-transparent text-outline-variant/60"
          )}
          strokeWidth={i <= rounded ? 0 : 1.5}
          aria-hidden
        />
      ))}
      <span className={cn("ml-1 font-semibold text-on-surface", textClass)}>
        {value.toFixed(1)}
      </span>
    </div>
  );
}
