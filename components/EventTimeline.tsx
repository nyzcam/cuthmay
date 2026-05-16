"use client";

import React, { useMemo } from "react";
import { motion, type Variants, useReducedMotion } from "framer-motion";
import {
  Camera,
  Clock3,
  Heart,
  Moon,
  Music2,
  Sparkles,
  Sun,
  Utensils,
  Users,
  Scissors,
} from "lucide-react";
import { useTheme } from "@/providers/ThemeContext";
import { defaultTimelineEvents } from "@/data/timelineData";
import type { TimelineEvent } from "@/types/types";

interface EventTimelineProps {
  title?: string;
  subtitle?: string;
  events?: TimelineEvent[];
}

type IconName = TimelineEvent["icon"];

const iconMap: Record<IconName, React.ReactNode> = {
  ring: <Sparkles className="h-5 w-5" />,
  users: <Users className="h-5 w-5" />,
  scissors: <Scissors className="h-5 w-5" />,
  music: <Music2 className="h-5 w-5" />,
  camera: <Camera className="h-5 w-5" />,
  utensils: <Utensils className="h-5 w-5" />,
  heart: <Heart className="h-5 w-5" />,
  moon: <Moon className="h-5 w-5" />,
  sun: <Sun className="h-5 w-5" />,
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.28,
      delayChildren: 0.25,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 48, scale: 0.92 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 1.5,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

const cardInViewVariants: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 1.15,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

const detailLikeContentVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.08 + i * 0.14,
      duration: 1.25,
      ease: [0.3, 0.1, 0.3, 1],
    },
  }),
};

const iconPulseVariants: Variants = {
  rest: { scale: 1 },
  pulse: {
    scale: [1, 1.14, 1],
    transition: {
      duration: 3.2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

const iconGlowVariants: Variants = {
  rest: { opacity: 0.4 },
  pulse: {
    opacity: [0.4, 0.85, 0.4],
    transition: {
      duration: 3.2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

export default function EventTimeline({
  title = "កម្មវិធីពិធី",
  subtitle = "លំដាប់ពេលវេលានៃពិធីសំខាន់ៗ",
  events = defaultTimelineEvents,
}: EventTimelineProps) {
  const { currentTheme } = useTheme();
  const shouldReduceMotion = useReducedMotion();

  const orderedEvents = useMemo(() => {
    return [...events];
  }, [events]);

  return (
    <section className="relative w-full px-4 py-14 sm:px-6 md:py-16 font-khmer">
      <div className="mx-auto w-full max-w-5xl">
        <motion.div
                className="text-center mb-12"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              >
                <div className="flex items-center justify-center">
                  <h4 className="font-khmer text-af text-xl md:text-2xl">
                    {title}
                  </h4>
                </div>
                <div
                  className="w-40 h-px mx-auto"
                  style={{
                    background: `linear-gradient(to right, transparent, ${currentTheme.accent}, transparent)`,
                  }}
                />
              </motion.div>

        <motion.div
          className="relative"
          variants={shouldReduceMotion ? undefined : containerVariants}
          initial={shouldReduceMotion ? undefined : "hidden"}
          whileInView={shouldReduceMotion ? undefined : "visible"}
          viewport={{ once: true, margin: "-8%" }}
        >
          <div className="absolute left-6 top-2 bottom-2 w-px md:left-1/2 md:-translate-x-1/2">
            <div className="h-full w-full bg-white/20" />
            <motion.div
              className="absolute inset-x-0 top-0 origin-top"
              style={{
                background: `linear-gradient(to bottom, ${currentTheme.accent}, transparent)`,
              }}
              initial={shouldReduceMotion ? false : { scaleY: 0 }}
              whileInView={shouldReduceMotion ? {} : { scaleY: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 2.8, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>

          <div className="space-y-7 md:space-y-9">
            {orderedEvents.map((event, index) => {
              const rightAligned = index % 2 !== 0;
              const icon = iconMap[event.icon] ?? <Clock3 className="h-5 w-5" />;

              return (
                <motion.article
                  key={event.id}
                  variants={shouldReduceMotion ? undefined : itemVariants}
                  className={`relative flex w-full md:min-h-[140px] ${
                    rightAligned ? "md:justify-end" : "md:justify-start"
                  }`}
                >
                  <div className="absolute left-6 top-6 z-10 -translate-x-1/2 md:left-1/2">
                    <motion.div
                      variants={shouldReduceMotion ? undefined : iconPulseVariants}
                      initial="rest"
                      animate="pulse"
                      className="relative flex h-11 w-11 items-center justify-center rounded-full border border-white/30 backdrop-blur-md"
                      style={{
                        background: `linear-gradient(135deg, ${currentTheme.cssVars.dark}55, ${currentTheme.cssVars.light}22)`,
                        color: currentTheme.accent,
                      }}
                    >
                      {icon}
                      <motion.span
                        variants={shouldReduceMotion ? undefined : iconGlowVariants}
                        initial="rest"
                        animate="pulse"
                        className="absolute inset-0 rounded-full"
                        style={{
                          boxShadow: `0 0 0 1px ${currentTheme.accent}50, 0 0 36px 4px ${currentTheme.accent}45`,
                        }}
                      />
                    </motion.div>
                  </div>

                  <div className="ml-14 w-full md:ml-0 md:w-[46%]">
                    <div className="relative group/card">
                      <motion.div
                        variants={shouldReduceMotion ? undefined : cardInViewVariants}
                        initial={shouldReduceMotion ? undefined : "hidden"}
                        whileInView={shouldReduceMotion ? undefined : "visible"}
                        viewport={{ once: true, amount: 0.35 }}
                        className="relative rounded-2xl border p-3 backdrop-blur-sm md:p-4"
                        style={{
                          borderColor: `${currentTheme.accent}55`,
                          boxShadow: `0 8px 32px -18px ${currentTheme.accent}55`,
                          transition: "box-shadow 0.8s ease, border-color 0.8s ease",
                        }}
                        whileHover={shouldReduceMotion ? {} : {
                          scale: 1.015,
                          boxShadow: `0 16px 48px -12px ${currentTheme.accent}70`,
                          borderColor: `${currentTheme.accent}88`,
                          transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
                        }}
                      >
                        <div className="absolute inset-0 rounded-2xl bg-white/3 pointer-events-none" />
                        <motion.div
                          className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none"
                          initial={false}
                        >
                          <motion.div
                            className="absolute inset-y-0 w-1/3 skew-x-[-20deg]"
                            style={{
                              background: `linear-gradient(90deg, transparent, ${currentTheme.accent}18, transparent)`,
                            }}
                            initial={{ x: "-100%" }}
                            whileInView={{ x: "400%" }}
                            viewport={{ once: true }}
                            transition={{ duration: 2.2, ease: "easeInOut", delay: 0.6 + index * 0.18 }}
                          />
                        </motion.div>
                        {/* Top accent strip */}
                        <div
                          className="absolute top-0 left-5 right-5 h-px"
                          style={{
                            background: `linear-gradient(to right, transparent, ${currentTheme.accent}70, transparent)`,
                          }}
                        />

                        {/* Time + session row */}
                        <motion.div
                          className="flex items-center justify-center gap-2 flex-wrap"
                          variants={shouldReduceMotion ? undefined : detailLikeContentVariants}
                          custom={0}
                        >
                          <motion.span
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs"
                            style={{
                              background: `${currentTheme.accent}18`,
                              color: currentTheme.accent,
                              border: `1px solid ${currentTheme.accent}35`,
                            }}
                            variants={shouldReduceMotion ? undefined : detailLikeContentVariants}
                            custom={0.2}
                          >
                            <Clock3 className="h-3 w-3 shrink-0" />
                            {event.time}
                          </motion.span>
                        </motion.div>

                        {/* Decorative divider */}
                        <motion.div
                          className="mt-3.5 h-px w-16 mx-auto"
                          style={{
                            background: `linear-gradient(to right, ${currentTheme.accent}70, transparent)`,
                          }}
                          variants={shouldReduceMotion ? undefined : detailLikeContentVariants}
                          custom={1}
                        />

                        {/* Title */}
                        <motion.h3
                          className="mt-2.5 text-af text-lg md:text-xl leading-snug text-center"
                          variants={shouldReduceMotion ? undefined : detailLikeContentVariants}
                          custom={2}
                        >
                          {event.title}
                        </motion.h3>

                        {/* Description */}
                        <motion.p
                          className="mt-2 text-sm leading-7 text-af md:text-[0.925rem] text-center opacity-90"
                          variants={shouldReduceMotion ? undefined : detailLikeContentVariants}
                          custom={3}
                        >
                          {event.description}
                        </motion.p>
                      </motion.div>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
