"use client";

import React from "react";
import { motion, type Variants } from "framer-motion";
import { Clock, MessageSquareText, Settings, TrendingUp, UploadCloud, UserPlus, Users } from "lucide-react";
import { Guest } from "@/data/guestList";
import { GuestCommentRecord } from "@/types/types";
import { ADMIN_COLORS } from "@/components/admin/AdminShell";
import {
  COMMENT_STATUS_LABELS,
  formatTimestamp,
  type NavSection,
} from "@/app/admin/guests/_constants/dashboard";

type StatCard = {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
};

interface OverviewSectionProps {
  loadError: string | null;
  statCards: StatCard[];
  fadeInUp: Variants;
  statsTotal: number;
  byRelationship: Array<{ key: string; label: string; count: number }>;
  addedGuests: Guest[];
  recentComments: GuestCommentRecord[];
  isLoadingComments: boolean;
  onNavigate: (nav: NavSection) => void;
}

export function OverviewSection({
  loadError,
  statCards,
  fadeInUp,
  statsTotal,
  byRelationship,
  addedGuests,
  recentComments,
  isLoadingComments,
  onNavigate,
}: OverviewSectionProps) {
  return (
    <motion.div
      key="overview"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      {loadError && (
        <div className="rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {loadError}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            custom={i}
            className="group rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md transition-all hover:bg-white/10"
          >
            <div className="mb-3 flex items-start justify-between">
              <span className="rounded-xl p-2" style={{ background: `${card.color}20`, color: card.color }}>
                {card.icon}
              </span>
              <span
                className="rounded-lg px-2 py-1 text-xs"
                style={{ background: `${card.color}15`, color: `${card.color}cc` }}
              >
                +0%
              </span>
            </div>
            <p className="mt-1 text-3xl font-bold text-white">{card.value}</p>
            <p className="mt-1 text-sm text-white/50">{card.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          custom={4}
          className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md"
        >
          <h2 className="mb-4 flex items-center gap-2 font-bold text-white/80">
            <Settings size={16} />
            ប្រភេទភ្ញៀវ
          </h2>
          <div className="space-y-3">
            {byRelationship.filter((item) => item.count > 0).map((relationship) => {
              const pct = statsTotal > 0 ? (relationship.count / statsTotal) * 100 : 0;
              return (
                <div key={relationship.key}>
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-sm text-white/60">{relationship.label}</span>
                    <span className="font-mono text-sm text-white/80">{relationship.count}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ delay: 0.2, duration: 0.6 }}
                      className="h-full rounded-full"
                      style={{
                        background: `linear-gradient(90deg, ${ADMIN_COLORS.accentSoft}, ${ADMIN_COLORS.accent})`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          custom={5}
          className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md"
        >
          <h2 className="mb-4 flex items-center gap-2 font-bold text-white/80">
            <TrendingUp size={16} />
            សកម្មភាពរហ័ស
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "បន្ថែមភ្ញៀវ", nav: "add" as NavSection, icon: <UserPlus size={20} />, color: ADMIN_COLORS.accent },
              { label: "នាំចូល CSV", nav: "import" as NavSection, icon: <UploadCloud size={20} />, color: "#a78bfa" },
              { label: "បញ្ជីភ្ញៀវ", nav: "guests" as NavSection, icon: <Users size={20} />, color: "#34d399" },
              {
                label: "មតិយោបល់",
                nav: "comments" as NavSection,
                icon: <MessageSquareText size={20} />,
                color: "#f59e0b",
              },
            ].map((action) => (
              <button
                key={action.label}
                onClick={() => onNavigate(action.nav)}
                className="group flex flex-col items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-4 transition-all hover:border-white/20 hover:bg-white/10"
              >
                <span
                  className="rounded-xl p-2 transition-transform group-hover:scale-110"
                  style={{ background: `${action.color}20`, color: action.color }}
                >
                  {action.icon}
                </span>
                <span className="text-center text-xs text-white/60">{action.label}</span>
              </button>
            ))}
          </div>
        </motion.div>
      </div>

      {addedGuests.length > 0 && (
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          custom={6}
          className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md"
        >
          <h2 className="mb-4 flex items-center gap-2 font-bold text-white/80">
            <Clock size={16} />
            បានបន្ថែមថ្ងៃនេះ ({addedGuests.length})
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {addedGuests.slice(-6).map((guest, idx) => (
              <div key={idx} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
                <div
                  className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white"
                  style={{
                    background: `linear-gradient(135deg, ${ADMIN_COLORS.accentSoft}66, ${ADMIN_COLORS.accent}55)`,
                  }}
                >
                  {guest.khmerName.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm text-white/80">{guest.khmerName}</p>
                  <p className="truncate text-xs text-white/40">{guest.englishName}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        custom={7}
        className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md"
      >
        <h2 className="mb-4 flex items-center gap-2 font-bold text-white/80">
          <MessageSquareText size={16} />
          មតិយោបល់ថ្មីៗ
        </h2>
        {isLoadingComments ? (
          <p className="text-sm text-white/40">កំពុងទាញយកមតិយោបល់...</p>
        ) : recentComments.length === 0 ? (
          <p className="text-sm text-white/40">មិនទាន់មានមតិយោបល់</p>
        ) : (
          <div className="space-y-3">
            {recentComments.map((comment) => (
              <div key={comment.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-white/80">{comment.guestName}</p>
                    <p className="text-xs text-white/35">/{comment.guestSlug}</p>
                  </div>
                  <span className="whitespace-nowrap text-xs text-white/30">
                    {formatTimestamp(comment.createdAt)}
                  </span>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <span
                    className="rounded-lg px-2 py-1 text-[11px]"
                    style={{
                      background: `${ADMIN_COLORS.accent}15`,
                      color: `${ADMIN_COLORS.accent}cc`,
                    }}
                  >
                    {COMMENT_STATUS_LABELS[comment.status]}
                  </span>
                </div>
                <p className="mt-3 line-clamp-3 text-sm text-white/65">{comment.comment}</p>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
