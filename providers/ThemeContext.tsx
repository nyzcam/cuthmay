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
  generateThemeCss,
} from "../config/themeConfig";

interface ThemeContextType {
  // Current theme state
  currentThemeName: ThemeName;
  currentTheme: Theme;
  
  // Theme actions
  setTheme: (name: ThemeName) => void;
  cycleNextTheme: () => void;
  cyclePreviousTheme: () => void;
  resetTheme: () => void;
  
  // Theme utilities
  getAllAvailableThemes: () => Theme[];
  isDarkTheme: boolean;
  
  // UI state
  themeLoading: boolean;
  lastAppliedTheme: ThemeName | null;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// CSS class to prevent transitions during theme changes
const NO_TRANSITION_CSS = `
  * {
    transition: none !important;
    animation: none !important;
  }
`;

const applyThemeStyles = (theme: Theme, withTransition: boolean = false) => {
  const root = document.documentElement;
  const body = document.body;
  
  if (!withTransition) {
    const style = document.createElement('style');
    style.id = 'no-transition';
    style.innerHTML = NO_TRANSITION_CSS;
    document.head.appendChild(style);
    
    setTimeout(() => {
      const styleElement = document.getElementById('no-transition');
      if (styleElement) {
        styleElement.remove();
      }
    }, 50);
  }
  
  const cssVars = themeToCssVars(theme);
  Object.entries(cssVars).forEach(([property, value]) => {
    root.style.setProperty(property, value);
  });
  
  body.style.backgroundImage = theme.gradient;
  body.style.backgroundAttachment = "fixed";
  body.style.backgroundSize = "cover";
  body.style.backgroundPosition = "center";
  
  body.classList.remove(...getAllThemes().map(t => `theme-${t.id}`));
  body.classList.add(`theme-${theme.id}`);
  body.classList.toggle('theme-dark', theme.isDark);
  body.classList.toggle('theme-light', !theme.isDark);
  
  updateMetaThemeColor(theme);
  
  window.dispatchEvent(
    new CustomEvent('themechange', { 
      detail: { 
        theme: theme.id,
        themeName: theme.name,
        isDark: theme.isDark
      } 
    })
  );
};

const updateMetaThemeColor = (theme: Theme) => {
  let metaThemeColor = document.querySelector('meta[name="theme-color"]');
  
  if (!metaThemeColor) {
    metaThemeColor = document.createElement('meta');
    metaThemeColor.setAttribute('name', 'theme-color');
    document.head.appendChild(metaThemeColor);
  }
  
  const gradientColors = theme.gradient.match(/#[0-9a-fA-F]{3,6}/g);
  const dominantColor = gradientColors ? gradientColors[0] : theme.accent;
  
  metaThemeColor.setAttribute('content', dominantColor);
};

const generateGlobalThemeCss = () => {
  const styleId = 'theme-css-variables';
  let styleElement = document.getElementById(styleId) as HTMLStyleElement;
  
  if (!styleElement) {
    styleElement = document.createElement('style');
    styleElement.id = styleId;
    document.head.appendChild(styleElement);
  }
  
  styleElement.textContent = `
    :root {
      --theme-transition-duration: 1.8s;
      --theme-transition-timing: cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    body {
      transition: 
        background-image var(--theme-transition-duration) var(--theme-transition-timing),
        background-color var(--theme-transition-duration) var(--theme-transition-timing);
    }
    
    .theme-transitioning * {
      transition: all var(--theme-transition-duration) var(--theme-transition-timing) !important;
    }
  `;
};

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
  onThemeChange 
}: ThemeProviderProps) => {
  const [currentThemeName, setCurrentThemeName] = useState<ThemeName>(() => {
    if (initialTheme && isValidTheme(initialTheme)) {
      return initialTheme;
    }
    
    if (typeof window !== "undefined" && persistTheme) {
      try {
        const storedTheme = localStorage.getItem("themeName") as ThemeName;
        if (storedTheme && isValidTheme(storedTheme)) {
          return storedTheme;
        }
      } catch (error) {
        console.error("Failed to load theme from localStorage:", error);
      }
    }
    
    return DEFAULT_THEME;
  });
  
  const [themeLoading, setThemeLoading] = useState(false);
  const [lastAppliedTheme, setLastAppliedTheme] = useState<ThemeName | null>(null);

  const currentTheme = useMemo(() => 
    themeConfig[currentThemeName], 
    [currentThemeName]
  );

  const setTheme = useCallback((name: ThemeName) => {
    if (!isValidTheme(name)) {
      console.warn(`Theme "${name}" not found. Using default theme.`);
      name = DEFAULT_THEME;
    }
    
    if (name === currentThemeName && lastAppliedTheme === name) {
      return; // Already applied, no need to change
    }
    
    setThemeLoading(true);
    
    // Add transitioning class for smooth transitions
    if (enableTransitions) {
      document.body.classList.add('theme-transitioning');
    }
    
    setCurrentThemeName(name);
    setLastAppliedTheme(name);
    
    if (typeof window !== "undefined" && persistTheme) {
      try {
        localStorage.setItem("themeName", name);
      } catch (error) {
        console.error("Failed to save theme to localStorage:", error);
      }
    }
    
    // Call the callback if provided
    if (onThemeChange) {
      onThemeChange(themeConfig[name]);
    }
    
    // Remove transitioning class after animation completes
    if (enableTransitions) {
      setTimeout(() => {
        document.body.classList.remove('theme-transitioning');
        setThemeLoading(false);
      }, 600); // Match CSS transition duration
    } else {
      setThemeLoading(false);
    }
  }, [currentThemeName, lastAppliedTheme, persistTheme, enableTransitions, onThemeChange]);

  const cycleNextTheme = useCallback(() => {
    const nextTheme = getNextTheme(currentThemeName);
    setTheme(nextTheme);
  }, [currentThemeName, setTheme]);

  const cyclePreviousTheme = useCallback(() => {
    const prevTheme = getPreviousTheme(currentThemeName);
    setTheme(prevTheme);
  }, [currentThemeName, setTheme]);

  const resetTheme = useCallback(() => {
    setTheme(DEFAULT_THEME);
  }, [setTheme]);

  const getAllAvailableThemes = useCallback(() => {
    return getAllThemes();
  }, []);

  const isDarkTheme = useMemo(() => 
    currentTheme.isDark, 
    [currentTheme]
  );

  // Initialize theme on mount
  useEffect(() => {
    // Generate global CSS for transitions
    generateGlobalThemeCss();
    
    // Apply initial theme
    applyThemeStyles(currentTheme, false);
    setLastAppliedTheme(currentThemeName);
    
    // Listen for system color scheme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      // Optional: Auto-switch to dark/light theme based on system preference
      // Uncomment to enable auto-switching:
      const preferredTheme = e.matches ? 'dark' : 'light';
      // setTheme(preferredTheme as ThemeName);
    };
    
    mediaQuery.addEventListener('change', handleSystemThemeChange);
    
    // Listen for theme change events from other components
    const handleCustomThemeChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.theme && isValidTheme(customEvent.detail.theme)) {
        setTheme(customEvent.detail.theme);
      }
    };
    
    window.addEventListener('changetheme', handleCustomThemeChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
      window.removeEventListener('changetheme', handleCustomThemeChange);
    };
  }, []);

  // Apply theme when currentTheme changes
  useEffect(() => {
    if (currentThemeName !== lastAppliedTheme) {
      applyThemeStyles(currentTheme, enableTransitions);
      setLastAppliedTheme(currentThemeName);
    }
  }, [currentTheme, currentThemeName, lastAppliedTheme, enableTransitions]);

  // Context value
  const contextValue = useMemo<ThemeContextType>(() => ({
    currentThemeName,
    currentTheme,
    setTheme,
    cycleNextTheme,
    cyclePreviousTheme,
    resetTheme,
    getAllAvailableThemes,
    isDarkTheme,
    themeLoading,
    lastAppliedTheme,
  }), [
    currentThemeName,
    currentTheme,
    setTheme,
    cycleNextTheme,
    cyclePreviousTheme,
    resetTheme,
    getAllAvailableThemes,
    isDarkTheme,
    themeLoading,
    lastAppliedTheme,
  ]);

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook with additional utilities
export const useTheme = () => {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  
  // Additional utility functions that use the context
  const themeUtils = useMemo(() => ({
    // Check if a specific theme is active
    isActiveTheme: (themeName: ThemeName) => 
      context.currentThemeName === themeName,
    
    // Get theme by name
    getTheme: (themeName: ThemeName) => themeConfig[themeName],
    
    // Generate CSS for all themes (for SSR/SSG)
    getAllThemeCSS: () => 
      getAllThemes().map(theme => generateThemeCss(theme)).join('\n'),
    
    // Programmatically change theme with event
    changeThemeWithEvent: (themeName: ThemeName) => {
      if (isValidTheme(themeName)) {
        window.dispatchEvent(
          new CustomEvent('changetheme', { detail: { theme: themeName } })
        );
      }
    },
    
    // Get complementary themes (same category)
    getSimilarThemes: () => {
      const allThemes = getAllThemes();
      return allThemes.filter(
        theme => theme.category === context.currentTheme.category && 
                theme.id !== context.currentThemeName
      );
    },
  }), [context]);
  
  return {
    ...context,
    ...themeUtils,
  };
};

// Hook for theme-aware styling
export const useThemeAwareStyles = () => {
  const { currentTheme } = useTheme();
  
  return useMemo(() => ({
    // Get gradient for inline styles
    gradient: currentTheme.gradient,
    
    // Get color palette for styling
    colors: currentTheme.cssVars,
    
    // Get text colors
    textColors: currentTheme.textColors || {
      primary: currentTheme.isDark ? '#ffffff' : '#000000',
      secondary: currentTheme.isDark ? '#cccccc' : '#666666',
      accent: currentTheme.accent,
    },
    
    // Common theme-aware styles
    styles: {
      button: {
        backgroundColor: currentTheme.accent,
        color: currentTheme.isDark ? '#000000' : '#ffffff',
      },
      card: {
        backgroundColor: currentTheme.isDark ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.8)',
        backdropFilter: 'blur(10px)',
      },
    },
  }), [currentTheme]);
};