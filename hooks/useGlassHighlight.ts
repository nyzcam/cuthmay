"use client";

import { useEffect, useState } from "react";

export const useGlassHighlight = (accent: string): boolean => {
  const [active, setActive] = useState(false);

  useEffect(() => {
    setActive(true);
    const id = setTimeout(() => setActive(false), 600);
    return () => clearTimeout(id);
  }, [accent]);

  return active;
};
