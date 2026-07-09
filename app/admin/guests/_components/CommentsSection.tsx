"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  CommentsPanel,
  type CommentStatusFilter,
} from "@/components/admin/CommentsPanel";
import { type GuestCommentRecord } from "@/types/types";

interface CommentsSectionProps {
  loadError: string | null;
  comments: React.ComponentProps<typeof CommentsPanel>["comments"];
  isLoadingComments: React.ComponentProps<typeof CommentsPanel>["isLoading"];
  commentStatusFilter: CommentStatusFilter;
  onCommentStatusFilterChange: (status: CommentStatusFilter) => void;
  searchQuery: React.ComponentProps<typeof CommentsPanel>["searchQuery"];
  onSearchChange: React.ComponentProps<typeof CommentsPanel>["onSearchChange"];
  onCommentStatusUpdate: React.ComponentProps<typeof CommentsPanel>["onStatusUpdate"];
  onDeleteComment: React.ComponentProps<typeof CommentsPanel>["onDeleteComment"];
  updatingCommentId: React.ComponentProps<typeof CommentsPanel>["updatingCommentId"];
  deletingCommentId: React.ComponentProps<typeof CommentsPanel>["deletingCommentId"];
}

export function CommentsSection({
  loadError,
  comments,
  isLoadingComments,
  commentStatusFilter,
  onCommentStatusFilterChange,
  searchQuery,
  onSearchChange,
  onCommentStatusUpdate,
  onDeleteComment,
  updatingCommentId,
  deletingCommentId,
}: CommentsSectionProps) {
  return (
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
        onStatusFilterChange={onCommentStatusFilterChange}
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        onStatusUpdate={onCommentStatusUpdate}
        onDeleteComment={onDeleteComment}
        updatingCommentId={updatingCommentId}
        deletingCommentId={deletingCommentId}
      />
    </motion.div>
  );
}
