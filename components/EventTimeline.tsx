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
      staggerChildren: 0.14,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.55,
      ease: [0.22, 1, 0.36, 1],
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
          initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-10 text-center"
        >
          <h2 className="text-af text-2xl md:text-3xl">{title}</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-af opacity-80 md:text-base">
            {subtitle}
          </p>
          <div
            className="mx-auto mt-4 h-px w-28"
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
              transition={{ duration: 1.2, ease: "easeInOut" }}
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
                    <div
                      className="relative flex h-11 w-11 items-center justify-center rounded-full border border-white/30 backdrop-blur-md"
                      style={{
                        background: `linear-gradient(135deg, ${currentTheme.cssVars.dark}55, ${currentTheme.cssVars.light}22)`,
                        color: currentTheme.accent,
                      }}
                    >
                      {icon}
                      <span
                        className="absolute inset-0 rounded-full"
                        style={{
                          boxShadow: `0 0 0 1px ${currentTheme.accent}50, 0 0 30px 0 ${currentTheme.accent}30`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="ml-14 w-full md:ml-0 md:w-[46%]">
                    <div
                      className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-4 transition-all duration-300 hover:-translate-y-1 hover:bg-white/15 hover:border-white/30 md:p-5"
                      style={{
                        boxShadow: `0 8px 24px -18px ${currentTheme.accent}55`,
                      }}
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs text-af"
                          style={{
                            borderColor: `${currentTheme.accent}50`,
                            backgroundColor: `${currentTheme.accent}18`,
                          }}
                        >
                          <Clock3 className="h-3.5 w-3.5" />
                          {event.time}
                        </span>
                      </div>

                      <h3 className="mt-3 text-af text-lg md:text-xl">{event.title}</h3>
                      <p className="mt-1 text-sm leading-6 text-af opacity-85 md:text-base">
                        {event.description}
                      </p>
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
