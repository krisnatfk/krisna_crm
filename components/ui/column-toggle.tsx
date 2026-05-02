"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal, Check } from "lucide-react";

export interface ColumnDef {
  key: string;
  label: string;
  defaultVisible?: boolean;
}

interface ColumnToggleProps {
  columns: ColumnDef[];
  visibleColumns: Record<string, boolean>;
  onChange: (key: string, visible: boolean) => void;
}

export function useColumnVisibility(columns: ColumnDef[]) {
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    columns.forEach((col) => {
      initial[col.key] = col.defaultVisible !== false;
    });
    return initial;
  });

  const toggleColumn = (key: string, visible: boolean) => {
    setVisibleColumns((prev) => ({ ...prev, [key]: visible }));
  };

  const isVisible = (key: string) => visibleColumns[key] !== false;

  return { visibleColumns, toggleColumn, isVisible };
}

export function ColumnToggle({ columns, visibleColumns, onChange }: ColumnToggleProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
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
      <Button
        variant="outline"
        size="sm"
        className="hidden sm:flex gap-1.5 h-9"
        onClick={() => setOpen(!open)}
      >
        <SlidersHorizontal className="w-3.5 h-3.5" /> Columns
      </Button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-52 bg-background border border-border rounded-lg shadow-lg z-50 py-2 animate-fade-in">
          <p className="px-3 pb-2 text-xs font-semibold text-foreground-muted uppercase tracking-wider border-b border-border mb-1">
            Toggle columns
          </p>
          {columns.map((col) => {
            const checked = visibleColumns[col.key] !== false;
            return (
              <button
                key={col.key}
                className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-foreground hover:bg-background-hover/50 transition-colors text-left"
                onClick={() => onChange(col.key, !checked)}
              >
                <div
                  className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                    checked
                      ? "bg-foreground border-foreground"
                      : "border-border"
                  }`}
                >
                  {checked && <Check className="w-3 h-3 text-background" />}
                </div>
                <span>{col.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
