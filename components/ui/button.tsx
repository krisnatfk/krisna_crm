import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg" | "icon";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 cursor-pointer",
          "focus:outline-none",
          "disabled:opacity-50 disabled:pointer-events-none",
          "rounded-[var(--radius)]",
          // Variants
          variant === "primary" &&
            "bg-brand text-white hover:bg-brand-dark shadow-sm hover:shadow-md active:scale-[0.98]",
          variant === "secondary" &&
            "bg-background-muted text-foreground hover:bg-border",
          variant === "ghost" &&
            "text-foreground-secondary hover:bg-background-hover hover:text-foreground",
          variant === "outline" &&
            "border border-border text-foreground-secondary hover:bg-background-hover hover:text-foreground",
          // Sizes
          size === "sm" && "h-8 px-3 text-xs",
          size === "md" && "h-9 px-4 text-sm",
          size === "lg" && "h-10 px-6 text-sm",
          size === "icon" && "h-9 w-9 p-0",
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
export { Button };
