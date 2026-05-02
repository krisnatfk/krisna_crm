import { cn } from "@/lib/utils";

interface BadgeProps {
  variant?: "success" | "warning" | "error" | "info" | "default";
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = "default", children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold text-white",
        variant === "success" && "bg-success",
        variant === "warning" && "bg-warning",
        variant === "error" && "bg-error",
        variant === "info" && "bg-info",
        variant === "default" && "bg-background-muted text-foreground-secondary",
        className
      )}
    >
      {children}
    </span>
  );
}
