"use client";

import { useState, useRef, useEffect, ReactNode } from "react";
import { MoreHorizontal } from "lucide-react";

interface DropdownMenuProps {
  children: ReactNode;
  icon?: ReactNode;
}

export function DropdownMenu({ children, icon }: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen(!open);
        }}
        className="p-1.5 rounded-md hover:bg-background-muted transition-colors text-foreground-muted hover:text-foreground outline-none focus:ring-2 focus:ring-brand/20"
      >
        {icon || <MoreHorizontal className="w-4 h-4" />}
      </button>
      {open && (
        <div 
          className="absolute right-0 top-full mt-1 w-36 bg-background border border-border rounded-lg shadow-lg z-50 py-1 animate-in fade-in zoom-in-95 duration-100" 
          onClick={(e) => {
            e.stopPropagation();
            setOpen(false);
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}

export function DropdownMenuItem({ 
  children, 
  onClick, 
  className = "", 
  destructive = false 
}: { 
  children: ReactNode; 
  onClick: () => void; 
  className?: string; 
  destructive?: boolean;
}) {
  return (
    <button
      className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left hover:bg-background-hover transition-colors ${destructive ? "text-error hover:bg-error/10" : "text-foreground"} ${className}`}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      {children}
    </button>
  );
}
