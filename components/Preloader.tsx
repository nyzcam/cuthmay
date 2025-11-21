"use client";

import React, { useEffect, useState } from "react";
import { AppPhase } from "@/types/types";
import Lottie from "lottie-react";
import { motion, AnimatePresence } from "framer-motion";

interface PreloaderProps {
  phase: AppPhase;
  visible: boolean;
}

export default function Preloader({ phase, visible }: PreloaderProps) {
  const [animationData, setAnimationData] = useState<any>(null);

  useEffect(() => {
    fetch("/romdoul.json")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load Lottie JSON");
        return res.json();
      })
      .then(setAnimationData)
      .catch((err) =>
        console.error("Failed to load romdoul.json animation:", err)
      );
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="preloader"
          initial={{ opacity: 1 }}
          animate={{ opacity: phase === AppPhase.COMPLETE ? 0 : 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: "easeInOut" }}
          className="
            fixed inset-0 z-50 
            flex items-center justify-center
            overflow-hidden
          "
        >
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-[128px] animate-pulse-slow" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-fuchsia-500/20 rounded-full blur-[128px] animate-pulse-slow delay-75" />

          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative w-72 h-72 flex items-center justify-center"
          >
            <div className="absolute inset-0 bg-white/5 blur-3xl rounded-full animate-pulse"></div>

            {animationData && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="relative z-10 w-full h-full drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]"
              >
                <Lottie animationData={animationData} loop className="w-full h-full" />
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
