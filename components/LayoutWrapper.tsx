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
import TopLeft from "./kbach/TopLeft";
import TopRight from "./kbach/TopRight";
import BottomLeft from "./kbach/BottomLeft";
import BottomRight from "./kbach/BottomRight";
import { useTheme } from "../lib/ThemeContext";

const top = `0%`;
const bottom = `100%`;
const topInset = `15%`;
const bottomInset = `85%`;
const transparent = `#0000`;
const opaque = `#000`;

function useScrollOverflowMask(scrollYProgress: MotionValue<number>) {
  const maskImage = useMotionValue(
    `linear-gradient(to bottom, ${opaque} ${top}, ${opaque} ${bottomInset}, ${transparent} ${bottom})`
  );

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    const isAtTop = value === 0;
    const isAtBottom = value === 1;
    const wasAtAnEdge =
      scrollYProgress.getPrevious() === 0 ||
      scrollYProgress.getPrevious() === 1;

    if (isAtTop) {
      animate(
        maskImage,
        `linear-gradient(to bottom, ${opaque} ${top}, ${opaque} ${bottomInset}, ${transparent} ${bottom})`,
        { duration: 0.2, ease: "easeOut" }
      );
    } else if (isAtBottom) {
      animate(
        maskImage,
        `linear-gradient(to bottom, ${transparent} ${top}, ${opaque} ${topInset}, ${opaque} ${bottom})`,
        { duration: 0.2, ease: "easeOut" }
      );
    } else if (wasAtAnEdge) {
      animate(
        maskImage,
        `linear-gradient(to bottom, ${transparent} ${top}, ${opaque} ${topInset}, ${opaque} ${bottomInset}, ${transparent} ${bottom})`,
        { duration: 0.2, ease: "easeOut" }
      );
    } else {
      maskImage.set(
        `linear-gradient(to bottom, ${transparent} ${top}, ${opaque} ${topInset}, ${opaque} ${bottomInset}, ${transparent} ${bottom})`
      );
    }
  });

  return maskImage;
}

const StyleSheet = () => (
  <style>{`
    .scrollbar-hide::-webkit-scrollbar { display: none; }
    .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
  `}</style>
);

interface LayoutWrapperProps {
  children: ReactNode;
}

const generateGradientFromColor = (
  color: string,
  startOpacity: number,
  endOpacity: number
) => {
  const hexToRgb = (hex: string) => {
    if (!hex || hex.length < 4) return "255, 255, 255";
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r}, ${g}, ${b}`;
  };
  const rgb = hexToRgb(color);
  return `linear-gradient(to top right, rgba(${rgb}, ${startOpacity}) 0%, rgba(${rgb}, ${endOpacity}) 100%)`;
};

const LayoutWrapper: FC<LayoutWrapperProps> = ({ children }) => {
  const { currentTheme } = useTheme();
  const ref = useRef<HTMLUListElement>(null);
  const { scrollYProgress } = useScroll({ container: ref });
  const maskImage = useScrollOverflowMask(scrollYProgress);

  useEffect(() => {
    document.body.style.backgroundImage = "none";
    document.body.style.backgroundColor = "transparent";
  }, []);

  const orbGradient1 = useMemo(
    () => generateGradientFromColor(currentTheme.accent, 0.4, 0.2),
    [currentTheme.accent]
  );
  const orbGradient2 = useMemo(
    () => generateGradientFromColor(currentTheme.accent, 0.35, 0.25),
    [currentTheme.accent]
  );
  const orbGradient3 = useMemo(
    () => generateGradientFromColor(currentTheme.accent, 0.3, 0.15),
    [currentTheme.accent]
  );
  const orbGradient4 = useMemo(
    () => generateGradientFromColor(currentTheme.accent, 0.3, 0.2),
    [currentTheme.accent]
  );
  const orbGradient5 = useMemo(
    () => generateGradientFromColor(currentTheme.accent, 0.25, 0.15),
    [currentTheme.accent]
  );

  return (
    <div className="relative w-full overflow-hidden flex items-center justify-center mt-10">
      {/* Full-screen gradient background */}
      <div
        className="absolute inset-0"
        style={{ background: currentTheme.gradient }}
      />

      <PatternBackground />

      {/* ---------- FLOATING ORBS (responsive) ---------- */}
      <div
        className="absolute hidden sm:block top-[10%] left-[15%] w-24 h-24 rounded-[50%_0_50%_0] rotate-45 blur-sm animate-khmer-float-1"
        style={{ background: orbGradient1 }}
      />
      <div
        className="absolute top-[8%] left-[10%] sm:top-[10%] sm:left-[15%] w-16 h-16 sm:w-24 sm:h-24 rounded-[50%_0_50%_0] rotate-45 blur-sm animate-khmer-float-1"
        style={{ background: orbGradient1 }}
      />

      <div
        className="absolute hidden sm:block top-[30%] right-[10%] w-20 h-20 rounded-full blur-xs animate-khmer-float-2"
        style={{ background: orbGradient2 }}
      />
      <div
        className="absolute top-[25%] right-[8%] sm:top-[30%] sm:right-[10%] w-14 h-14 sm:w-20 sm:h-20 rounded-full blur-xs animate-khmer-float-2"
        style={{ background: orbGradient2 }}
      />

      <div
        className="absolute hidden sm:block bottom-[20%] left-[25%] w-28 h-28 rounded-[0_50%_0_50%] -rotate-30 blur-sm animate-khmer-float-3"
        style={{ background: orbGradient3 }}
      />
      <div
        className="absolute bottom-[15%] left-[15%] sm:bottom-[20%] sm:left-[25%] w-20 h-20 sm:w-28 sm:h-28 rounded-[0_50%_0_50%] -rotate-30 blur-sm animate-khmer-float-3"
        style={{ background: orbGradient3 }}
      />

      <div
        className="absolute hidden sm:block top-[55%] left-[8%] w-16 h-16 rounded-full blur-xs animate-khmer-float-1"
        style={{ background: orbGradient4 }}
      />
      <div
        className="absolute top-[50%] left-[5%] sm:top-[55%] sm:left-[8%] w-12 h-12 sm:w-16 sm:h-16 rounded-full blur-xs animate-khmer-float-1"
        style={{ background: orbGradient4 }}
      />

      <div
        className="absolute hidden sm:block bottom-[10%] right-[18%] w-20 h-32 rounded-[50%_50%_50%_50%/60%_60%_40%_40%] -rotate-90 blur-sm animate-khmer-float-2"
        style={{ background: orbGradient5 }}
      />
      <div
        className="absolute bottom-[8%] right-[12%] sm:bottom-[10%] sm:right-[18%] w-16 h-24 sm:w-20 sm:h-32 rounded-[50%_50%_50%_50%/60%_60%_40%_40%] -rotate-90 blur-sm animate-khmer-float-2"
        style={{ background: orbGradient5 }}
      />

      {/* ---------- CENTRAL CARD ---------- */}
      <div
        className="
          relative z-20 flex flex-col items-center justify-center
          w-full max-w-full sm:max-w-3xl
          mx-4 sm:mx-0
          px-4 py-6 sm:px-6 sm:py-8
          backdrop-blur-xs rounded-2xl shadow-2xl border
        "
        style={{ borderColor: `${currentTheme.accent}40` }}
      >
        {/* Vertical accent lines – dynamic height */}
        <span
          className="absolute left-3 sm:left-5 w-px"
          style={{
            top: "6rem",
            bottom: "6rem",
            background: `linear-gradient(to bottom, transparent, ${currentTheme.accent}, transparent)`,
          }}
        />
        <span
          className="absolute right-3 sm:right-5 w-px"
          style={{
            top: "6rem",
            bottom: "6rem",
            background: `linear-gradient(to bottom, transparent, ${currentTheme.accent}, transparent)`,
          }}
        />

        {/* Kbach corners – smaller on mobile */}
        <div className="absolute top-0 left-0 w-12 h-12 sm:w-16 sm:h-16">
          <TopLeft color={currentTheme.accent} />
        </div>
        <div className="absolute top-0 right-0 w-12 h-12 sm:w-16 sm:h-16">
          <TopRight color={currentTheme.accent} />
        </div>
        <div className="absolute bottom-0 left-0 w-12 h-12 sm:w-16 sm:h-16">
          <BottomLeft color={currentTheme.accent} />
        </div>
        <div className="absolute bottom-0 right-0 w-12 h-12 sm:w-16 sm:h-16">
          <BottomRight color={currentTheme.accent} />
        </div>

        {/* Scrollable content area */}
        <div className="relative w-full h-[calc(100svh-8rem)] sm:h-svh mt-auto">
          <motion.ul
            ref={ref}
            className="h-full list-none overflow-y-scroll scrollbar-hide px-2 sm:px-0"
            style={{
              maskImage,
              WebkitMaskImage: maskImage,
            }}
          >
            {children}
          </motion.ul>
          <StyleSheet />
        </div>
      </div>
    </div>
  );
};

export default LayoutWrapper;
