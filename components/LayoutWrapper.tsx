"use client";

import { FC, ReactNode, useEffect, useMemo, useRef } from "react";
import {
  motion,
  useScroll,
  useMotionValue,
  useMotionValueEvent,
  animate,
  type MotionValue,
} from "framer-motion";
import PatternBackground from "./PatternBackground";
import LiquidGlassFrame from "./LiquidGlassFrame";
import { useTheme } from "../providers/ThemeContext";

interface LayoutWrapperProps {
  children: ReactNode;
}

type OpacityRange = readonly [number, number];
type OrbShape = "circle" | "diagonalBlob" | "inverseBlob" | "pillBlob";
type OrbAnimation = "floatSlow" | "floatMedium" | "floatFast";

interface OrbConfig {
  position: string;
  size: string;
  shape: OrbShape;
  rotation?: string;
  blur: "blur-xs" | "blur-sm";
  animation: OrbAnimation;
  opacity: OpacityRange;
}

const SHAPE_CLASSES: Record<OrbShape, string> = {
  circle: "rounded-full",
  diagonalBlob: "rounded-[50%_0_50%_0]",
  inverseBlob: "rounded-[0_50%_0_50%]",
  pillBlob: "rounded-[50%_50%_50%_50%/60%_60%_40%_40%]",
};

const ANIMATION_CLASSES: Record<OrbAnimation, string> = {
  floatSlow: "animate-khmer-float-1",
  floatMedium: "animate-khmer-float-2",
  floatFast: "animate-khmer-float-3",
};

const ORB_DATA: readonly OrbConfig[] = [
  {
    position: "top-[10%] left-[15%]",
    size: "w-16 h-16 sm:w-24 sm:h-24",
    shape: "diagonalBlob",
    rotation: "rotate-45",
    blur: "blur-sm",
    animation: "floatSlow",
    opacity: [0.4, 0.2],
  },
  {
    position: "top-[30%] right-[10%]",
    size: "w-14 h-14 sm:w-20 sm:h-20",
    shape: "circle",
    blur: "blur-xs",
    animation: "floatMedium",
    opacity: [0.35, 0.25],
  },
  {
    position: "bottom-[20%] left-[25%]",
    size: "w-20 h-20 sm:w-28 sm:h-28",
    shape: "inverseBlob",
    rotation: "-rotate-30",
    blur: "blur-sm",
    animation: "floatFast",
    opacity: [0.3, 0.15],
  },
  {
    position: "top-[55%] left-[8%]",
    size: "w-12 h-12 sm:w-16 sm:h-16",
    shape: "circle",
    blur: "blur-xs",
    animation: "floatSlow",
    opacity: [0.3, 0.2],
  },
  {
    position: "bottom-[10%] right-[18%]",
    size: "w-16 h-24 sm:w-20 sm:h-32",
    shape: "pillBlob",
    rotation: "rotate-90",
    blur: "blur-sm",
    animation: "floatMedium",
    opacity: [0.25, 0.15],
  },
];

const hexToRgb = (hex: string): string => {
  const match = hex.trim().match(/^#?([A-Fa-f0-9]{6})$/);
  if (!match) return "255, 255, 255";
  const v = match[1];
  return `${parseInt(v.slice(0, 2), 16)}, ${parseInt(
    v.slice(2, 4),
    16
  )}, ${parseInt(v.slice(4, 6), 16)}`;
};

const getGradient = (color: string, [start, end]: OpacityRange) => {
  const rgb = hexToRgb(color);
  return `linear-gradient(to top right, rgba(${rgb}, ${start}) 0%, rgba(${rgb}, ${end}) 100%)`;
};

const MASK_TOP = `0%`;
const MASK_BOTTOM = `100%`;
const MASK_TOP_INSET = `5%`;
const MASK_BOTTOM_INSET = `95%`;
const TRANSPARENT = `#0000`;
const OPAQUE = `#000`;

function useScrollOverflowMask(scrollYProgress: MotionValue<number>) {
  const maskImage = useMotionValue(
    `linear-gradient(to bottom, ${OPAQUE} ${MASK_TOP}, ${OPAQUE} ${MASK_BOTTOM_INSET}, ${TRANSPARENT} ${MASK_BOTTOM})`
  );

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    if (value === 0) {
      animate(
        maskImage,
        `linear-gradient(to bottom, ${OPAQUE} ${MASK_TOP}, ${OPAQUE} ${MASK_BOTTOM_INSET}, ${TRANSPARENT} ${MASK_BOTTOM})`,
        { duration: 0.2, ease: "easeOut" }
      );
    } else if (value === 1) {
      animate(
        maskImage,
        `linear-gradient(to bottom, ${TRANSPARENT} ${MASK_TOP}, ${OPAQUE} ${MASK_TOP_INSET}, ${OPAQUE} ${MASK_BOTTOM})`,
        { duration: 0.2, ease: "easeOut" }
      );
    } else {
      animate(
        maskImage,
        `linear-gradient(to bottom, ${TRANSPARENT} ${MASK_TOP}, ${OPAQUE} ${MASK_TOP_INSET}, ${OPAQUE} ${MASK_BOTTOM_INSET}, ${TRANSPARENT} ${MASK_BOTTOM})`,
        { duration: 0.2, ease: "easeOut" }
      );
    }
  });

  return maskImage;
}

const GlobalStyles = () => (
  <style>{`
    .scrollbar-hide::-webkit-scrollbar { display: none; }
    .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
  `}</style>
);

const LayoutWrapper: FC<LayoutWrapperProps> = ({ children }) => {
  const { currentTheme } = useTheme();

  const scrollRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ container: scrollRef });
  const maskImage = useScrollOverflowMask(scrollYProgress);

  useEffect(() => {
    document.body.style.backgroundImage = "none";
    document.body.style.backgroundColor = "transparent";
  }, []);

  const renderedOrbs = useMemo(() => {
    return ORB_DATA.map((orb, index) => ({
      key: index,
      className: [
        "absolute pointer-events-none",
        orb.position,
        orb.size,
        SHAPE_CLASSES[orb.shape],
        orb.rotation,
        orb.blur,
        ANIMATION_CLASSES[orb.animation],
      ]
        .filter(Boolean)
        .join(" "),
      style: {
        background: getGradient(currentTheme.accent, orb.opacity),
      },
    }));
  }, [currentTheme.accent]);

  return (
    <div className="relative flex h-dvh w-full items-center justify-center overflow-hidden px-2">
      <GlobalStyles />
      <div
        className="absolute inset-0 z-0"
        style={{ background: currentTheme.gradient }}
      />
      <PatternBackground />
      {renderedOrbs.map((orb) => (
        <div key={orb.key} className={orb.className} style={orb.style} />
      ))}

      <LiquidGlassFrame
        accent={currentTheme.accent}
        className="h-[98dvh] sm:h-dvh w-full max-w-3xl"
      >
        <motion.div
          className="relative h-full w-full overflow-hidden"
          style={{
            maskImage,
            WebkitMaskImage: maskImage,
          }}
        >
          <div
            ref={scrollRef}
            className="h-full w-full overflow-y-auto scrollbar-hide px-4 py-2 sm:px-8"
          >
            {children}

            <div className="h-8 w-full" />
          </div>
        </motion.div>
      </LiquidGlassFrame>
    </div>
  );
};

export default LayoutWrapper;
