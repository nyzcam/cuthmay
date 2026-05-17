"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { MessageCircle, Send, X, CheckCircle, AlertCircle } from "lucide-react";
import { useTheme } from "@/providers/ThemeContext";

interface GuestCommentPopupProps {
  guestSlug: string;
  guestName: string;
  open: boolean;
  onClose: () => void;
}

const MAX_COMMENT_LENGTH = 1200;

export default function GuestCommentPopup({
  guestSlug,
  guestName,
  open,
  onClose,
}: GuestCommentPopupProps) {
  const { currentTheme } = useTheme();
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const portalRef = useRef<Element | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    portalRef.current = document.body;
    setMounted(true);
  }, []);

  const charCount = comment.trim().length;
  const charPct = (charCount / MAX_COMMENT_LENGTH) * 100;

  const submitComment = async () => {
    const text = comment.trim();
    if (!text) {
      setMessage({ type: "error", text: "សូមវាយបញ្ចូលមតិយោបល់" });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch("/api/guests/comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestSlug,
          guestName,
          pagePath: window.location.pathname,
          comment: text,
        }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to submit comment");
      }

      setMessage({ type: "success", text: "អរគុណ! យើងបានទទួលមតិយោបល់របស់អ្នក។" });
      setComment("");
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "មានបញ្ហាក្នុងការផ្ញើមតិយោបល់",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!mounted || !portalRef.current) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed z-50 left-1/2 top-1/2 w-[92%] max-w-lg -translate-x-1/2 -translate-y-1/2"
            initial={{ opacity: 0, y: 30, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            {/* Ambient glow */}
            <div
              className="absolute inset-0 rounded-3xl blur-xl opacity-20 pointer-events-none"
              style={{ background: `radial-gradient(ellipse at top, ${currentTheme.accent}, transparent 70%)` }}
            />

            <div
              className="relative rounded-3xl border bg-slate-950/96 p-6 shadow-2xl backdrop-blur-xl"
              style={{ borderColor: `${currentTheme.accent}33` }}
            >
              {/* Top accent line */}
              <div
                className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-2/3 rounded-full"
                style={{ background: `linear-gradient(to right, transparent, ${currentTheme.accent}99, transparent)` }}
              />

              {/* Header */}
              <div className="flex items-start justify-between gap-3 mb-5">
                <div className="flex items-center gap-3">
                  <div
                    className="flex items-center justify-center w-9 h-9 rounded-xl shrink-0"
                    style={{ background: `${currentTheme.accent}18`, border: `1px solid ${currentTheme.accent}40` }}
                  >
                    <MessageCircle size={16} style={{ color: currentTheme.accent }} />
                  </div>
                  <div>
                    <h3 className="font-khmer font-bold text-white text-base leading-tight">ផ្ញើសារ</h3>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl p-1.5 text-white/50 hover:bg-white/10 hover:text-white transition-colors duration-200"
                  aria-label="បិទ"
                >
                  <X size={17} />
                </button>
              </div>

              {/* Divider */}
              <div className="h-px mb-5" style={{ background: `${currentTheme.accent}22` }} />

              {/* Textarea */}
              <textarea
                id="guest-comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={MAX_COMMENT_LENGTH}
                rows={5}
                placeholder="សូមសរសេរមតិយោបល់ ឬសារជូនពរ..."
                className="w-full rounded-2xl border bg-white/5 p-4 text-sm text-white placeholder:text-white/30 focus:outline-none transition-colors duration-200 font-khmer leading-7 resize-none"
                style={{ borderColor: `${currentTheme.accent}33` }}
                onFocus={(e) => (e.currentTarget.style.borderColor = `${currentTheme.accent}99`)}
                onBlur={(e) => (e.currentTarget.style.borderColor = `${currentTheme.accent}33`)}
              />

              {/* Character progress bar */}
              <div className="mt-2 flex items-center gap-3 font-mono">
                <div className="flex-1 h-0.5 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${charPct}%`,
                      background: charPct > 90 ? "#f87171" : currentTheme.accent,
                    }}
                  />
                </div>
                <span className={`text-xs tabular-nums shrink-0 ${charPct > 90 ? "text-red-400" : "text-white/40"}`}>
                  {charCount}/{MAX_COMMENT_LENGTH}
                </span>
              </div>

              {/* Status message */}
              <AnimatePresence>
                {message && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`mt-4 flex items-center gap-2.5 rounded-xl border px-4 py-3 text-sm font-khmer ${
                      message.type === "success"
                        ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-300"
                        : "bg-red-500/10 border-red-500/25 text-red-300"
                    }`}
                  >
                    {message.type === "success"
                      ? <CheckCircle size={15} className="shrink-0" />
                      : <AlertCircle size={15} className="shrink-0" />
                    }
                    {message.text}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Footer */}
              <div className="mt-5 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white/60 hover:bg-white/10 hover:text-white transition-all duration-200 font-khmer"
                >
                  បិទ
                </button>
                <button
                  type="button"
                  onClick={submitComment}
                  disabled={submitting || charCount === 0}
                  className="inline-flex items-center gap-2 rounded-xl px-5 py-2 text-sm font-semibold text-white disabled:opacity-50 transition-all duration-200 hover:brightness-110 active:scale-95 font-khmer"
                  style={{ background: `linear-gradient(135deg, ${currentTheme.accent}DD, ${currentTheme.accent})` }}
                >
                  <Send size={13} />
                  {submitting ? "កំពុងផ្ញើ..." : "ផ្ញើ"}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    portalRef.current
  );
}
