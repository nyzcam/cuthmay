"use client";

import React from "react";
import { motion } from "framer-motion";
import { SettingsPanel } from "@/components/admin/SettingsPanel";
type SettingsSectionProps = React.ComponentProps<typeof SettingsPanel>;

export function SettingsSection({
  currentTheme,
  currentThemeName,
  availableThemes,
  onThemeChange,
  onResetTheme,
  onRefreshData,
  onResetFilters,
  onClearSearch,
  isLoadingGuests,
  isLoadingComments,
  searchQuery,
  filterRelationship,
  commentStatusFilter,
}: SettingsSectionProps) {
  return (
    <motion.div
      key="settings"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3 }}
    >
      <SettingsPanel
        currentTheme={currentTheme}
        currentThemeName={currentThemeName}
        availableThemes={availableThemes}
        onThemeChange={onThemeChange}
        onResetTheme={onResetTheme}
        onRefreshData={onRefreshData}
        onResetFilters={onResetFilters}
        onClearSearch={onClearSearch}
        isLoadingGuests={isLoadingGuests}
        isLoadingComments={isLoadingComments}
        searchQuery={searchQuery}
        filterRelationship={filterRelationship}
        commentStatusFilter={commentStatusFilter as "all" | "new" | "reviewed" | "archived"}
      />
    </motion.div>
  );
}
