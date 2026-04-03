import { cn } from "@/lib/utils";

export function AuthCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "ghost-border rounded-xl bg-surface-container-lowest p-8 ambient-shadow md:p-10",
        className
      )}
    >
      {children}
    </div>
  );
}
