"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import Lottie from "lottie-react";

interface SplashScreenProps {
  onComplete: () => void;
  minimumDisplayTime?: number;
}

const Preloader: React.FC<SplashScreenProps> = ({ 
  onComplete, 
  minimumDisplayTime = 2000 
}) => {
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsComplete(true);
      setTimeout(() => onComplete(), 300);
    }, minimumDisplayTime);

    return () => clearTimeout(timer);
  }, [onComplete, minimumDisplayTime]);

  return (
    <AnimatePresence>
      {!isComplete && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[radial-gradient(ellipse_at_center,#6f0000_0%,#200122_100%)]"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            transition: {
              duration: 0.8,
              ease: "easeInOut",
            },
          }}
          role="status"
          aria-label="Application splash screen"
        >
          <div className="relative w-[350px] h-auto flex items-center justify-center">
            <Lottie
              animationData={require("../public/romdoul.json")}
              loop={true}
              autoplay
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Preloader;
