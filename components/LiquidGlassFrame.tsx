"use client";

import { ElementType, ReactNode } from "react";
import { useGlassHighlight } from "../hooks/useGlassHighlight";
import TopLeft from "./kbach/TopLeft";
import TopRight from "./kbach/TopRight";
import BottomLeft from "./kbach/BottomLeft";
import BottomRight from "./kbach/BottomRight";

type PolymorphicProps<E extends ElementType> = {
  as?: E;
  asChild?: boolean;
  accent: string;
  children: ReactNode;
} & Omit<React.ComponentPropsWithoutRef<E>, "as" | "children">;

const DEFAULT_ELEMENT = "div";

const LiquidGlassFrame = <E extends ElementType = typeof DEFAULT_ELEMENT>({
  as,
  asChild = false,
  accent,
  children,
  ...props
}: PolymorphicProps<E>) => {
  const highlight = useGlassHighlight(accent);

  const Component = (asChild ? as : as ?? DEFAULT_ELEMENT) as ElementType;

  return (
    <Component
      {...props}
      className={[
        "relative z-20 flex flex-col items-center justify-center w-full max-w-3xl px-2 py-8",
        "backdrop-blur-sm border border-white/50 rounded-3xl",
        "shadow-[inset_0_1px_0px_rgba(255,255,255,0.75),0_0_9px_rgba(0,0,0,0.2),0_3px_8px_rgba(0,0,0,0.15)]",
        "before:absolute before:inset-0 before:rounded-3xl",
        "before:bg-gradient-to-br before:from-white/20 before:via-transparent before:to-transparent",
        "before:pointer-events-none",
        "after:absolute after:inset-0 after:rounded-3xl after:pointer-events-none after:opacity-40",
        "motion-safe:glass-noise",
        "motion-safe:glass-chromatic",
        highlight && "motion-safe:animate-glass-shimmer",
        props.className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        ...(props.style || {}),
        borderColor: `${accent}40`,
      }}
    >
      <span
        className="absolute top-[150px] bottom-[150px] left-4 w-px"
        style={{
          background: `linear-gradient(to bottom, transparent, ${accent}, transparent)`,
        }}
      />
      <span
        className="absolute top-[150px] bottom-[150px] right-4 w-px"
        style={{
          background: `linear-gradient(to bottom, transparent, ${accent}, transparent)`,
        }}
      />

      <TopLeft color={accent} />
      <TopRight color={accent} />

      {children}

      <BottomLeft color={accent} />
      <BottomRight color={accent} />
    </Component>
  );
};

export default LiquidGlassFrame;
