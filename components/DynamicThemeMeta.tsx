"use client";

import { useEffect } from "react";
import { useTheme } from "../providers/ThemeContext";

export function DynamicThemeMeta() {
  const { currentTheme } = useTheme();

  useEffect(() => {
    let meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "theme-color");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", currentTheme.accent);
  }, [currentTheme.accent]);

  return null;
}
