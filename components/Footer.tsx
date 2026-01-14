"use client";

import { motion, Variants } from "framer-motion";
import { Heart, ExternalLink, Sparkles } from "lucide-react";
import { useTheme } from "../providers/ThemeContext";
import { defaultFooterData, type FooterData } from "../data/footerData";

interface FooterProps {
  footerData?: FooterData;
}

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1,
    },
  },
};

const floatingAnimation: Variants = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

const sparkleAnimation: Variants = {
  animate: {
    scale: [1, 1.2, 1],
    opacity: [0.5, 1, 0.5],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

const dotPulseAnimation: Variants = {
  animate: {
    scale: [0, 1, 0],
    opacity: [0, 1, 0],
  },
};

export default function Footer({ footerData = defaultFooterData }: FooterProps) {
  const { currentTheme } = useTheme();

  const { primary, dark, light, lightest, medium } =
    currentTheme.cssVars;

  return (
    <motion.footer
      className="w-full py-12 relative overflow-hidden font-khmer"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={staggerContainer}
      role="contentinfo"
      aria-label="Site Footer"
    >
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div
          className="absolute top-0 left-1/4 w-32 h-32 rounded-full blur-3xl"
          style={{ backgroundColor: `${primary}05` }}
        />
        <div
          className="absolute bottom-0 right-1/4 w-40 h-40 rounded-full blur-3xl"
          style={{ backgroundColor: `${light}05` }}
        />

        {[
          { top: "top-8", left: "left-1/3", delay: 0 },
          { top: "bottom-12", left: "right-1/3", delay: 1 },
          { top: "top-16", left: "right-1/5", delay: 0.5 },
        ].map((sparkle, index) => (
          <motion.div
            key={index}
            className={`absolute ${sparkle.top} ${sparkle.left} w-1 h-1 rounded-full`}
            style={{ backgroundColor: `${primary}30` }}
            variants={sparkleAnimation}
            animate="animate"
            transition={{ delay: sparkle.delay }}
          />
        ))}
      </div>

      <div className="max-w-6xl mx-auto px-4 relative">
        <motion.div
          className="flex justify-center items-center mb-8"
          variants={fadeInUp}
        >
          <div className="flex items-center space-x-4">
            <motion.div
              className="w-24 h-px"
              style={{
                background: `linear-gradient(to right, transparent, ${primary}60, transparent)`,
              }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
            />

            <motion.div
              className="relative"
              variants={floatingAnimation}
              animate="animate"
            >
              <Heart
                className="w-6 h-6"
                style={{
                  color: primary,
                  fill: `${primary}20`,
                }}
                strokeWidth={1.5}
                aria-hidden="true"
              />
              <div
                className="absolute -inset-2 rounded-full blur-sm"
                style={{ backgroundColor: `${primary}10` }}
              />
            </motion.div>

            <motion.div
              className="w-24 h-px"
              style={{
                background: `linear-gradient(to left, transparent, ${primary}60, transparent)`,
              }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
            />
          </div>
        </motion.div>

        <div className="flex flex-col items-center justify-center text-center space-y-6">
          <motion.div className="space-y-3" variants={fadeInUp}>
            <p className="text-lg text-gold md:text-xl tracking-wide leading-relaxed">
              {footerData.thankYouMessage}
            </p>
            <motion.p
              className="text-sm text-gold md:text-base max-w-md mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.8 }}
            >
              {footerData.thankYouSubtext}
            </motion.p>
          </motion.div>

          <motion.div
            className="flex items-center space-x-2"
            variants={fadeInUp}
            aria-hidden="true"
          >
            {[0.4, 0.6, 0.4].map((opacity, index) => (
              <motion.div
                key={index}
                className={`${
                  index === 1 ? "w-2 h-2" : "w-1.5 h-1.5"
                } rounded-full`}
                style={{
                  backgroundColor: primary,
                  opacity,
                }}
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: index * 0.2,
                }}
              />
            ))}
          </motion.div>

          <motion.div className="space-y-3" variants={fadeInUp}>
            <motion.p
              className="text-sm text-gold md:text-base flex items-center justify-center gap-2"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <Sparkles
                className="w-4 h-4"
                style={{ color: `${primary}60` }}
                strokeWidth={1.5}
              />
              {footerData.creditText}
              <Sparkles
                className="w-4 h-4"
                style={{ color: `${primary}60` }}
                strokeWidth={1.5}
              />
            </motion.p>

            <motion.a
              href={footerData.creditorUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center space-x-2 transition-all duration-300"
              aria-label={`Visit ${footerData.creditorName} website (opens in new tab)`}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <span
                className="relative font-medium text-lg"
                style={{ color: primary }}
              >
                {footerData.creditorName}
                <motion.div
                  className="absolute -bottom-1 left-0 h-px"
                  style={{
                    background: `linear-gradient(to right, ${primary}, ${light})`,
                  }}
                  initial={{ width: 0 }}
                  whileHover={{ width: "100%" }}
                  transition={{ duration: 0.3 }}
                />
              </span>

              <ExternalLink
                className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300"
                style={{ color: primary }}
                strokeWidth={2}
                aria-hidden="true"
              />
            </motion.a>
          </motion.div>

          <motion.div
            className="pt-4 flex justify-center space-x-1"
            variants={fadeInUp}
            aria-hidden="true"
          >
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="w-1 h-1 rounded-full"
                style={{ backgroundColor: `${primary}30` }}
                variants={dotPulseAnimation}
                animate="animate"
                transition={{
                  duration: 1.5,
                  delay: i * 0.1 + 2,
                  repeat: Infinity,
                  repeatDelay: 3,
                }}
              />
            ))}
          </motion.div>
        </div>
      </div>
    </motion.footer>
  );
}
