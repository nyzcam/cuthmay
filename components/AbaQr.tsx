"use client";
import React, { useState, useEffect } from "react";
import { QrCode } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useTheme } from "../providers/ThemeContext";
import Image from "next/image";

type AbaQrProps = {
  merchant?: string;
  size?: number;
  showAnimation?: boolean;
  cornerColor?: string;
};

const quotes = [
  "ថ្ងៃនេះថ្ងៃជា មេបាគ្រប់គ្នា ចូលមកត្រៀបត្រា ជាអធិតេយ្យ ក្នុងមង្គលការ ឱ្យបានសុខា ដល់បុត្រជៀងជាក់។",
  "លោកអើយពាក្យពរ ពិរោះសាទ រុងរឿងសិទ្ធិស័ក្ត ខ្ញុំនឹងថ្លាថ្លែង​ ចាចែងដោយថ្នាក់ ដោយបទជើងជាក់ ជួបចប់វាចារ។",
  "អំបោះសសម គួរគាប់ឧត្តម ដូចលួសសុវណ្ណា កកាន់លើកឡើង ថ្កល់ថ្កើងថ្លៃថ្លា ចូលចងហត្ថា ឱ្យអ្នកសុខសាន្ត។",
  "ឱ្យអ្នកបានទី ខ្ពង់ខ្ពស់ឫទ្ធី បរិបូណ៌ថ្កើនថ្កាន អាយុយឺនយូរ កបគូបុរាណ មួយរយឆ្នាំបាន ចៀសចាករោគា។",
  "នីរទុក្ខំ ទោមនស្សំ ឧបទ្ទវា នីរសោកេ រោគេពាធា ស្វាមីភរិយា ហោន្តុសុខំ។",
  "ធនធនា ទាសីទាសា ធនធនំ អស្សធនោ ភោគោឧត្តម បរិសុខ ពហុយសា។",
];

export default function AbaQr({
  merchant = "SET K. & DETH V.",
  size = 200,
  showAnimation = true,
  cornerColor,
}: AbaQrProps) {
  const { currentTheme } = useTheme();
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuoteIndex((prev) => (prev + 1) % quotes.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const activeCornerColor = cornerColor || `border-[${currentTheme.accent}]`;

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
            សូមពរជ័យគ្រប់ប្រការ
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
              href="https://pay.ababank.com/oRF8/miaea0t0"
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
            <div
              className={`absolute -top-4 -left-4 w-10 h-10 border-t-4 border-l-4 ${activeCornerColor} rounded-tl-3xl`}
            />
            <div
              className={`absolute -top-4 -right-4 w-10 h-10 border-t-4 border-r-4 ${activeCornerColor} rounded-tr-3xl`}
            />
            <div
              className={`absolute -bottom-4 -left-4 w-10 h-10 border-b-4 border-l-4 ${activeCornerColor} rounded-bl-3xl`}
            />
            <div
              className={`absolute -bottom-4 -right-4 w-10 h-10 border-b-4 border-r-4 ${activeCornerColor} rounded-br-3xl`}
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
              <span className="font-mono tracking-wide">{merchant}</span>
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
                  {quotes[currentQuoteIndex]}
                </motion.p>
              </AnimatePresence>
            </div>

            <div className="flex items-center justify-center gap-4 mt-6">
              <div className="flex gap-1">
                {quotes.map((_, index) => (
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
