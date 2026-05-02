"use client";

import { useEffect } from "react";

export function RechartsSuppressor() {
  useEffect(() => {
    // sembunyikan warning ukuran container
    const originalWarn = console.warn;
    console.warn = (...args) => {
      const msg = args[0];
      if (typeof msg === "string" && msg.includes("The width(-1) and height(-1)")) {
        return;
      }
      originalWarn.apply(console, args);
    };

    // sembunyikan warning bawaan react 18
    const originalError = console.error;
    console.error = (...args) => {
      const msg = args[0];
      if (typeof msg === "string" && msg.includes("defaultProps will be removed")) {
        return;
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
