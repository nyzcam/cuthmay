import Link from "next/link";
import { Copy, CheckCheck, ExternalLink, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { Guest } from "@/data/guestList";
import { ADMIN_COLORS } from "@/components/admin/AdminShell";

interface GuestListTableProps {
  guests: (Guest & { slug: string })[];
  copiedSlug: string | null;
  onCopyLink: (slug: string) => void;
  onRemoveGuest: (slug: string) => void;
  deletingGuestSlug: string | null;
  pageStartIndex: number;
}

const RELATIONSHIP_LABELS: Record<string, string> = {
  "immediate-family": "គ្រួសារបន្ទាន់",
  family: "គ្រួសារ",
  vip: "VIP",
  friend: "មិត្តភ័ក្ដ",
  colleague: "មិត្តរួមការងារ",
  guest: "ភ្ញៀវ",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "រង់ចាំ",
  sent: "បានផ្ញើ",
  confirmed: "បានបញ្ជាក់",
  declined: "បានបដិសេធ",
};

export function GuestListTable({
  guests,
  copiedSlug,
  onCopyLink,
  onRemoveGuest,
  deletingGuestSlug,
  pageStartIndex,
}: GuestListTableProps) {
  return (
    <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl">
      <div className="overflow-x-auto rounded-2xl">
        <table className="w-full min-w-[860px] table-fixed text-sm">
          <thead className="bg-black/10">
            <tr className="border-b border-white/10 text-white/40 text-xs uppercase tracking-wider">
              <th className="w-16 px-5 py-3 text-left">#</th>
              <th className="px-5 py-3 text-left">ឈ្មោះខ្មែរ</th>
              <th className="w-48 px-5 py-3 text-left hidden sm:table-cell">English</th>
              <th className="w-36 px-5 py-3 text-left hidden md:table-cell">ប្រភេទ</th>
              <th className="w-28 px-5 py-3 text-left hidden lg:table-cell">ស្ថានភាព</th>
              <th className="w-36 px-5 py-3 text-left hidden xl:table-cell">បង្កើតដោយ</th>
              <th className="w-28 px-5 py-3 text-right">ប្រតិបត្តិការ</th>
            </tr>
          </thead>
          <tbody>
            {guests.map((guest, idx) => (
              <motion.tr
                key={guest.slug}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: Math.min(idx * 0.02, 0.4) }}
                className="border-b border-white/5 hover:bg-white/5 transition-colors group"
              >
                <td className="px-5 py-3 text-white/30 font-mono text-xs">{pageStartIndex + idx + 1}</td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-white text-xs font-bold"
                      style={{
                        background: `linear-gradient(135deg, ${ADMIN_COLORS.accentSoft}66, ${ADMIN_COLORS.accent}44)`,
                      }}
                    >
                      {guest.khmerName.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <span className="text-white/80 font-medium block truncate">
                        {guest.title ? `${guest.title} ` : ""}{guest.khmerName}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3 text-white/50 hidden sm:table-cell truncate">
                  {guest.englishName ?? "—"}
                </td>
                <td className="px-5 py-3 hidden md:table-cell">
                  <span
                    className="text-xs px-2 py-0.5 rounded-lg"
                    style={{
                      background: `${ADMIN_COLORS.accent}15`,
                      color: `${ADMIN_COLORS.accent}cc`,
                      border: `1px solid ${ADMIN_COLORS.accent}30`,
                    }}
                  >
                    {RELATIONSHIP_LABELS[guest.relationship ?? "guest"] ?? guest.relationship}
                  </span>
                </td>
                <td className="px-5 py-3 hidden lg:table-cell">
                  <span className="text-xs text-white/30">
                    {STATUS_LABELS[guest.status ?? "pending"] ?? "រង់ចាំ"}
                  </span>
                </td>
                <td className="px-5 py-3 text-white/50 hidden xl:table-cell">
                  <div className="min-w-0">
                    <p className="truncate text-xs text-white/70">
                      {guest.createdByName ?? guest.createdByEmail ?? "ប្រព័ន្ធ"}
                    </p>
                    {guest.createdByEmail && guest.createdByName && (
                      <p className="truncate text-[11px] text-white/35">{guest.createdByEmail}</p>
                    )}
                  </div>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/invite/${guest.slug}`}
                      target="_blank"
                      className="p-1.5 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/10 transition-all"
                      title="មើលការអញ្ជើញ"
                    >
                      <ExternalLink size={14} />
                    </Link>
                    <button
                      onClick={() => onCopyLink(guest.slug)}
                      className="p-1.5 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/10 transition-all"
                      title="ចម្លងតំណ"
                    >
                      {copiedSlug === guest.slug ? (
                        <CheckCheck size={14} className="text-green-400" />
                      ) : (
                        <Copy size={14} />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemoveGuest(guest.slug)}
                      disabled={deletingGuestSlug === guest.slug}
                      className="p-1.5 rounded-lg text-red-300/70 hover:text-red-200 hover:bg-red-500/20 transition-all disabled:opacity-40"
                      title="លុបភ្ញៀវ"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
