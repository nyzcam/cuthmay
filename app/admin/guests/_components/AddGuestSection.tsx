"use client";

import React from "react";
import { motion } from "framer-motion";
import { SingleGuestForm } from "@/components/SingleGuestForm";

interface AddGuestSectionProps {
  selectedEventId: string | null;
  onGuestAdded: React.ComponentProps<typeof SingleGuestForm>["onGuestAdded"];
}

export function AddGuestSection({ selectedEventId, onGuestAdded }: AddGuestSectionProps) {
  return (
    <motion.div
      key="add"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3 }}
    >
      {!selectedEventId ? (
        <div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          Select an event in the Events tab before adding guests.
        </div>
      ) : (
        <SingleGuestForm onGuestAdded={onGuestAdded} eventId={selectedEventId} />
      )}
    </motion.div>
  );
}
