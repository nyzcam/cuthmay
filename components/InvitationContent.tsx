"use client";
import React, { lazy, Suspense, useMemo, useEffect, useState } from "react";
import { motion, Variants } from "framer-motion";
import ShortName from "./kbach/ShortName";
import GuestFrame from "./kbach/GuestFrame";
import { useTheme } from "../lib/ThemeContext";

export default function InvitationContent() {
  const { currentTheme } = useTheme();
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) =>
      setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  const fadeUp: Variants = {
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
  };
  const floatVariants: Variants = {
    float: {
      y: [0, -10, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  const shimmerStyle = useMemo(
    (): React.CSSProperties => ({
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
    }),
    []
  );

  const shadowStyle = useMemo(
    (): React.CSSProperties => ({
      textShadow: "0 2px 4px rgba(0,0,0,0.25)",
      WebkitTextStroke: "0.25px rgba(0,0,0,0.25)",
    }),
    []
  );

  interface ShimmerTextProps {
    children: React.ReactNode;
    delay?: number;
    className?: string;
    style?: React.CSSProperties;
  }

  const ShimmerText: React.FC<ShimmerTextProps> = ({
    children,
    delay = 0,
    className = "",
    style = {},
  }) => (
    <motion.span
      className={className}
      style={{ ...shimmerStyle, ...shadowStyle, ...style }}
      animate={
        !prefersReducedMotion
          ? { backgroundPosition: ["200% center", "0% center"] }
          : { backgroundPosition: "0% center" }
      }
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: "linear",
        delay,
        ...(!prefersReducedMotion && { repeatDelay: 0 }),
      }}
    >
      {children}
    </motion.span>
  );

  return (
    <div className="flex flex-col items-center text-center px-4 sm:px-6 lg:px-8">
      <motion.div
        className="relative mt-6 sm:mt-8 md:mt-12 w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg flex justify-center"
        initial={{ opacity: 0, scale: 0.8, rotate: -15 }}
        whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ duration: 2.5, type: "spring" }}
        animate={!prefersReducedMotion ? "float" : ""}
        variants={floatVariants}
      >
        <div className="relative">
          <ShortName color={currentTheme.accent} />

          <div className="absolute inset-0 pointer-events-none font-khmer">
            <motion.div
              className="relative w-full h-full"
              initial="hidden"
              whileInView="visible"
              variants={fadeUp}
            >
              <ShimmerText
                style={{
                  position: "absolute",
                  top: "2.5rem",
                  left: "3rem",
                  fontSize: "3rem",
                  lineHeight: 1,
                  transformOrigin: "center",
                }}
              >
                ក
              </ShimmerText>

              <ShimmerText
                style={{
                  position: "absolute",
                  bottom: "3rem",
                  right: "3rem",
                  fontSize: "3rem",
                  lineHeight: 1,
                }}
                delay={0.5}
              >
                វ
              </ShimmerText>

              <ShimmerText
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                style={{
                  paddingTop: "0.3em",
                  paddingBottom: "0.3em",
                  fontSize: "1rem",
                }}
                delay={1}
              >
                និង
              </ShimmerText>
            </motion.div>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="mt-6 sm:mt-8 mb-4 w-full max-w-4xl"
        initial="hidden"
        whileInView="visible"
        variants={fadeUp}
      >
        <motion.h1
          className="text-2xl sm:text-3xl md:text-4xl mb-3 sm:mb-4 inline-block px-2"
          style={{
            paddingTop: "0.3em",
            paddingBottom: "0.3em",
          }}
          variants={fadeUp}
          custom={1}
          aria-label="Wedding Greeting"
          role="heading"
          aria-level={1}
        >
          <ShimmerText>សិរីសួស្ដីអាពាហ៍ពិពាហ៍</ShimmerText>
        </motion.h1>

        <motion.h3
          className="text-xl sm:text-2xl md:text-3xl mb-3 sm:mb-4 text-gold"
          variants={fadeUp}
          custom={2}
          aria-label="Respectfully Inviting"
          role="heading"
          aria-level={3}
        >
          សូមគោរមអញ្ជើញ
        </motion.h3>

        <motion.h4
          className="text-base sm:text-lg md:text-xl lg:text-2xl mb-3 sm:mb-4 text-gold px-4"
          variants={fadeUp}
          custom={3}
          aria-label="Honorable Guests"
          role="heading"
          aria-level={4}
        >
          ឯកឧត្តម លោកជំទាវ​​ លោក លោកស្រី អ្នកនាងកញ្ញា
        </motion.h4>
      </motion.div>

      <motion.div
        className="relative mb-4 sm:mb-6 w-full max-w-xs sm:max-w-sm md:max-w-md flex items-center justify-center"
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        custom={4}
      >
        <GuestFrame color={currentTheme.accent} />
        <div className="absolute inset-0 flex items-center justify-center px-4">
          <ShimmerText
            className="text-base sm:text-lg md:text-xl lg:text-2xl mt-10 md:mt-12"
            style={{
              paddingTop: "0.3em",
              paddingBottom: "0.3em",
            }}
            delay={0.3}
          >
            ភ្ញៀវកិត្តិយស
          </ShimmerText>
        </div>
      </motion.div>

      <motion.div
        className="text-base md:text-lg space-y-3 sm:space-y-4 md:space-y-6 text-gold max-w-3xl px-4"
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        custom={5}
      >
        <h6 className="leading-6" aria-label="Event Date and Time">
          ថ្ងៃ អាទិត្យ ទី ១៧ ខែ មេសា ឆ្នាំ ២០២៦​ វេលាម៉ោង៖ ៦ៈ០០ ល្ងាច
        </h6>
        <h6 aria-label="Event Location">នៅគេហដ្ឋានខាងស្រី</h6>
      </motion.div>
    </div>
  );
}
