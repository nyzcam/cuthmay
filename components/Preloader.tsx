import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "motion/react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

interface PreloaderProps {
  onLoadingComplete: () => void;
}

const Preloader: React.FC<PreloaderProps> = ({ onLoadingComplete }) => {
  const [progress, setProgress] = useState(0);
  const [hasError, setHasError] = useState(false);

  const assetConfig = useMemo(
    () => ({
      fonts: [
        { name: "Tacteng", url: "/fonts/tacteng.ttf" },
        { name: "Khmer Boran", url: "/fonts/Khmer_Boran.ttf" },
      ],
      images: ["/preview_image.webp"],
      vectors: ["/pkarchan-pattern.svg", "/pkarchan.svg"],
      // media: ["/nokor-reach.mp3"],
    }),
    []
  );

  const updateProgress = useCallback((value: number) => {
    setProgress(value);
  }, []);

  const loadFonts = useCallback(async () => {
    await Promise.all(
      assetConfig.fonts.map(async (font) => {
        try {
          const fontFace = new FontFace(font.name, `url(${font.url})`);
          const loadedFont = await fontFace.load();
          document.fonts.add(loadedFont);
        } catch (e) {
          console.warn(`Font failed: ${font.name}`, e);
        }
      })
    );
  }, [assetConfig.fonts]);

  const loadImages = useCallback(async () => {
    await Promise.all(
      assetConfig.images.map(
        (src) =>
          new Promise<void>((resolve) => {
            const img = new Image();
            img.src = src;
            img.onload = () => resolve();
            img.onerror = () => {
              console.warn(`Failed image: ${src}`);
              resolve();
            };
          })
      )
    );
  }, [assetConfig.images]);

  const loadVectors = useCallback(async () => {
    await Promise.all(
      assetConfig.vectors.map(
        (src) =>
          new Promise<void>((resolve) => {
            const img = new Image();
            img.src = src;
            img.onload = () => resolve();
            img.onerror = () => {
              console.warn(`Vector failed: ${src}`);
              resolve();
            };
          })
      )
    );
  }, [assetConfig.vectors]);

  // const loadMedia = useCallback(async () => {
  //   await Promise.all(
  //     assetConfig.media.map(
  //       (src) =>
  //         new Promise<void>((resolve) => {
  //           const el = document.createElement(
  //             src.endsWith(".mp3") || src.endsWith(".wav") ? "audio" : "video"
  //           );
  //           el.src = src;
  //           el.onloadeddata = () => resolve();
  //           el.onerror = () => {
  //             console.warn(`Failed media: ${src}`);
  //             resolve();
  //           };
  //         })
  //     )
  //   );
  // }, [assetConfig.media]);

  const loadAllAssets = useCallback(async () => {
    try {
      updateProgress(10);
      await loadFonts();

      updateProgress(40);
      await loadImages();

      updateProgress(70);
      await loadVectors();

      // updateProgress(90);
      // await loadMedia();

      updateProgress(100);

      await new Promise((resolve) => setTimeout(resolve, 800));

      onLoadingComplete();
    } catch (err) {
      console.error("Loading error:", err);
      setHasError(true);
      setProgress(100);
      setTimeout(() => onLoadingComplete(), 1000);
    }
  }, [
    loadFonts,
    loadImages,
    loadVectors,
    // loadMedia,
    updateProgress,
    onLoadingComplete,
  ]);

  useEffect(() => {
    loadAllAssets();
  }, [loadAllAssets]);

  return (
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
      aria-label="Loading application"
    >
      <div className="relative w-[350px] h-auto flex items-center justify-center">
        <DotLottieReact
          src="https://lottie.host/ae36f22a-8cd2-48cd-8ded-ca8276c76143/D0MXqhz2jd.lottie"
          loop
          autoplay
        />
      </div>
    </motion.div>
  );
};

export default Preloader;
