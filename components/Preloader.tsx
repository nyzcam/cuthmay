"use client";

import React, { useEffect, useState } from "react";
import { AppPhase } from "@/types/types";
import { Theme } from "@/config/themeConfig";
import Lottie from "lottie-react";
import { motion, AnimatePresence } from "framer-motion";

interface PreloaderProps {
  phase: AppPhase;
  visible: boolean;
  theme?: Theme;
}

interface AnimationData {
  v: string;
  fr: number;
  ip: number;
  op: number;
  w: number;
  h: number;
  [key: string]: unknown;
}

export default function Preloader({ phase, visible, theme }: PreloaderProps) {
  const [animationData, setAnimationData] = useState<AnimationData | null>(null);

  const backgroundGradient = theme?.gradient || 
    "radial-gradient(ellipse_at_center,#6f0000_0%,#200122_100%)";
  
  const accentColor = theme?.accent || "#efbf04";
  const isDark = theme?.isDark ?? true;

  useEffect(() => {
    const assets: string[] = [
      "/romdoul.json",
      "/aba-qr.png",
      "/hol-khmer.svg",
      "/pkarchan-pattern.svg",
      "/preview_image.webp",
      "/nokor-reach.mp3",
    ];

    let mounted = true;

    const loadImage = (src: string) =>
      new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => resolve();
        img.src = src;
      });

    const loadAudio = (src: string) =>
      new Promise<void>((resolve) => {
        try {
          const a = new Audio();
          a.preload = "auto";
          a.oncanplaythrough = () => resolve();
          a.onerror = () => resolve();
          a.src = src;
        } catch (e) {
          resolve();
        }
      });

    const loadFetch = (src: string) => fetch(src).then(() => {}).catch(() => {});
    
    const handleAsset = async (asset: string): Promise<void> => {
      try {
        if (asset.endsWith(".json")) {
            const resp = await fetch(asset);
            if (resp.ok && mounted) {
                const json = await resp.json();
                if (asset === "/romdoul.json") setAnimationData(json);
            }
        } else if (asset.match(/\.(png|jpg|jpeg|webp|svg)$/)) {
            await loadImage(asset);
        } else if (asset.match(/\.(mp3|wav|ogg)$/)) {
            await loadAudio(asset);
        } else {
            await loadFetch(asset);
        }
      } catch (e) {
        console.warn(`Failed to preload ${asset}`, e);
      }
    };

    (async () => {
      await Promise.allSettled(assets.map((asset) => handleAsset(asset)));
    })();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="preloader"
          initial={{ opacity: 1 }}
          animate={{ opacity: phase === AppPhase.COMPLETE ? 0 : 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          style={{
            backgroundImage: backgroundGradient,
            backgroundAttachment: "fixed",
          }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center"
        >
          <div 
            style={{
              backgroundColor: `${accentColor}20`,
            }}
            className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-[128px] animate-pulse-slow pointer-events-none" 
          />
          <div 
            style={{
              backgroundColor: `${accentColor}15`,
            }}
            className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-[128px] animate-pulse-slow delay-75 pointer-events-none" 
          />

          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative w-72 h-72 flex items-center justify-center"
          >
            <div className="absolute inset-0 bg-white/5 blur-3xl rounded-full animate-pulse" />

            {animationData && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="relative z-10 w-full h-full drop-shadow-[0_0_30px_rgba(239,191,4,0.4)]"
              >
                <Lottie 
                    animationData={animationData} 
                    loop={true} 
                    className="w-full h-full" 
                />
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}