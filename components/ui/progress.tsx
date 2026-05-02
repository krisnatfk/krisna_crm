import { cn } from "@/lib/utils";

interface ProgressProps {
  value: number;
  color?: string;
  className?: string;
  size?: "sm" | "md";
}

export function Progress({ value, color = "var(--brand)", className, size = "sm" }: ProgressProps) {
  return (
    <div
      className={cn(
        "w-full bg-background-muted rounded-full overflow-hidden",
        size === "sm" && "h-1.5",
        size === "md" && "h-2",
        className
      )}
    >
      <div
        className="h-full rounded-full transition-all duration-700 ease-out"
        style={{
          width: `${Math.min(100, Math.max(0, value))}%`,
          backgroundColor: color,
        }}
      />
    </div>
  );
}
