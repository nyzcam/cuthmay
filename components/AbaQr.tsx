"use client";
import React, { useState, useEffect } from "react";
import { QrCode } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useTheme } from "../providers/ThemeContext";
import { defaultAbaQrData, getAbaPaymentLink, type AbaQrData } from "../data/abaQrData";
import Image from "next/image";

type AbaQrProps = {
  merchant?: string;
  size?: number;
  showAnimation?: boolean;
  cornerColor?: string;
  abaQrData?: AbaQrData;
};

export default function AbaQr({
  merchant = defaultAbaQrData.merchant,
  size = 200,
  showAnimation = true,
  cornerColor,
  abaQrData = defaultAbaQrData,
}: AbaQrProps) {
  const { currentTheme } = useTheme();
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuoteIndex((prev) => (prev + 1) % abaQrData.quotes.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [abaQrData.quotes.length]);

  // Use inline styles instead of dynamic Tailwind classes for borders
  const activeCornerColor = cornerColor || currentTheme.accent;
  
  // Create a style object for the corner borders
  const cornerBorderStyle = {
    borderColor: activeCornerColor,
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      >
        <div className="flex items-center justify-center">
          <h4 className="font-khmer text-gold text-xl md:text-2xl">
            {abaQrData.title}
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
        className="flex flex-col lg:flex-row items-center justify-between gap-12 p-8"
        initial={{ opacity: 0, y: 60, scale: 0.9 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      >
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="relative group">
            <a
              href={getAbaPaymentLink()}
              target="_blank"
              rel="noopener noreferrer"
            >
              <div
                className="relative p-4 rounded-2xl shadow-lg transition-all duration-300 group-hover:shadow-xl group-hover:scale-105"
                style={{
                  width: size + 32,
                  height: size + 32,
                }}
              >
                <Image 
                  src="/aba-qr.png"
                  alt="ABA QR Code"
                  width={size}
                  height={size}
                  className="rounded-lg transition-all duration-300"
                  loading="lazy"
                />

                <div className="absolute inset-0 rounded-2xl bg-white/3 pointer-events-none" />
              </div>
            </a>
            
            {/* Top-left corner */}
            <div
              className="absolute -top-4 -left-4 w-10 h-10 border-t-4 border-l-4 rounded-tl-3xl"
              style={cornerBorderStyle}
            />
            
            {/* Top-right corner */}
            <div
              className="absolute -top-4 -right-4 w-10 h-10 border-t-4 border-r-4 rounded-tr-3xl"
              style={cornerBorderStyle}
            />
            
            {/* Bottom-left corner */}
            <div
              className="absolute -bottom-4 -left-4 w-10 h-10 border-b-4 border-l-4 rounded-bl-3xl"
              style={cornerBorderStyle}
            />
            
            {/* Bottom-right corner */}
            <div
              className="absolute -bottom-4 -right-4 w-10 h-10 border-b-4 border-r-4 rounded-br-3xl"
              style={cornerBorderStyle}
            />

            {showAnimation && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-4 rounded-lg overflow-hidden">
                  <motion.div
                    className="absolute top-0 left-0 right-0 h-0.5"
                    style={{
                      background: `linear-gradient(to right, transparent, ${currentTheme.accent}, transparent)`,
                    }}
                    animate={{ y: [0, size, 0] }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col items-center gap-2 mt-6">
            <div className="flex items-center gap-2 text-sm font-medium">
              <QrCode
                className="w-4 h-4"
                style={{ color: currentTheme.accent }}
              />
              <span className="font-mono tracking-wide">{abaQrData.merchant}</span>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <motion.div
            className="max-w-md space-y-6"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, delay: 0.3, ease: "easeOut" }}
          >
            <div
              className="relative backdrop-blur-sm border rounded-2xl p-6 hover:bg-white/5 transition-all duration-500"
              style={{
                borderColor: `${currentTheme.accent}33`,
              }}
            >
              <div
                className="absolute -top-2 left-4 text-4xl font-serif"
                style={{ color: `${currentTheme.accent}99` }}
              >
                "
              </div>
              <div
                className="absolute -bottom-6 right-4 text-4xl font-serif"
                style={{ color: `${currentTheme.accent}99` }}
              >
                "
              </div>

              <AnimatePresence mode="wait">
                <motion.p
                  key={currentQuoteIndex}
                  className="font-khmer text-gold italic text-sm md:text-base leading-7 md:leading-8 relative z-10 pt-3 pb-3"
                  initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -20, filter: "blur(4px)" }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                >
                  {abaQrData.quotes[currentQuoteIndex]}
                </motion.p>
              </AnimatePresence>
            </div>

            <div className="flex items-center justify-center gap-4 mt-6">
              <div className="flex gap-1">
                {abaQrData.quotes.map((_, index) => (
                  <motion.button
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentQuoteIndex ? "w-6" : ""
                    }`}
                    style={{
                      background:
                        index === currentQuoteIndex
                          ? currentTheme.accent
                          : `${currentTheme.accent}40`,
                    }}
                    onClick={() => setCurrentQuoteIndex(index)}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}