"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Send, X } from "lucide-react";

interface GuestCommentPopupProps {
  guestSlug: string;
  guestName: string;
}

const MAX_COMMENT_LENGTH = 1200;

export default function GuestCommentPopup({ guestSlug, guestName }: GuestCommentPopupProps) {
  const [open, setOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

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
        headers: {
          "Content-Type": "application/json",
        },
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

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:scale-[1.02]"
        style={{
          background: "linear-gradient(135deg, #0e7490, #06b6d4)",
          boxShadow: "0 10px 28px rgba(6, 182, 212, 0.35)",
        }}
      >
        <MessageCircle size={18} />
        មតិយោបល់
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 z-50 bg-black/55"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />

            <motion.div
              className="fixed z-50 left-1/2 top-1/2 w-[92%] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-cyan-100/20 bg-slate-950/95 p-5 text-white shadow-2xl backdrop-blur-lg"
              initial={{ opacity: 0, y: 25, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.96 }}
              transition={{ duration: 0.2 }}
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold">ផ្ញើមតិយោបល់</h3>
                  <p className="mt-1 text-sm text-white/65">
                    សម្រាប់ {guestName}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg p-1.5 text-white/65 hover:bg-white/10 hover:text-white"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>

              <label htmlFor="guest-comment" className="mb-2 block text-sm text-white/75">
                សាររបស់អ្នក
              </label>
              <textarea
                id="guest-comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={MAX_COMMENT_LENGTH}
                rows={5}
                placeholder="សូមសរសេរមតិយោបល់ ឬសារជូនពរ..."
                className="w-full rounded-xl border border-white/15 bg-white/5 p-3 text-sm text-white placeholder:text-white/35 focus:border-cyan-400 focus:outline-none"
              />
              <div className="mt-1 text-right text-xs text-white/45">
                {comment.trim().length}/{MAX_COMMENT_LENGTH}
              </div>

              {message && (
                <div
                  className={`mt-3 rounded-lg px-3 py-2 text-sm ${
                    message.type === "success"
                      ? "bg-emerald-500/15 text-emerald-300"
                      : "bg-red-500/15 text-red-300"
                  }`}
                >
                  {message.text}
                </div>
              )}

              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-xl border border-white/15 px-4 py-2 text-sm text-white/75 hover:bg-white/10"
                >
                  បិទ
                </button>
                <button
                  type="button"
                  onClick={submitComment}
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg, #0891b2, #06b6d4)" }}
                >
                  <Send size={14} />
                  {submitting ? "កំពុងផ្ញើ..." : "ផ្ញើ"}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
