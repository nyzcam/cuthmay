import Link from "next/link";
import { motion } from "framer-motion";
import { ExternalLink, MessageSquareText, BadgeCheck, Archive, Trash2 } from "lucide-react";
import { GuestCommentRecord } from "@/types/types";
import { ADMIN_COLORS } from "@/components/admin/AdminShell";

interface CommentsPanelProps {
  comments: GuestCommentRecord[];
  isLoading: boolean;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onStatusUpdate: (id: string, status: GuestCommentRecord["status"]) => void;
  onDeleteComment: (id: string) => void;
  updatingCommentId: string | null;
  deletingCommentId: string | null;
}

const COMMENT_STATUS_LABELS: Record<string, string> = {
  new: "ថ្មី",
  reviewed: "បានមើល",
  archived: "បានទុក",
};

function formatTimestamp(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toISOString().slice(0, 16).replace("T", " ");
}

export function CommentsPanel({
  comments,
  isLoading,
  statusFilter,
  onStatusFilterChange,
  searchQuery,
  onSearchChange,
  onStatusUpdate,
  onDeleteComment,
  updatingCommentId,
  deletingCommentId,
}: CommentsPanelProps) {
  const filteredComments = comments.filter((comment) => {
    const matchesStatus = statusFilter === "all" || comment.status === statusFilter;
    const matchesSearch =
      searchQuery === "" ||
      comment.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comment.guestSlug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comment.comment.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-white/40">អានមតិយោបល់ដែលភ្ញៀវបានផ្ញើតាមតំណអញ្ជើញ</p>
        </div>
        <div className="text-sm text-white/35">សរុប {filteredComments.length} / {comments.length} មតិយោបល់</div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <MessageSquareText size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            placeholder="ស្វែងរកមតិយោបល់ ឬភ្ញៀវ..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/80 placeholder-white/30 text-sm focus:outline-none focus:border-white/30 focus:bg-white/10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/70 text-sm focus:outline-none focus:border-white/30 appearance-none"
        >
          <option value="all">ស្ថានភាពទាំងអស់</option>
          <option value="new">ថ្មី</option>
          <option value="reviewed">បានមើល</option>
          <option value="archived">បានទុក</option>
        </select>
      </div>

      {isLoading ? (
        <div className="text-sm text-white/40">កំពុងទាញយកមតិយោបល់...</div>
      ) : filteredComments.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-10 text-center text-white/35">
          មិនទាន់មានមតិយោបល់ពីភ្ញៀវទេ
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {filteredComments.map((comment) => (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-white/10 bg-white/5 p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-white/85 font-medium">{comment.guestName}</p>
                  <p className="text-xs text-white/35 mt-1">{comment.pagePath}</p>
                </div>
                <span
                  className="text-xs px-2 py-1 rounded-lg"
                  style={{
                    background: `${ADMIN_COLORS.accent}15`,
                    color: `${ADMIN_COLORS.accent}cc`,
                  }}
                >
                  {COMMENT_STATUS_LABELS[comment.status]}
                </span>
              </div>
              <p className="mt-4 text-sm leading-6 text-white/65 whitespace-pre-wrap">{comment.comment}</p>
              <div className="mt-4 flex items-center justify-between text-xs text-white/30">
                <span>{formatTimestamp(comment.createdAt)}</span>
                <Link
                  href={comment.pagePath}
                  target="_blank"
                  className="inline-flex items-center gap-1 text-white/45 hover:text-white/75"
                >
                  មើល URL <ExternalLink size={12} />
                </Link>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onStatusUpdate(comment.id, "reviewed")}
                  disabled={updatingCommentId === comment.id || comment.status === "reviewed"}
                  className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-white/80 border border-white/10 bg-white/5 hover:bg-white/10 disabled:opacity-40"
                >
                  <BadgeCheck size={14} />
                  បានមើល
                </button>
                <button
                  type="button"
                  onClick={() => onStatusUpdate(comment.id, "archived")}
                  disabled={updatingCommentId === comment.id || comment.status === "archived"}
                  className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-white/80 border border-white/10 bg-white/5 hover:bg-white/10 disabled:opacity-40"
                >
                  <Archive size={14} />
                  ទុកបណ្ណសារ
                </button>
                {comment.status !== "new" && (
                  <button
                    type="button"
                    onClick={() => onStatusUpdate(comment.id, "new")}
                    disabled={updatingCommentId === comment.id}
                    className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-white/80 border border-white/10 bg-white/5 hover:bg-white/10 disabled:opacity-40"
                  >
                    <MessageSquareText size={14} />
                    ដាក់ជាថ្មី
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onDeleteComment(comment.id)}
                  disabled={deletingCommentId === comment.id}
                  className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-red-200 border border-red-300/30 bg-red-500/10 hover:bg-red-500/20 disabled:opacity-40"
                >
                  <Trash2 size={14} />
                  លុប
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
