import { cn } from "@/lib/utils";
import { forwardRef, InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={id}
            className="block text-xs font-medium text-foreground-secondary"
          >
            {label}
          </label>
        )}
        <input
          id={id}
          ref={ref}
          className={cn(
            "w-full h-9 px-3 text-sm bg-background text-foreground rounded-[var(--radius)] border border-border",
            "outline-none placeholder:text-foreground-muted",
            "focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            error && "border-error focus:ring-error/20 focus:border-error",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-error">{error}</p>}
        {hint && !error && (
          <p className="text-xs text-foreground-muted">{hint}</p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
