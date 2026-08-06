"use client";
import React, { useState, useEffect } from "react";
import { MessageCircle, QrCode } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useTheme } from "../providers/ThemeContext";
import {
  defaultAbaQrData,
  getAbaPaymentLink,
  type AbaQrData,
} from "../data/abaQrData";
import Image from "next/image";
import GuestCommentPopup from "./GuestCommentPopup";

type AbaQrProps = {
  merchant?: string;
  size?: number;
  showAnimation?: boolean;
  cornerColor?: string;
  abaQrData?: AbaQrData;
  guestSlug?: string;
  guestName?: string;
};

type DisplayQuote = {
  text: string;
  author?: string;
};

const COMMENT_REFRESH_INTERVAL_MS = 30000;

export default function AbaQr({
  merchant = defaultAbaQrData.merchant,
  size = 200,
  showAnimation = true,
  cornerColor,
  abaQrData = defaultAbaQrData,
  guestSlug,
  guestName,
}: AbaQrProps) {
  const { currentTheme } = useTheme();
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [displayQuotes, setDisplayQuotes] = useState<DisplayQuote[]>(() =>
    abaQrData.quotes.map((quote) => ({ text: quote }))
  );
  const [commentOpen, setCommentOpen] = useState(false);

  const CACHE_KEY = "newest-comments-cache";
  const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  useEffect(() => {
    setDisplayQuotes(abaQrData.quotes.map((quote) => ({ text: quote })));
  }, [abaQrData.quotes]);

  useEffect(() => {
    let isMounted = true;

    const loadNewestComments = async () => {
      // Check cache first
      const cached = localStorage.getItem(CACHE_KEY);

      if (cached) {
        try {
          const { timestamp, comments } = JSON.parse(cached);

          if (Date.now() - timestamp < CACHE_DURATION) {
            setDisplayQuotes(comments);
            setCurrentQuoteIndex(0);
            return;
          }
        } catch {
          localStorage.removeItem(CACHE_KEY);
        }
      }

      const controller = new AbortController();

      try {
        const response = await fetch("/api/guests/comment?public=1&limit=6", {
          signal: controller.signal,
          cache: "no-store",
          headers: {
            Accept: "application/json",
          },
        });

        if (!response.ok) return;

        const result = (await response.json()) as {
          comments?: Array<{ comment?: string; guestName?: string }>;
        };

        const newestComments = (result.comments ?? [])
          .map((item) => ({
            text: (item.comment ?? "").trim(),
            author: (item.guestName ?? "").trim(),
          }))
          .filter((item) => item.text.length > 0);

        if (newestComments.length > 0) {
          setDisplayQuotes(newestComments);
          setCurrentQuoteIndex(0);

          // Save cache
          localStorage.setItem(
            CACHE_KEY,
            JSON.stringify({
              timestamp: Date.now(),
              comments: newestComments,
            })
          );
        }
      } catch (err) {
        if ((err as DOMException).name !== "AbortError") {
          console.error(err);
        }
      }
    };

    void loadNewestComments();
    const refreshTimer = window.setInterval(() => {
      void loadNewestComments();
    }, COMMENT_REFRESH_INTERVAL_MS);

    return () => {
      isMounted = false;
      window.clearInterval(refreshTimer);
    };
  }, []);

  useEffect(() => {
    if (displayQuotes.length <= 1) {
      return;
    }

    const interval = setInterval(() => {
      setCurrentQuoteIndex((prev) => (prev + 1) % displayQuotes.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [displayQuotes.length]);

  // Use inline styles instead of dynamic Tailwind classes for borders
  const activeCornerColor = cornerColor || currentTheme.accent;

  // Create a style object for the corner borders
  const cornerBorderStyle = {
    borderColor: activeCornerColor,
  };
  const activeQuote = displayQuotes[currentQuoteIndex];

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
          <h4 className="font-khmer text-af text-xl md:text-2xl">
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
        className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12 p-8"
        initial={{ opacity: 0, y: 60, scale: 0.9 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      >
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="relative group mx-6 my-6">
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
              <span className="font-mono tracking-wide text-af">
                {abaQrData.merchant}
              </span>
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
            <motion.div
              layout
              className="relative backdrop-blur-sm border rounded-2xl p-6 hover:bg-white/5 transition-all duration-500"
              style={{
                borderColor: `${currentTheme.accent}33`,
              }}
              transition={{ layout: { duration: 0.35, ease: "easeInOut" } }}
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

              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  layout
                  key={`${currentQuoteIndex}-${activeQuote?.text ?? ""}`}
                  className="relative z-10"
                  initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -20, filter: "blur(4px)" }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                >
                  <p className="font-khmer text-af italic text-sm md:text-base leading-7 md:leading-8 pt-3 pb-3">
                    {activeQuote?.text ?? ""}
                  </p>
                  {activeQuote?.author && (
                    <p className="mt-1 text-xs md:text-sm font-khmer text-af italic">
                      " {activeQuote.author} "
                    </p>
                  )}
                </motion.div>
              </AnimatePresence>
            </motion.div>


          </motion.div>

          {guestSlug && guestName && (
            <motion.button
              type="button"
              onClick={() => setCommentOpen(true)}
              className={`group relative mt-6 cursor-pointer py-3 px-6 rounded-2xl
                font-khmer text-base tracking-wide shadow-md
                border transition-all duration-300
                hover:shadow-xl hover:scale-105 active:scale-95
                focus:outline-none focus:ring-2 focus:ring-opacity-50`}
              style={
                {
                  borderColor: currentTheme.accent,
                  boxShadow: `0 0 5px ${currentTheme.accent}50`,
                  color: currentTheme.accent,
                  "--tw-ring-color": currentTheme.accent,
                } as React.CSSProperties
              }
            >
              <span
                className="absolute inset-0 rounded-2xl p-[2px] blur-md transition-opacity"
                style={{
                  background: `linear-gradient(to right, ${currentTheme.accent}20, ${currentTheme.accent}60, ${currentTheme.accent}20)`,
                  opacity: "0.1",
                }}
              />
              <div className="relative flex items-center justify-center space-x-2">
                <MessageCircle size={18} style={{ color: currentTheme.accent }} />
                <span
                  className="bg-clip-text text-transparent font-medium"
                  style={{
                    backgroundImage: `linear-gradient(to right, ${currentTheme.accent}, var(--gold-light), ${currentTheme.accent})`,
                  }}
                >
                  មតិយោបល់
                </span>
              </div>
            </motion.button>
          )}
        </div>
      </motion.div>
      {guestSlug && guestName && (
        <GuestCommentPopup
          guestSlug={guestSlug}
          guestName={guestName}
          open={commentOpen}
          onClose={() => setCommentOpen(false)}
        />
      )}
    </div>
  );
}
