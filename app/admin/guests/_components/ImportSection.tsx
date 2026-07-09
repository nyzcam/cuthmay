"use client";

import React from "react";
import { motion } from "framer-motion";
import { ADMIN_COLORS } from "@/components/admin/AdminShell";
import { BulkImportForm } from "@/components/BulkImportForm";

interface ImportSectionProps {
  selectedEventId: string | null;
  onImportComplete: React.ComponentProps<typeof BulkImportForm>["onImportComplete"];
}

export function ImportSection({ selectedEventId, onImportComplete }: ImportSectionProps) {
  return (
    <motion.div
      key="import"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {!selectedEventId ? (
        <div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          Select an event in the Events tab before importing guests.
        </div>
      ) : (
        <BulkImportForm onImportComplete={onImportComplete} eventId={selectedEventId} />
      )}

      <div
        className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md"
        style={{ borderColor: `${ADMIN_COLORS.accent}25` }}
      >
        <h3 className="mb-3 flex items-center gap-2 font-bold text-white/70">
          <span>📋</span> ទម្រង់ CSV
        </h3>
        <code className="block overflow-x-auto rounded-xl border border-white/10 bg-black/40 p-4 text-xs leading-relaxed text-green-300/80">
          {`khmerName,englishName,title,relationship,status\nចាន់ ធីដា,Chan Thida,អ្នកនាង,friend,pending\nហៀង សុផុន,Heang Sophorn,ឯកឧត្តម,vip,pending`}
        </code>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {[
            { field: "khmerName", note: "ចាំបាច់", color: "#f87171" },
            { field: "englishName", note: "ស្រេចចិត្ត", color: "#34d399" },
            { field: "title", note: "ស្រេចចិត្ត", color: "#34d399" },
            { field: "relationship", note: "ស្រេចចិត្ត", color: "#34d399" },
            { field: "status", note: "ស្រេចចិត្ត", color: "#34d399" },
          ].map((field) => (
            <div key={field.field} className="flex items-center gap-2 text-xs">
              <span className="font-mono text-white/60">{field.field}</span>
              <span style={{ color: field.color }} className="opacity-70">
                {field.note}
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
