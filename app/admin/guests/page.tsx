"use client";

import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  UserPlus,
  UploadCloud,
  LayoutDashboard,
  MessageSquareText,
  TrendingUp,
  CalendarDays,
  Star,
  Clock,
  Filter,
} from "lucide-react";
import { motion, AnimatePresence, useReducedMotion, type Variants } from "framer-motion";
import { BulkImportForm } from "@/components/BulkImportForm";
import { SingleGuestForm } from "@/components/SingleGuestForm";
import AdminShell, { ADMIN_COLORS } from "@/components/admin/AdminShell";
import { Guest } from "@/data/guestList";
import { GuestCommentRecord } from "@/types/types";
import { GuestListTable } from "@/components/admin/GuestListTable";
import { GuestSearchBar } from "@/components/admin/GuestSearchBar";
import { PaginationControls } from "@/components/admin/PaginationControls";
import { CommentsPanel } from "@/components/admin/CommentsPanel";

const MAX_RECENT_GUESTS = 200;
const GUESTS_PER_PAGE = 10;

type NavSection = "overview" | "guests" | "comments" | "add" | "import";
type GuestRecord = Guest & { slug: string };
type CommentStatus = GuestCommentRecord["status"];

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

const COMMENT_STATUS_LABELS: Record<CommentStatus, string> = {
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

export default function GuestManagementPage() {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();
  const activeContentRef = useRef<HTMLDivElement | null>(null);
  const [activeNav, setActiveNav] = useState<NavSection>("overview");
  const [dbGuests, setDbGuests] = useState<GuestRecord[]>([]);
  const [comments, setComments] = useState<GuestCommentRecord[]>([]);
  const [addedGuests, setAddedGuests] = useState<Guest[]>([]);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isLoadingGuests, setIsLoadingGuests] = useState(true);
  const [isLoadingComments, setIsLoadingComments] = useState(true);
  const [updatingCommentId, setUpdatingCommentId] = useState<string | null>(null);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);
  const [deletingGuestSlug, setDeletingGuestSlug] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRelationship, setFilterRelationship] = useState("all");
  const [commentStatusFilter, setCommentStatusFilter] = useState<"all" | CommentStatus>("all");
  const [guestPage, setGuestPage] = useState(1);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  const loadGuests = useCallback(async () => {
    setIsLoadingGuests(true);
    setLoadError(null);
    try {
      const response = await fetch("/api/guests", {
        headers: { Accept: "application/json" },
        cache: "no-store",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load guests");
      }

      setDbGuests(Array.isArray(data.guests) ? data.guests : []);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Failed to load guests");
      setDbGuests([]);
    } finally {
      setIsLoadingGuests(false);
    }
  }, []);

  const loadComments = useCallback(async () => {
    setIsLoadingComments(true);
    try {
      const response = await fetch("/api/guests/comment", {
        headers: { Accept: "application/json" },
        cache: "no-store",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load comments");
      }

      setComments(Array.isArray(data.comments) ? data.comments : []);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Failed to load comments");
      setComments([]);
    } finally {
      setIsLoadingComments(false);
    }
  }, []);

  useEffect(() => {
    loadGuests();
    loadComments();
  }, [loadGuests, loadComments]);

  useEffect(() => {
    setGuestPage(1);
  }, [searchQuery, filterRelationship]);

  useEffect(() => {
    activeContentRef.current?.scrollTo({
      top: 0,
      behavior: shouldReduceMotion ? "auto" : "smooth",
    });
  }, [activeNav, shouldReduceMotion]);

  // All guests from database + session-added guests
  const allGuests = useMemo(() => {
    const dynamicEntries = addedGuests.map((g, i) => ({
      slug: `new-${i}`,
      ...g,
    }));
    return [...dynamicEntries.reverse(), ...dbGuests];
  }, [dbGuests, addedGuests]);

  const filteredGuests = useMemo(() => {
    return allGuests.filter((g) => {
      const matchSearch =
        searchQuery === "" ||
        g.khmerName.includes(searchQuery) ||
        (g.englishName ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.slug.toLowerCase().includes(searchQuery.toLowerCase());
      const matchFilter =
        filterRelationship === "all" || g.relationship === filterRelationship;
      return matchSearch && matchFilter;
    });
  }, [allGuests, searchQuery, filterRelationship]);

  const totalGuestPages = Math.max(1, Math.ceil(filteredGuests.length / GUESTS_PER_PAGE));

  const paginatedGuests = useMemo(() => {
    const startIndex = (guestPage - 1) * GUESTS_PER_PAGE;
    return filteredGuests.slice(startIndex, startIndex + GUESTS_PER_PAGE);
  }, [filteredGuests, guestPage]);

  useEffect(() => {
    if (guestPage > totalGuestPages) {
      setGuestPage(totalGuestPages);
    }
  }, [guestPage, totalGuestPages]);

  const stats = useMemo(() => {
    const total = allGuests.length;
    const vip = allGuests.filter((g) => g.relationship === "vip").length;
    const family = allGuests.filter(
      (g) => g.relationship === "family" || g.relationship === "immediate-family"
    ).length;
    const session = addedGuests.length;
    const totalComments = comments.length;
    const byRelationship = Object.entries(RELATIONSHIP_LABELS).map(([key, label]) => ({
      key,
      label,
      count: allGuests.filter((g) => g.relationship === key).length,
    }));
    return { total, vip, family, session, totalComments, byRelationship };
  }, [allGuests, addedGuests.length, comments.length]);

  const recentComments = useMemo(() => comments.slice(0, 6), [comments]);
  const filteredComments = useMemo(() => {
    return comments.filter((comment) => {
      const matchesStatus = commentStatusFilter === "all" || comment.status === commentStatusFilter;
      const matchesSearch =
        searchQuery === "" ||
        comment.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        comment.guestSlug.toLowerCase().includes(searchQuery.toLowerCase()) ||
        comment.comment.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesStatus && matchesSearch;
    });
  }, [comments, commentStatusFilter, searchQuery]);

  const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 16 },
    visible: (i: number = 0) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: shouldReduceMotion ? 0 : i * 0.07,
        duration: 0.45,
        ease: [0.25, 0.1, 0.25, 1],
      },
    }),
  };

  const handleGuestAdded = useCallback((guest: Guest) => {
    setAddedGuests((prev) => {
      const next = [...prev, guest];
      return next.length > MAX_RECENT_GUESTS
        ? next.slice(next.length - MAX_RECENT_GUESTS)
        : next;
    });
    void loadGuests();
  }, [loadGuests]);

  const handleImportComplete = useCallback((_count: number) => {
    void loadGuests();
  }, [loadGuests]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/");
    } catch {
      setIsLoggingOut(false);
    }
  };

  const handleCopyLink = useCallback(async (slug: string) => {
    const url = `${window.location.origin}/invite/${slug}`;
    await navigator.clipboard.writeText(url);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  }, []);

  const handleCommentStatusUpdate = useCallback(async (id: string, status: CommentStatus) => {
    setUpdatingCommentId(id);
    setLoadError(null);

    try {
      const response = await fetch("/api/guests/comment", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, status }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update comment");
      }

      setComments((prev) =>
        prev.map((comment) =>
          comment.id === id ? { ...comment, status: data.comment.status } : comment
        )
      );
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Failed to update comment");
    } finally {
      setUpdatingCommentId(null);
    }
  }, []);

  const handleCommentDelete = useCallback(async (id: string) => {
    const confirmed = window.confirm("តើអ្នកប្រាកដថាចង់លុបមតិយោបល់នេះមែនទេ?");
    if (!confirmed) {
      return;
    }

    setDeletingCommentId(id);
    setLoadError(null);

    try {
      const response = await fetch(`/api/guests/comment?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete comment");
      }

      setComments((prev) => prev.filter((comment) => comment.id !== id));
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Failed to delete comment");
    } finally {
      setDeletingCommentId(null);
    }
  }, []);

  const handleGuestDelete = useCallback(async (slug: string) => {
    const confirmed = window.confirm("តើអ្នកប្រាកដថាចង់លុបភ្ញៀវនេះមែនទេ?");
    if (!confirmed) {
      return;
    }

    const localGuestMatch = /^new-(\d+)$/.exec(slug);
    if (localGuestMatch) {
      const localIndex = Number(localGuestMatch[1]);
      if (Number.isInteger(localIndex) && localIndex >= 0) {
        setAddedGuests((prev) => prev.filter((_, index) => index !== localIndex));
      }
      return;
    }

    setDeletingGuestSlug(slug);
    setLoadError(null);

    try {
      const response = await fetch(`/api/guests?slug=${encodeURIComponent(slug)}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete guest");
      }

      setDbGuests((prev) => prev.filter((guest) => guest.slug !== slug));
      setComments((prev) => prev.filter((comment) => comment.guestSlug !== slug));
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Failed to delete guest");
    } finally {
      setDeletingGuestSlug(null);
    }
  }, []);

  const navItems: { id: NavSection; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: "overview", label: "ទិដ្ឋភាពរួម", icon: <LayoutDashboard size={18} /> },
    { id: "guests", label: "បញ្ជីភ្ញៀវ", icon: <Users size={18} />, badge: stats.total },
    { id: "comments", label: "មតិយោបល់", icon: <MessageSquareText size={18} />, badge: stats.totalComments },
    { id: "add", label: "បន្ថែមភ្ញៀវ", icon: <UserPlus size={18} /> },
    { id: "import", label: "នាំចូលច្រើន", icon: <UploadCloud size={18} /> },
  ];

  const statCards = [
    { label: "ភ្ញៀវសរុប", value: stats.total, icon: <Users size={22} />, color: ADMIN_COLORS.accent },
    { label: "VIP", value: stats.vip, icon: <Star size={22} />, color: "#f59e0b" },
    { label: "គ្រួសារ", value: stats.family, icon: <CalendarDays size={22} />, color: "#34d399" },
    { label: "មតិយោបល់", value: stats.totalComments, icon: <MessageSquareText size={22} />, color: "#a78bfa" },
  ];

  return (
    <AdminShell
      activeNav={activeNav}
      navItems={navItems}
      onSelectNav={setActiveNav}
      onLogout={handleLogout}
      isLoggingOut={isLoggingOut}
    >
      <div ref={activeContentRef} className="hide-scrollbar h-full min-h-0 overflow-y-auto pr-1">
      <AnimatePresence mode="wait">
            {/* ─── OVERVIEW ─── */}
            {activeNav === "overview" && (
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

                {/* Stat Cards */}
                <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                  {statCards.map((card, i) => (
                    <motion.div
                      key={card.label}
                      variants={fadeInUp}
                      initial="hidden"
                      animate="visible"
                      custom={i}
                      className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-all group"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <span
                          className="p-2 rounded-xl"
                          style={{ background: `${card.color}20`, color: card.color }}
                        >
                          {card.icon}
                        </span>
                        <span
                          className="text-xs px-2 py-1 rounded-lg"
                          style={{ background: `${card.color}15`, color: `${card.color}cc` }}
                        >
                          +0%
                        </span>
                      </div>
                      <p className="text-3xl font-bold text-white mt-1">{card.value}</p>
                      <p className="text-white/50 text-sm mt-1">{card.label}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Breakdown + Recent */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Relationship Breakdown */}
                  <motion.div
                    variants={fadeInUp}
                    initial="hidden"
                    animate="visible"
                    custom={4}
                    className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-6"
                  >
                    <h2 className="text-white/80 font-bold mb-4 flex items-center gap-2">
                      <Filter size={16} />
                      ប្រភេទភ្ញៀវ
                    </h2>
                    <div className="space-y-3">
                      {stats.byRelationship.filter((r) => r.count > 0).map((rel) => {
                        const pct = stats.total > 0 ? (rel.count / stats.total) * 100 : 0;
                        return (
                          <div key={rel.key}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-white/60 text-sm">{rel.label}</span>
                              <span className="text-white/80 text-sm font-mono">{rel.count}</span>
                            </div>
                            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
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

                  {/* Quick Actions */}
                  <motion.div
                    variants={fadeInUp}
                    initial="hidden"
                    animate="visible"
                    custom={5}
                    className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-6"
                  >
                    <h2 className="text-white/80 font-bold mb-4 flex items-center gap-2">
                      <TrendingUp size={16} />
                      សកម្មភាពរហ័ស
                    </h2>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: "បន្ថែមភ្ញៀវ", nav: "add" as NavSection, icon: <UserPlus size={20} />, color: ADMIN_COLORS.accent },
                        { label: "នាំចូល CSV", nav: "import" as NavSection, icon: <UploadCloud size={20} />, color: "#a78bfa" },
                        { label: "បញ្ជីភ្ញៀវ", nav: "guests" as NavSection, icon: <Users size={20} />, color: "#34d399" },
                        { label: "មតិយោបល់", nav: "comments" as NavSection, icon: <MessageSquareText size={20} />, color: "#f59e0b" },
                      ].map((action) => (
                        <button
                          key={action.label}
                          onClick={() => setActiveNav(action.nav)}
                          className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all group"
                        >
                          <span
                            className="p-2 rounded-xl transition-transform group-hover:scale-110"
                            style={{ background: `${action.color}20`, color: action.color }}
                          >
                            {action.icon}
                          </span>
                          <span className="text-white/60 text-xs text-center">{action.label}</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                </div>

                {/* Recently added in session */}
                {addedGuests.length > 0 && (
                  <motion.div
                    variants={fadeInUp}
                    initial="hidden"
                    animate="visible"
                    custom={6}
                    className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-6"
                  >
                    <h2 className="text-white/80 font-bold mb-4 flex items-center gap-2">
                      <Clock size={16} />
                      បានបន្ថែមថ្ងៃនេះ ({addedGuests.length})
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {addedGuests.slice(-6).map((guest, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10"
                        >
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                            style={{
                              background: `linear-gradient(135deg, ${ADMIN_COLORS.accentSoft}66, ${ADMIN_COLORS.accent}55)`,
                            }}
                          >
                            {guest.khmerName.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-white/80 text-sm truncate">{guest.khmerName}</p>
                            <p className="text-white/40 text-xs truncate">{guest.englishName}</p>
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
                  className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-6"
                >
                  <h2 className="text-white/80 font-bold mb-4 flex items-center gap-2">
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
                        <div
                          key={comment.id}
                          className="rounded-xl border border-white/10 bg-white/5 p-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm text-white/80 font-medium">{comment.guestName}</p>
                              <p className="text-xs text-white/35">/{comment.guestSlug}</p>
                            </div>
                            <span className="text-xs text-white/30 whitespace-nowrap">
                              {formatTimestamp(comment.createdAt)}
                            </span>
                          </div>
                          <div className="mt-3 flex items-center gap-2">
                            <span
                              className="text-[11px] px-2 py-1 rounded-lg"
                              style={{
                                background: `${ADMIN_COLORS.accent}15`,
                                color: `${ADMIN_COLORS.accent}cc`,
                              }}
                            >
                              {COMMENT_STATUS_LABELS[comment.status]}
                            </span>
                          </div>
                          <p className="mt-3 text-sm text-white/65 line-clamp-3">{comment.comment}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              </motion.div>
            )}

            {/* ─── GUEST LIST ─── */}
            {activeNav === "guests" && (
              <motion.div
                key="guests"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                {loadError && (
                  <div className="rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                    {loadError}
                  </div>
                )}

                <div className="space-y-3 overflow-auto">
                  
                  <GuestSearchBar
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    filterRelationship={filterRelationship}
                    onFilterChange={setFilterRelationship}
                    relationshipLabels={RELATIONSHIP_LABELS}
                  />

                  {isLoadingGuests && (
                    <div className="text-sm text-white/40">កំពុងទាញយកទិន្នន័យភ្ញៀវ...</div>
                  )}

                  {!isLoadingGuests && (
                    <>
                      <div className="min-w-0">
                        <GuestListTable
                          guests={paginatedGuests}
                          copiedSlug={copiedSlug}
                          onCopyLink={handleCopyLink}
                          onRemoveGuest={handleGuestDelete}
                          deletingGuestSlug={deletingGuestSlug}
                          pageStartIndex={(guestPage - 1) * GUESTS_PER_PAGE}
                        />
                      </div>

                      {filteredGuests.length > 0 && (
                        <PaginationControls
                          currentPage={guestPage}
                          totalPages={totalGuestPages}
                          onPreviousPage={() => setGuestPage((prev) => Math.max(1, prev - 1))}
                          onNextPage={() => setGuestPage((prev) => Math.min(totalGuestPages, prev + 1))}
                          startIndex={(guestPage - 1) * GUESTS_PER_PAGE}
                          endIndex={(guestPage - 1) * GUESTS_PER_PAGE + paginatedGuests.length}
                          total={filteredGuests.length}
                          perPage={GUESTS_PER_PAGE}
                        />
                      )}

                      {filteredGuests.length === 0 && (
                        <div className="py-16 text-center text-white/30">
                          <Users size={32} className="mx-auto mb-3 opacity-30" />
                          <p>រកមិនឃើញភ្ញៀវ</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </motion.div>
            )}

            {activeNav === "comments" && (
              <motion.div
                key="comments"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {loadError && (
                  <div className="rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                    {loadError}
                  </div>
                )}

                <CommentsPanel
                  comments={comments}
                  isLoading={isLoadingComments}
                  statusFilter={commentStatusFilter}
                  onStatusFilterChange={(status) => setCommentStatusFilter(status as "all" | CommentStatus)}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  onStatusUpdate={handleCommentStatusUpdate}
                  onDeleteComment={handleCommentDelete}
                  updatingCommentId={updatingCommentId}
                  deletingCommentId={deletingCommentId}
                />
              </motion.div>
            )}

            {/* ─── ADD GUEST ─── */}
            {activeNav === "add" && (
              <motion.div
                key="add"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
              >
                <SingleGuestForm onGuestAdded={handleGuestAdded} />
              </motion.div>
            )}

            {/* ─── BULK IMPORT ─── */}
            {activeNav === "import" && (
              <motion.div
                key="import"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <BulkImportForm onImportComplete={handleImportComplete} />

                {/* CSV Format Reference */}
                <div
                  className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-6"
                  style={{ borderColor: `${ADMIN_COLORS.accent}25` }}
                >
                  <h3 className="text-white/70 font-bold mb-3 flex items-center gap-2">
                    <span>📋</span> ទម្រង់ CSV
                  </h3>
                  <code className="text-xs bg-black/40 p-4 rounded-xl block overflow-x-auto text-green-300/80 border border-white/10 leading-relaxed">
                    {`khmerName,englishName,title,relationship,status\nចាន់ ធីដា,Chan Thida,អ្នកនាង,friend,pending\nហៀង សុផុន,Heang Sophorn,ឯកឧត្តម,vip,pending`}
                  </code>
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[
                      { field: "khmerName", note: "ចាំបាច់", color: "#f87171" },
                      { field: "englishName", note: "ស្រេចចិត្ត", color: "#34d399" },
                      { field: "title", note: "ស្រេចចិត្ត", color: "#34d399" },
                      { field: "relationship", note: "ស្រេចចិត្ត", color: "#34d399" },
                      { field: "status", note: "ស្រេចចិត្ត", color: "#34d399" },
                    ].map((f) => (
                      <div key={f.field} className="flex items-center gap-2 text-xs">
                        <span className="font-mono text-white/60">{f.field}</span>
                        <span style={{ color: f.color }} className="opacity-70">{f.note}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
      </AnimatePresence>
      </div>
    </AdminShell>
  );
}
