export type ThemeName =
  | "red"
  | "green"
  | "blue"
  | "roseGold"
  | "peach"
  | "aurora"
  | "ocean"
  | "sunset"
  | "jade";

export interface Theme {
  gradient: string;
  accent: string;
  cssVars: {
    goldPrimary: string;
    goldDark: string;
    goldLight: string;
    goldLightest: string;
    goldMedium: string;
  };
}

export const themeConfig: Record<ThemeName, Theme> = {
  red: {
    gradient: "radial-gradient(ellipse at center, #6f0000 0%, #200122 100%)",
    accent: "#efbf04",
    cssVars: {
      goldPrimary: "#efbf04",
      goldDark: "#dda20c",
      goldLight: "#ffd700",
      goldLightest: "#fffacd",
      goldMedium: "#ffdf00",
    },
  },
  green: {
    gradient:
      "radial-gradient(ellipse at center, #15803d 0%, #166534 50%, #052e16 100%)",
    accent: "#efbf04",
    cssVars: {
      goldPrimary: "#efbf04",
      goldDark: "#dda20c",
      goldLight: "#ffd700",
      goldLightest: "#fffacd",
      goldMedium: "#ffdf00",
    },
  },
  blue: {
    gradient: "radial-gradient(ellipse at center, #004e92 0%, #000428 100%)",
    accent: "#efbf04",
    cssVars: {
      goldPrimary: "#efbf04",
      goldDark: "#dda20c",
      goldLight: "#ffd700",
      goldLightest: "#fffacd",
      goldMedium: "#ffdf00",
    },
  },
  roseGold: {
    gradient: "radial-gradient(ellipse at center, #dbe6f6 0%, #c5796d 100%)",
    accent: "#5d2f40",
    cssVars: {
      goldPrimary: "#5d2f40",
      goldDark: "#4a2533",
      goldLight: "#8b4f62",
      goldLightest: "#b8849a",
      goldMedium: "#745142",
    },
  },
  peach: {
    gradient: "radial-gradient(ellipse at center, #ffedbc 0%, #ed4264 100%)",
    accent: "#5d2f40",
    cssVars: {
      goldPrimary: "#5d2f40",
      goldDark: "#4a2533",
      goldLight: "#8b4f62",
      goldLightest: "#b8849a",
      goldMedium: "#745142",
    },
  },
  aurora: {
    gradient:
      "radial-gradient(ellipse at center, #667eea 0%, #764ba2 50%, #2b1055 100%)",
    accent: "#fbbf24",
    cssVars: {
      goldPrimary: "#fbbf24",
      goldDark: "#f59e0b",
      goldLight: "#fcd34d",
      goldLightest: "#fef3c7",
      goldMedium: "#fbbf24",
    },
  },
  ocean: {
    gradient:
      "radial-gradient(ellipse at center, #006d77 0%, #003049 50%, #001219 100%)",
    accent: "#ffd60a",
    cssVars: {
      goldPrimary: "#ffd60a",
      goldDark: "#ffc300",
      goldLight: "#ffed4e",
      goldLightest: "#fff8dc",
      goldMedium: "#ffd60a",
    },
  },
  sunset: {
    gradient:
      "radial-gradient(ellipse at center, #ff6b35 0%, #f7931e 30%, #c1121f 70%, #370617 100%)",
    accent: "#ffe5d9",
    cssVars: {
      goldPrimary: "#ffe5d9",
      goldDark: "#ffcdb2",
      goldLight: "#fff0e8",
      goldLightest: "#fff5f0",
      goldMedium: "#ffe5d9",
    },
  },
  jade: {
    gradient:
      "radial-gradient(ellipse at center, #064e3b 0%, #022c22 50%, #0a0e0d 100%)",
    accent: "#10b981",
    cssVars: {
      goldPrimary: "#10b981",
      goldDark: "#059669",
      goldLight: "#34d399",
      goldLightest: "#d1fae5",
      goldMedium: "#10b981",
    },
  },
};

export const DEFAULT_THEME: ThemeName = "red";

export const getTheme = (themeName: ThemeName = DEFAULT_THEME): Theme => {
  return themeConfig[themeName];
};
