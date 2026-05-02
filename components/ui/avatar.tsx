import { cn } from "@/lib/utils";

interface AvatarProps {
  name: string;
  color?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Avatar({ name, color = "#0d7c5a", size = "md", className }: AvatarProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className={cn(
        "inline-flex items-center justify-center rounded-full font-semibold text-white shrink-0",
        size === "sm" && "w-8 h-8 text-xs",
        size === "md" && "w-9 h-9 text-xs",
        size === "lg" && "w-11 h-11 text-sm",
        className
      )}
      style={{ backgroundColor: color }}
    >
      {initials}
    </div>
  );
}
