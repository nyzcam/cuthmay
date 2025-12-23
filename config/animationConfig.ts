// Centralized animation configurations to avoid redefinition on every render
// This reduces memory allocations and improves performance

import { Variants } from "framer-motion";

export const animationConfigs = {
  fadeUp: {
    hidden: { opacity: 0, y: 40 },
    visible: (i: number = 0) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.25,
        duration: 2,
        ease: [0.25, 0.1, 0.25, 1],
      },
    }),
  } as Variants,

  floatVariants: {
    float: {
      y: [0, -10, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  } as Variants,

  fadeInScale: {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  } as Variants,

  slideIn: {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
  } as Variants,
};

// Common CSS properties to avoid recreation
export const commonStyles = {
  shimmerStyle: {
    backgroundImage: `linear-gradient(
      90deg,
      var(--gold-dark),
      var(--gold-light),
      var(--gold-lightest),
      var(--gold-medium),
      var(--gold-dark)
    )`,
    backgroundSize: "200% auto",
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    WebkitTextFillColor: "transparent",
    color: "transparent",
  } as React.CSSProperties,

  shadowStyle: {
    textShadow: "0 2px 4px rgba(0,0,0,0.25)",
    WebkitTextStroke: "0.25px rgba(0,0,0,0.25)",
  } as React.CSSProperties,

  smoothing: {
    WebkitFontSmoothing: "antialiased",
    MozOsxFontSmoothing: "grayscale",
  } as React.CSSProperties,
};
