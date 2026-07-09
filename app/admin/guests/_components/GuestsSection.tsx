"use client";

import React from "react";
import { motion } from "framer-motion";
import { Users } from "lucide-react";
import { GuestRecord } from "@/app/admin/guests/_constants/dashboard";
import { GuestListTable } from "@/components/admin/GuestListTable";
import { GuestSearchBar } from "@/components/admin/GuestSearchBar";
import { PaginationControls } from "@/components/admin/PaginationControls";

interface GuestsSectionProps {
  loadError: string | null;
  selectedEventId: string | null;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filterRelationship: string;
  onFilterRelationshipChange: (value: string) => void;
  relationshipLabels: Record<string, string>;
  isLoadingGuests: boolean;
  paginatedGuests: GuestRecord[];
  copiedSlug: string | null;
  onCopyLink: (slug: string) => void;
  onRemoveGuest: (slug: string) => void;
  deletingGuestSlug: string | null;
  guestPage: number;
  guestsPerPage: number;
  eventSlug: string;
  filteredGuestsCount: number;
  totalGuestPages: number;
  onPreviousPage: () => void;
  onNextPage: () => void;
}

export function GuestsSection({
  loadError,
  selectedEventId,
  searchQuery,
  onSearchChange,
  filterRelationship,
  onFilterRelationshipChange,
  relationshipLabels,
  isLoadingGuests,
  paginatedGuests,
  copiedSlug,
  onCopyLink,
  onRemoveGuest,
  deletingGuestSlug,
  guestPage,
  guestsPerPage,
  eventSlug,
  filteredGuestsCount,
  totalGuestPages,
  onPreviousPage,
  onNextPage,
}: GuestsSectionProps) {
  return (
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
        {!selectedEventId && (
          <div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
            Select an event in the Events tab before managing guests.
          </div>
        )}

        <GuestSearchBar
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          filterRelationship={filterRelationship}
          onFilterChange={onFilterRelationshipChange}
          relationshipLabels={relationshipLabels}
        />

        {isLoadingGuests && <div className="text-sm text-white/40">កំពុងទាញយកទិន្នន័យភ្ញៀវ...</div>}

        {!isLoadingGuests && (
          <>
            <div className="min-w-0">
              <GuestListTable
                guests={paginatedGuests}
                copiedSlug={copiedSlug}
                onCopyLink={onCopyLink}
                onRemoveGuest={onRemoveGuest}
                deletingGuestSlug={deletingGuestSlug}
                pageStartIndex={(guestPage - 1) * guestsPerPage}
                eventSlug={eventSlug}
              />
            </div>

            {filteredGuestsCount > 0 && (
              <PaginationControls
                currentPage={guestPage}
                totalPages={totalGuestPages}
                onPreviousPage={onPreviousPage}
                onNextPage={onNextPage}
                startIndex={(guestPage - 1) * guestsPerPage}
                endIndex={(guestPage - 1) * guestsPerPage + paginatedGuests.length}
                total={filteredGuestsCount}
                perPage={guestsPerPage}
              />
            )}

            {filteredGuestsCount === 0 && (
              <div className="py-16 text-center text-white/30">
                <Users size={32} className="mx-auto mb-3 opacity-30" />
                <p>រកមិនឃើញភ្ញៀវ</p>
              </div>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}
