"use client";

import { FC, ReactNode, useEffect, useMemo } from "react";
import PatternBackground from "./PatternBackground";
import TopLeft from "./kbach/TopLeft";
import TopRight from "./kbach/TopRight";
import BottomLeft from "./kbach/BottomLeft";
import BottomRight from "./kbach/BottomRight";
import { useTheme } from "../providers/ThemeContext";
import LiquidGlassFrame from "./LiquidGlassFrame";


/* ================================
   Types
================================ */

interface LayoutWrapperProps {
  children: ReactNode;
}

type OpacityRange = readonly [number, number];

type OrbAnimationPreset =
  | "floatSlow"
  | "floatMedium"
  | "floatFast";

type OrbShapePreset =
  | "circle"
  | "diagonalBlob"
  | "inverseBlob"
  | "pillBlob";

interface OrbPreset {
  position: string;
  size: string;
  shape: OrbShapePreset;
  rotation?: string;
  blur: "blur-xs" | "blur-sm";
  animation: OrbAnimationPreset;
  opacity: OpacityRange;
}

/* ================================
   Helpers
================================ */

const hexToRgb = (hex: string): string => {
  const match = hex.trim().match(/^#?([A-Fa-f0-9]{6})$/);
  if (!match) return "0, 0, 0";

  const v = match[1];
  return `${parseInt(v.slice(0, 2), 16)}, ${parseInt(v.slice(2, 4), 16)}, ${parseInt(v.slice(4, 6), 16)}`;
};

const gradientFromAccent = (
  accent: string,
  [from, to]: OpacityRange
): string => {
  const rgb = hexToRgb(accent);
  return `linear-gradient(to top right, rgba(${rgb}, ${from}) 0%, rgba(${rgb}, ${to}) 100%)`;
};

const SHAPE_CLASS: Record<OrbShapePreset, string> = {
  circle: "rounded-full",
  diagonalBlob: "rounded-[50%_0_50%_0]",
  inverseBlob: "rounded-[0_50%_0_50%]",
  pillBlob: "rounded-[50%_50%_50%_50%/60%_60%_40%_40%]",
};

const ANIMATION_CLASS: Record<OrbAnimationPreset, string> = {
  floatSlow: "animate-khmer-float-1",
  floatMedium: "animate-khmer-float-2",
  floatFast: "animate-khmer-float-3",
};

/* ================================
   Presets
================================ */

const ORBS: readonly OrbPreset[] = [
  {
    position: "top-[10%] left-[15%]",
    size: "w-24 h-24",
    shape: "diagonalBlob",
    rotation: "rotate-45",
    blur: "blur-sm",
    animation: "floatSlow",
    opacity: [0.4, 0.2],
  },
  {
    position: "top-[30%] right-[10%]",
    size: "w-20 h-20",
    shape: "circle",
    blur: "blur-xs",
    animation: "floatMedium",
    opacity: [0.35, 0.25],
  },
  {
    position: "bottom-[20%] left-[25%]",
    size: "w-28 h-28",
    shape: "inverseBlob",
    rotation: "-rotate-30",
    blur: "blur-sm",
    animation: "floatFast",
    opacity: [0.3, 0.15],
  },
  {
    position: "top-[55%] left-[8%]",
    size: "w-16 h-16",
    shape: "circle",
    blur: "blur-xs",
    animation: "floatSlow",
    opacity: [0.3, 0.2],
  },
  {
    position: "bottom-[10%] right-[18%]",
    size: "w-20 h-32",
    shape: "pillBlob",
    rotation: "rotate-90",
    blur: "blur-sm",
    animation: "floatMedium",
    opacity: [0.25, 0.15],
  },
];

/* ================================
   Component
================================ */

const LayoutWrapperOld: FC<LayoutWrapperProps> = ({ children }) => {
  const { currentTheme } = useTheme();

  useEffect(() => {
    const { backgroundImage, backgroundColor } = document.body.style;
    document.body.style.backgroundImage = "none";
    document.body.style.backgroundColor = "transparent";
    return () => {
      document.body.style.backgroundImage = backgroundImage || "";
      document.body.style.backgroundColor = backgroundColor || "";
    };
  }, []);

  const orbStyles = useMemo(
    () =>
      ORBS.map((orb) => ({
        className: [
          "absolute",
          orb.position,
          orb.size,
          SHAPE_CLASS[orb.shape],
          orb.rotation,
          orb.blur,
          ANIMATION_CLASS[orb.animation],
        ]
          .filter(Boolean)
          .join(" "),
        background: gradientFromAccent(currentTheme.accent, orb.opacity),
      })),
    [currentTheme.accent]
  );

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden p-2">
      <div
        key={currentTheme.gradient}
        className="absolute inset-0"
        style={{ background: currentTheme.gradient }}
      />

      <PatternBackground />

      {orbStyles.map((orb, i) => (
        <div key={i} className={orb.className} style={{ background: orb.background }} />
      ))}

      <div className="flex items-center justify-center w-screen min-h-[400px] rounded-3xl">
        <LiquidGlassFrame accent={currentTheme.accent}>
          {children}
        </LiquidGlassFrame>
      </div>

    </div>
  );
};

export default LayoutWrapperOld;
