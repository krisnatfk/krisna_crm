"use client";

import { useEffect } from "react";

export function RechartsSuppressor() {
  useEffect(() => {
    // Suppress Recharts ResponsiveContainer warnings
    const originalWarn = console.warn;
    console.warn = (...args) => {
      const msg = args[0];
      if (typeof msg === "string" && msg.includes("The width(-1) and height(-1)")) {
        return; // Mute this specific warning
      }
      originalWarn.apply(console, args);
    };

    // Suppress React 18+ defaultProps warnings (also common in Recharts)
    const originalError = console.error;
    console.error = (...args) => {
      const msg = args[0];
      if (typeof msg === "string" && msg.includes("defaultProps will be removed")) {
        return; // Mute this specific warning
      }
      originalError.apply(console, args);
    };

    return () => {
      console.warn = originalWarn;
      console.error = originalError;
    };
  }, []);

  return null;
}
