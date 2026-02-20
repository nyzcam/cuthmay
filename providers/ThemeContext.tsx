"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useMemo,
} from "react";
import {
  ThemeName,
  Theme,
  themeConfig,
  DEFAULT_THEME,
  getAllThemes,
  getNextTheme,
  getPreviousTheme,
  isValidTheme,
  themeToCssVars,
} from "../config/themeConfig";

interface ThemeContextType {
  currentThemeName: ThemeName;
  currentTheme: Theme;
  setTheme: (name: ThemeName) => void;
  cycleNextTheme: () => void;
  cyclePreviousTheme: () => void;
  resetTheme: () => void;
  getAllAvailableThemes: () => Theme[];
  isDarkTheme: boolean;
  themeLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  initialTheme?: ThemeName;
  persistTheme?: boolean;
  enableTransitions?: boolean;
  onThemeChange?: (theme: Theme) => void;
}

export const ThemeProvider = ({
  children,
  initialTheme,
  persistTheme = true,
  enableTransitions = true,
  onThemeChange,
}: ThemeProviderProps) => {
  const [currentThemeName, setCurrentThemeName] = useState<ThemeName>(() => {
    if (initialTheme && isValidTheme(initialTheme)) return initialTheme;

    if (typeof window !== "undefined" && persistTheme) {
      const stored = localStorage.getItem("themeName") as ThemeName;
      if (stored && isValidTheme(stored)) return stored;
    }

    return DEFAULT_THEME;
  });

  const [themeLoading, setThemeLoading] = useState(false);

  const currentTheme = useMemo(
    () => themeConfig[currentThemeName],
    [currentThemeName]
  );

  const setTheme = useCallback(
    (name: ThemeName) => {
      if (!isValidTheme(name)) name = DEFAULT_THEME;
      if (name === currentThemeName) return;

      setCurrentThemeName(name);

      if (persistTheme && typeof window !== "undefined") {
        localStorage.setItem("themeName", name);
      }

      if (onThemeChange) {
        onThemeChange(themeConfig[name]);
      }
    },
    [currentThemeName, persistTheme, onThemeChange]
  );

  const cycleNextTheme = useCallback(
    () => setTheme(getNextTheme(currentThemeName)),
    [currentThemeName, setTheme]
  );

  const cyclePreviousTheme = useCallback(
    () => setTheme(getPreviousTheme(currentThemeName)),
    [currentThemeName, setTheme]
  );

  const resetTheme = useCallback(() => setTheme(DEFAULT_THEME), [setTheme]);

  const getAllAvailableThemes = useCallback(() => getAllThemes(), []);

  const isDarkTheme = currentTheme.isDark;

  useEffect(() => {
    if (typeof window === "undefined") return;

    const root = document.documentElement;
    const body = document.body;

    setThemeLoading(true);

    if (enableTransitions) {
      body.classList.add("theme-transitioning");
    }

    const cssVars = themeToCssVars(currentTheme);
    Object.entries(cssVars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    // body.style.backgroundImage = currentTheme.gradient;
    // body.style.backgroundAttachment = "fixed";

    body.classList.remove(...getAllThemes().map((t) => `theme-${t.id}`));
    body.classList.add(`theme-${currentTheme.id}`);
    body.classList.toggle("theme-dark", currentTheme.isDark);
    body.classList.toggle("theme-light", !currentTheme.isDark);

    let meta = document.querySelector(
      'meta[name="theme-color"]'
    ) as HTMLMetaElement | null;

    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "theme-color";
      document.head.appendChild(meta);
    }

    meta.content = currentTheme.cssVars.dark;

    const timeout = setTimeout(() => {
      body.classList.remove("theme-transitioning");
      setThemeLoading(false);
    }, 300); // sync with CSS

    return () => clearTimeout(timeout);
  }, [currentTheme, enableTransitions]);

  const value = useMemo(
    () => ({
      currentThemeName,
      currentTheme,
      setTheme,
      cycleNextTheme,
      cyclePreviousTheme,
      resetTheme,
      getAllAvailableThemes,
      isDarkTheme,
      themeLoading,
    }),
    [
      currentThemeName,
      currentTheme,
      setTheme,
      cycleNextTheme,
      cyclePreviousTheme,
      resetTheme,
      getAllAvailableThemes,
      isDarkTheme,
      themeLoading,
    ]
  );

  return (
    <ThemeContext.Provider value={value}>
      <main className="min-h-dvh relative">{children}</main>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
};
