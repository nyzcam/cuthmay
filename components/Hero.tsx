"use client";

import { motion, Variants } from "framer-motion";
import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { guestList, getGuestDisplayName, findGuestBySlug } from "../data/guestList";
import ShortName from "./kbach/ShortName";
import GuestFrame from "./kbach/GuestFrame";
import { useTheme } from "../lib/ThemeContext";

const Hero: React.FC = () => {
  const { currentTheme } = useTheme();
  const params = useParams();
  
  const guestSlug = params?.guestSlug as string | null;
  const [dynamicGuestName, setDynamicGuestName] = useState("លោក សែត កុម្ភម្នី");
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (guestSlug) {
      const guest = findGuestBySlug(guestSlug);
      if (guest) {
        setDynamicGuestName(getGuestDisplayName(guest));
      } else {
        // For unknown guests, create a polite generic name
        const decodedName = decodeURIComponent(guestSlug).replace(/-/g, " ");
        setDynamicGuestName(decodedName);
      }
    }
  }, [guestSlug]);

  // Rest of your component remains the same...
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
        duration: 2.5,
        ease: [0.3, 0.1, 0.3, 1],
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

  const shimmerStyle: React.CSSProperties = useMemo(
    () => ({
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

  const shadowStyle: React.CSSProperties = useMemo(
    () => ({
      textShadow: "0 2px 4px rgba(0,0,0,0.25)",
      WebkitTextStroke: "0.25px rgba(0,0,0,0.25)",
    }),
    []
  );

  const ShimmerMotion = ({
    children,
    delay = 0,
    className = "",
    style = {},
  }: {
    children: React.ReactNode;
    delay?: number;
    className?: string;
    style?: React.CSSProperties;
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
      }}
    >
      {children}
    </motion.span>
  );

  return (
    <>
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
                <ShimmerMotion
                  className="absolute"
                  style={{
                    top: "2.5rem",
                    left: "3rem",
                    fontSize: "3rem",
                    lineHeight: 1,
                    transformOrigin: "center",
                  }}
                  delay={0}
                >
                  ក
                </ShimmerMotion>

                <ShimmerMotion
                  className="absolute"
                  style={{
                    bottom: "3rem",
                    right: "3rem",
                    fontSize: "3rem",
                    lineHeight: 1,
                  }}
                  delay={0.5}
                >
                  វ
                </ShimmerMotion>

                <ShimmerMotion
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                  style={{
                    paddingTop: "0.3em",
                    paddingBottom: "0.3em",
                    fontSize: "1rem",
                  }}
                  delay={1}
                >
                  និង
                </ShimmerMotion>
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
          >
            <ShimmerMotion delay={1}>សិរីសួស្ដីអាពាហ៍ពិពាហ៍</ShimmerMotion>
          </motion.h1>

          <motion.h3
            className="text-xl sm:text-2xl md:text-3xl mb-3 sm:mb-4 text-gold"
            variants={fadeUp}
            custom={2}
          >
            សូមគោរមអញ្ជើញ
          </motion.h3>

          <motion.h4
            className="text-base sm:text-lg md:text-xl lg:text-2xl mb-3 sm:mb-4 text-gold px-4"
            variants={fadeUp}
            custom={3}
          >
            ឯកឧត្តម លោកជំទាវ លោក លោកស្រី អ្នកនាងកញ្ញា
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
          <div className="absolute inset-0 flex items-center justify-center">
            <ShimmerMotion
              className="text-base sm:text-lg md:text-xl lg:text-2xl text-center px-4 mt-10 md:mt-12"
              style={{
                paddingTop: "0.3em",
                paddingBottom: "0.3em",
              }}
              delay={0.3}
            >
              {dynamicGuestName}
            </ShimmerMotion>
          </div>
        </motion.div>

        <motion.div
          className="text-base md:text-lg space-y-3 sm:space-y-4 md:space-y-6 text-gold max-w-3xl px-4"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          custom={5}
        >
          <h6 className="leading-6">
            ថ្ងៃ អាទិត្យ ទី ១៧ ខែ មេសា ឆ្នាំ ២០២៦ វេលាម៉ោង៖ ៦ៈ០០ ល្ងាច
          </h6>
          <h6>នៅគេហដ្ឋានខាងស្រី</h6>
        </motion.div>
      </div>
    </>
  );
}

export default Hero;