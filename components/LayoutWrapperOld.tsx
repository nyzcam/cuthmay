"use client";
import { FC, ReactNode, useEffect, useMemo } from "react";
import PatternBackground from "./PatternBackground";
import TopLeft from "./kbach/TopLeft";
import TopRight from "./kbach/TopRight";
import BottomLeft from "./kbach/BottomLeft";
import BottomRight from "./kbach/BottomRight";
import { useTheme } from "../providers/ThemeContext";

interface LayoutWrapperProps {
  children: ReactNode;
}

// ----------------------------------------------------------------------
// Utilities & Config
// ----------------------------------------------------------------------

const hexToRgbString = (hex: string): string => {
  try {
    const normalized = hex?.trim();
    const match = normalized && normalized.match(/^#?([A-Fa-f0-9]{6})$/);
    if (!match) return "0, 0, 0";

    const hexVal = match[1];
    const r = parseInt(hexVal.slice(0, 2), 16);
    const g = parseInt(hexVal.slice(2, 4), 16);
    const b = parseInt(hexVal.slice(4, 6), 16);
    return `${r}, ${g}, ${b}`;
  } catch (e) {
    return "0, 0, 0";
  }
};

const FLOATING_ORBS = [
  {
    className: "top-[10%] left-[15%] w-24 h-24 rounded-[50%_0_50%_0] transform rotate-45 blur-sm animate-khmer-float-1",
    opacityStart: 0.4,
    opacityEnd: 0.2,
  },
  {
    className: "top-[30%] right-[10%] w-20 h-20 rounded-full blur-xs animate-khmer-float-2",
    opacityStart: 0.35,
    opacityEnd: 0.25,
  },
  {
    className: "bottom-[20%] left-[25%] w-28 h-28 rounded-[0_50%_0_50%] transform -rotate-30 blur-sm animate-khmer-float-3",
    opacityStart: 0.3,
    opacityEnd: 0.15,
  },
  {
    className: "top-[55%] left-[8%] w-16 h-16 rounded-full blur-xs animate-khmer-float-1",
    opacityStart: 0.3,
    opacityEnd: 0.2,
  },
  {
    className: "bottom-[10%] right-[18%] w-20 h-32 rounded-[50%_50%_50%_50%/60%_60%_40%_40%] transform rotate-90 blur-sm animate-khmer-float-2",
    opacityStart: 0.25,
    opacityEnd: 0.15,
  },
];

// ----------------------------------------------------------------------
// Component
// ----------------------------------------------------------------------

const LayoutWrapper: FC<LayoutWrapperProps> = ({ children }) => {
  const { currentTheme } = useTheme();

  // Handle Body Styles
  useEffect(() => {
    // Save previous styles
    const prevBackgroundImage = document.body.style.backgroundImage;
    const prevBackgroundColor = document.body.style.backgroundColor;

    // Apply overrides
    document.body.style.backgroundImage = "none";
    document.body.style.backgroundColor = "transparent";

    // Restore on unmount
    return () => {
      document.body.style.backgroundImage = prevBackgroundImage || "";
      document.body.style.backgroundColor = prevBackgroundColor || "";
    };
  }, []);

  // Calculate RGB once for the current theme
  const accentRgb = useMemo(
    () => hexToRgbString(currentTheme.accent),
    [currentTheme.accent]
  );

  return (
    <div className="min-h-screen w-full overflow-hidden relative flex items-center justify-center p-2">
      {/* Main Background Gradient */}
      <div
        key={currentTheme.gradient}
        className="absolute inset-0"
        style={{ background: currentTheme.gradient }}
      />

      <PatternBackground />

      {/* Floating Orbs */}
      {FLOATING_ORBS.map((orb, index) => (
        <div
          key={index}
          className={`absolute ${orb.className}`}
          aria-hidden="true"
          style={{
            background: `linear-gradient(to top right, rgba(${accentRgb}, ${orb.opacityStart}) 0%, rgba(${accentRgb}, ${orb.opacityEnd}) 100%)`,
          }}
        />
      ))}

      {/* Glass Container */}
      <div className="glass-container relative z-20 flex flex-col items-center justify-center w-full max-w-3xl px-2 rounded-3xl">
        <div className="glass-filter" />
        <div className="glass-overlay" />
        <div className="glass-specular" />
        
        <div
          className="glass-content"
          style={{ borderColor: `${currentTheme.accent}40` }}
        >
          {/* Vertical Decorative Lines */}
          <span
            className="absolute top-32 bottom-32 left-4 w-px"
            style={{
              background: `linear-gradient(to bottom, transparent, ${currentTheme.accent}, transparent)`,
            }}
          />
          <span
            className="absolute top-32 bottom-32 right-4 w-px"
            style={{
              background: `linear-gradient(to bottom, transparent, ${currentTheme.accent}, transparent)`,
            }}
          />

          {/* Corners */}
          <TopLeft color={currentTheme.accent} />
          <TopRight color={currentTheme.accent} />
          
          {children}
          
          <BottomLeft color={currentTheme.accent} />
          <BottomRight color={currentTheme.accent} />
        </div>

        {/* SVG Filter Definition (Hidden from layout) */}
        <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
          <defs>
            <filter id="lensFilter" x="0%" y="0%" width="100%" height="100%" filterUnits="objectBoundingBox">
              <feComponentTransfer in="SourceAlpha" result="alpha">
                <feFuncA type="identity" />
              </feComponentTransfer>
              <feGaussianBlur in="alpha" stdDeviation="50" result="blur" />
              <feDisplacementMap in="SourceGraphic" in2="blur" scale="50" xChannelSelector="A" yChannelSelector="A" />
            </filter>
          </defs>
        </svg>
      </div>
    </div>
  );
};

export default LayoutWrapper;