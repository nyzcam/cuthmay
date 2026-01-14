export type ThemeName =
  | "red"
  | "green"
  | "blue"
  | "roseGold"
  | "peach"
  | "aurora"
  | "ocean"
  | "sunset"
  | "jade"
  | "silver"
  | "midnight"
  | "lavender";

export type ThemeCategory = "classic" | "premium" | "nature" | "vibrant" | "minimal";

export interface ColorScale {
  primary: string;
  dark: string;
  light: string;
  lightest: string;
  medium: string;
}

export interface TextColors {
  primary: string;
  secondary: string;
  accent: string;
  muted?: string;
}

export interface Theme {
  id: ThemeName;
  name: string;
  description: string;
  gradient: string;
  accent: string;
  cssVars: ColorScale;
  palette?: ColorScale;
  textColors?: TextColors;
  category: ThemeCategory;
  isDark: boolean;
  tags?: string[];
  accessibility?: {
    contrastRatio: number;
    wcagLevel: "AA" | "AAA";
  };
}

export interface ThemePreset {
  name: string;
  themes: ThemeName[];
  description: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const DEFAULT_THEME: ThemeName = "jade";

// Color palettes for reuse
export const GOLD_PALETTE: ColorScale = {
  primary: "#efbf04",
  dark: "#dda20c",
  light: "#ffd700",
  lightest: "#fffacd",
  medium: "#ffdf00",
};

export const ROSEGOLD_PALETTE: ColorScale = {
  primary: "#5d2f40",
  dark: "#4a2533",
  light: "#8b4f62",
  lightest: "#b8849a",
  medium: "#745142",
};

export const SILVER_PALETTE: ColorScale = {
  primary: "#9fa6ad",
  dark: "#808589",
  light: "#8c9194",
  lightest: "#a7adb0",
  medium: "#b1b6b8",
};

export const AURORA_PALETTE: ColorScale = {
  primary: "#fbbf24",
  dark: "#f59e0b",
  light: "#fcd34d",
  lightest: "#fef3c7",
  medium: "#fbbf24",
};

export const OCEAN_PALETTE: ColorScale = {
  primary: "#ffd60a",
  dark: "#ffc300",
  light: "#ffed4e",
  lightest: "#fff8dc",
  medium: "#ffd60a",
};

export const SUNSET_PALETTE: ColorScale = {
  primary: "#ffe5d9",
  dark: "#ffcdb2",
  light: "#fff0e8",
  lightest: "#fff5f0",
  medium: "#ffe5d9",
};

export const JADE_PALETTE: ColorScale = {
  primary: "#10b981",
  dark: "#059669",
  light: "#34d399",
  lightest: "#d1fae5",
  medium: "#10b981",
};

export const MIDNIGHT_PALETTE: ColorScale = {
  primary: "#818cf8",
  dark: "#6366f1",
  light: "#a5b4fc",
  lightest: "#e0e7ff",
  medium: "#818cf8",
};

export const LAVENDER_PALETTE: ColorScale = {
  primary: "#c084fc",
  dark: "#a855f7",
  light: "#d8b4fe",
  lightest: "#f3e8ff",
  medium: "#c084fc",
};

// ============================================================================
// THEME CONFIGURATION
// ============================================================================

export const themeConfig: Record<ThemeName, Theme> = {
  red: {
    id: "red",
    name: "Crimson Gold",
    description: "Deep red background with golden accents",
    gradient: "radial-gradient(ellipse at center, #6f0000 0%, #200122 100%)",
    accent: "#efbf04",
    cssVars: GOLD_PALETTE,
    textColors: {
      primary: "#ffffff",
      secondary: "#f0f0f0",
      accent: "#efbf04",
      muted: "#cccccc",
    },
    category: "classic",
    isDark: true,
    tags: ["dramatic", "bold", "luxurious"],
    accessibility: {
      contrastRatio: 7.2,
      wcagLevel: "AAA",
    },
  },
  green: {
    id: "green",
    name: "Emerald Forest",
    description: "Rich green gradient with golden highlights",
    gradient:
      "radial-gradient(ellipse at center, #15803d 0%, #166534 50%, #052e16 100%)",
    accent: "#efbf04",
    cssVars: GOLD_PALETTE,
    textColors: {
      primary: "#ffffff",
      secondary: "#e0f2e9",
      accent: "#efbf04",
      muted: "#a7d8b5",
    },
    category: "nature",
    isDark: true,
    tags: ["natural", "calming", "organic"],
    accessibility: {
      contrastRatio: 6.8,
      wcagLevel: "AAA",
    },
  },
  blue: {
    id: "blue",
    name: "Royal Blue",
    description: "Deep blue gradient with gold accents",
    gradient: "radial-gradient(ellipse at center, #004e92 0%, #000428 100%)",
    accent: "#efbf04",
    cssVars: GOLD_PALETTE,
    textColors: {
      primary: "#ffffff",
      secondary: "#e6f0ff",
      accent: "#efbf04",
      muted: "#b3d1ff",
    },
    category: "classic",
    isDark: true,
    tags: ["professional", "trustworthy", "elegant"],
    accessibility: {
      contrastRatio: 8.1,
      wcagLevel: "AAA",
    },
  },
  roseGold: {
    id: "roseGold",
    name: "Rose Gold",
    description: "Elegant rose gold with pink undertones",
    gradient: "radial-gradient(ellipse at center, #dbe6f6 0%, #c5796d 100%)",
    accent: "#5d2f40",
    cssVars: ROSEGOLD_PALETTE,
    textColors: {
      primary: "#2c1810",
      secondary: "#5d2f40",
      accent: "#5d2f40",
      muted: "#8b6f5c",
    },
    category: "premium",
    isDark: false,
    tags: ["luxurious", "warm", "sophisticated"],
    accessibility: {
      contrastRatio: 5.5,
      wcagLevel: "AA",
    },
  },
  peach: {
    id: "peach",
    name: "Peach Blossom",
    description: "Warm peach gradient with deep rose accents",
    gradient: "radial-gradient(ellipse at center, #ffedbc 0%, #ed4264 100%)",
    accent: "#5d2f40",
    cssVars: ROSEGOLD_PALETTE,
    textColors: {
      primary: "#2c1810",
      secondary: "#5d2f40",
      accent: "#5d2f40",
      muted: "#8b6f5c",
    },
    category: "vibrant",
    isDark: false,
    tags: ["energetic", "warm", "playful"],
    accessibility: {
      contrastRatio: 4.8,
      wcagLevel: "AA",
    },
  },
  aurora: {
    id: "aurora",
    name: "Northern Lights",
    description: "Vibrant purple-blue gradient with amber accents",
    gradient:
      "radial-gradient(ellipse at center, #667eea 0%, #764ba2 50%, #2b1055 100%)",
    accent: "#fbbf24",
    cssVars: AURORA_PALETTE,
    textColors: {
      primary: "#ffffff",
      secondary: "#e0e7ff",
      accent: "#fbbf24",
      muted: "#c7d2fe",
    },
    category: "vibrant",
    isDark: true,
    tags: ["mystical", "vibrant", "ethereal"],
    accessibility: {
      contrastRatio: 6.5,
      wcagLevel: "AA",
    },
  },
  ocean: {
    id: "ocean",
    name: "Deep Ocean",
    description: "Ocean blue gradient with bright gold accents",
    gradient:
      "radial-gradient(ellipse at center, #006d77 0%, #003049 50%, #001219 100%)",
    accent: "#ffd60a",
    cssVars: OCEAN_PALETTE,
    textColors: {
      primary: "#ffffff",
      secondary: "#e0f7fa",
      accent: "#ffd60a",
      muted: "#b2ebf2",
    },
    category: "nature",
    isDark: true,
    tags: ["deep", "tranquil", "mysterious"],
    accessibility: {
      contrastRatio: 7.5,
      wcagLevel: "AAA",
    },
  },
  sunset: {
    id: "sunset",
    name: "Fiery Sunset",
    description: "Warm sunset gradient with soft peach accents",
    gradient:
      "radial-gradient(ellipse at center, #ff6b35 0%, #f7931e 30%, #c1121f 70%, #370617 100%)",
    accent: "#ffe5d9",
    cssVars: SUNSET_PALETTE,
    textColors: {
      primary: "#ffffff",
      secondary: "#ffedd5",
      accent: "#ffe5d9",
      muted: "#fed7aa",
    },
    category: "vibrant",
    isDark: true,
    tags: ["warm", "dramatic", "energetic"],
    accessibility: {
      contrastRatio: 6.2,
      wcagLevel: "AA",
    },
  },
  jade: {
    id: "jade",
    name: "Jade Serenity",
    description: "Deep green gradient with jade accents",
    gradient:
      "radial-gradient(ellipse at center, #064e3b 0%, #022c22 50%, #0a0e0d 100%)",
    accent: "#10b981",
    cssVars: JADE_PALETTE,
    textColors: {
      primary: "#ffffff",
      secondary: "#d1fae5",
      accent: "#10b981",
      muted: "#a7f3d0",
    },
    category: "nature",
    isDark: true,
    tags: ["peaceful", "balanced", "natural"],
    accessibility: {
      contrastRatio: 7.8,
      wcagLevel: "AAA",
    },
  },
  silver: {
    id: "silver",
    name: "Modern Silver",
    description: "Clean silver gradient with cool gray accents",
    gradient:
      "radial-gradient(ellipse at center, #e6e9ee 0%, #cfd6dc 50%, #9aa5b1 100%)",
    accent: "#6b7280",
    cssVars: SILVER_PALETTE,
    textColors: {
      primary: "#1f2937",
      secondary: "#4b5563",
      accent: "#6b7280",
      muted: "#9ca3af",
    },
    category: "minimal",
    isDark: false,
    tags: ["clean", "modern", "professional"],
    accessibility: {
      contrastRatio: 6.1,
      wcagLevel: "AA",
    },
  },
  midnight: {
    id: "midnight",
    name: "Midnight Dreams",
    description: "Deep indigo gradient with violet accents",
    gradient:
      "radial-gradient(ellipse at center, #312e81 0%, #1e1b4b 50%, #0f0a1e 100%)",
    accent: "#818cf8",
    cssVars: MIDNIGHT_PALETTE,
    textColors: {
      primary: "#ffffff",
      secondary: "#e0e7ff",
      accent: "#818cf8",
      muted: "#c7d2fe",
    },
    category: "vibrant",
    isDark: true,
    tags: ["deep", "calming", "mysterious"],
    accessibility: {
      contrastRatio: 8.5,
      wcagLevel: "AAA",
    },
  },
  lavender: {
    id: "lavender",
    name: "Lavender Fields",
    description: "Soft lavender gradient with purple accents",
    gradient:
      "radial-gradient(ellipse at center, #f5f3ff 0%, #ede9fe 50%, #ddd6fe 100%)",
    accent: "#a855f7",
    cssVars: LAVENDER_PALETTE,
    textColors: {
      primary: "#581c87",
      secondary: "#6b21a8",
      accent: "#a855f7",
      muted: "#9333ea",
    },
    category: "minimal",
    isDark: false,
    tags: ["soft", "calming", "elegant"],
    accessibility: {
      contrastRatio: 5.8,
      wcagLevel: "AA",
    },
  },
};

// ============================================================================
// THEME PRESETS
// ============================================================================

export const themePresets: ThemePreset[] = [
  {
    name: "Dark Collection",
    themes: ["red", "green", "blue", "aurora", "ocean", "sunset", "jade", "midnight"],
    description: "All dark-themed options for nighttime use",
  },
  {
    name: "Light Collection",
    themes: ["roseGold", "peach", "silver", "lavender"],
    description: "Light and airy themes for daytime",
  },
  {
    name: "Nature Inspired",
    themes: ["green", "ocean", "jade"],
    description: "Themes inspired by natural elements",
  },
  {
    name: "Bold & Vibrant",
    themes: ["aurora", "sunset", "peach", "midnight"],
    description: "Eye-catching, energetic themes",
  },
];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export const getTheme = (themeName: ThemeName = DEFAULT_THEME): Theme => {
  return themeConfig[themeName];
};

export const getAllThemes = (): Theme[] => {
  return Object.values(themeConfig);
};

export const getThemesByCategory = (category: ThemeCategory): Theme[] => {
  return getAllThemes().filter((theme) => theme.category === category);
};

export const getDarkThemes = (): Theme[] => {
  return getAllThemes().filter((theme) => theme.isDark);
};

export const getLightThemes = (): Theme[] => {
  return getAllThemes().filter((theme) => !theme.isDark);
};

export const getThemeNames = (): ThemeName[] => {
  return Object.keys(themeConfig) as ThemeName[];
};

export const isValidTheme = (themeName: string): themeName is ThemeName => {
  return themeName in themeConfig;
};

export const getThemesByTag = (tag: string): Theme[] => {
  return getAllThemes().filter(
    (theme) => theme.tags?.some((t) => t.toLowerCase() === tag.toLowerCase())
  );
};

export const getAccessibleThemes = (level: "AA" | "AAA" = "AA"): Theme[] => {
  return getAllThemes().filter(
    (theme) => theme.accessibility && theme.accessibility.wcagLevel === level
  );
};

export const getRandomTheme = (excludeCurrent?: ThemeName): Theme => {
  const themes = excludeCurrent
    ? getAllThemes().filter((t) => t.id !== excludeCurrent)
    : getAllThemes();
  return themes[Math.floor(Math.random() * themes.length)];
};

// Utility to convert theme to CSS custom properties
export const themeToCssVars = (theme: Theme): Record<string, string> => {
  const vars: Record<string, string> = {
    "--theme-gradient": theme.gradient,
    "--theme-accent": theme.accent,
  };

  Object.entries(theme.cssVars).forEach(([key, value]) => {
    vars[`--theme-${key}`] = value;
  });

  if (theme.textColors) {
    Object.entries(theme.textColors).forEach(([key, value]) => {
      vars[`--theme-text-${key}`] = value;
    });
  }

  return vars;
};

// Generate CSS for a theme
export const generateThemeCss = (theme: Theme): string => {
  const vars = themeToCssVars(theme);
  const cssVars = Object.entries(vars)
    .map(([key, value]) => `  ${key}: ${value};`)
    .join("\n");

  return `
.theme-${theme.id} {
${cssVars}
  background: ${theme.gradient};
}
  `.trim();
};

// Generate all theme CSS
export const generateAllThemesCss = (): string => {
  return getAllThemes()
    .map((theme) => generateThemeCss(theme))
    .join("\n\n");
};

// Get next theme in sequence (for theme cycling)
export const getNextTheme = (currentTheme: ThemeName): ThemeName => {
  const themes = getThemeNames();
  const currentIndex = themes.indexOf(currentTheme);
  const nextIndex = (currentIndex + 1) % themes.length;
  return themes[nextIndex];
};

// Get previous theme in sequence
export const getPreviousTheme = (currentTheme: ThemeName): ThemeName => {
  const themes = getThemeNames();
  const currentIndex = themes.indexOf(currentTheme);
  const prevIndex = (currentIndex - 1 + themes.length) % themes.length;
  return themes[prevIndex];
};

// Get next theme in category
export const getNextThemeInCategory = (
  currentTheme: ThemeName
): ThemeName | null => {
  const current = getTheme(currentTheme);
  const categoryThemes = getThemesByCategory(current.category);
  
  if (categoryThemes.length <= 1) return null;
  
  const currentIndex = categoryThemes.findIndex((t) => t.id === currentTheme);
  const nextIndex = (currentIndex + 1) % categoryThemes.length;
  return categoryThemes[nextIndex].id;
};

// Find theme by display name
export const findThemeByName = (name: string): Theme | undefined => {
  return getAllThemes().find(
    (theme) =>
      theme.name.toLowerCase().includes(name.toLowerCase()) ||
      theme.id.toLowerCase().includes(name.toLowerCase())
  );
};

// Find themes matching search query
export const searchThemes = (query: string): Theme[] => {
  const lowerQuery = query.toLowerCase();
  return getAllThemes().filter(
    (theme) =>
      theme.name.toLowerCase().includes(lowerQuery) ||
      theme.description.toLowerCase().includes(lowerQuery) ||
      theme.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery)) ||
      theme.category.toLowerCase().includes(lowerQuery)
  );
};

// Get theme contrast for accessibility
export const getThemeContrast = (theme: Theme): number | null => {
  return theme.accessibility?.contrastRatio ?? null;
};

// Apply theme to DOM element
export const applyThemeToElement = (
  element: HTMLElement,
  theme: Theme
): void => {
  const vars = themeToCssVars(theme);
  Object.entries(vars).forEach(([key, value]) => {
    element.style.setProperty(key, value);
  });
  element.className = `theme-${theme.id}`;
};

// Get complementary theme (opposite darkness)
export const getComplementaryTheme = (currentTheme: ThemeName): Theme => {
  const current = getTheme(currentTheme);
  const complementary = current.isDark ? getLightThemes() : getDarkThemes();
  
  // Try to find same category first
  const sameCategoryComp = complementary.filter(
    (t) => t.category === current.category
  );
  
  if (sameCategoryComp.length > 0) {
    return sameCategoryComp[0];
  }
  
  return complementary[0];
};

// Export theme as JSON
export const exportTheme = (theme: Theme): string => {
  return JSON.stringify(theme, null, 2);
};

// Validate theme object
export const validateTheme = (theme: Partial<Theme>): boolean => {
  const required: (keyof Theme)[] = [
    "id",
    "name",
    "description",
    "gradient",
    "accent",
    "cssVars",
    "category",
    "isDark",
  ];
  
  return required.every((field) => field in theme && theme[field] !== undefined);
};