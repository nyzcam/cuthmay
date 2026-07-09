"use client";

import React from "react";
import {
  Users,
  UserPlus,
  UploadCloud,
  LayoutDashboard,
  MessageSquareText,
  TrendingUp,
  CalendarDays,
  Star,
  Settings,
} from "lucide-react";
import { AnimatePresence, useReducedMotion, type Variants } from "framer-motion";
import AdminShell, { ADMIN_COLORS } from "@/components/admin/AdminShell";
import { type NavSection } from "@/app/admin/guests/_constants";
import {
  AddGuestSection,
  AdminUsersSection,
  CommentsSection,
  EventsSection,
  GuestsSection,
  ImportSection,
  OverviewSection,
  SettingsSection,
} from "@/app/admin/guests/_components";
import { useGuestManagementController } from "@/app/admin/guests/_hooks";

export default function GuestManagementPage() {
  const {
    activeContentRef,
    activeNav,
    setActiveNav,
    user,
    isSuperAdmin,
    currentTheme,
    currentThemeName,
    getAllAvailableThemes,
    setTheme,
    resetTheme,
    events,
    comments,
    adminUsers,
    addedGuests,
    isLoggingOut,
    isLoadingGuests,
    isLoadingComments,
    isLoadingEvents,
    isSavingEvent,
    eventAdmins,
    isLoadingEventAdmins,
    isAddingEventAdmin,
    removingEventAdminUserId,
    eventAdminsError,
    isLoadingAdminUsers,
    isCreatingAdminUser,
    updatingCommentId,
    savingAdminUserId,
    deletingAdminUserId,
    deletingEventId,
    deletingCommentId,
    deletingGuestSlug,
    loadError,
    searchQuery,
    setSearchQuery,
    filterRelationship,
    setFilterRelationship,
    commentStatusFilter,
    setCommentStatusFilter,
    guestPage,
    setGuestPage,
    copiedSlug,
    selectedEventId,
    setSelectedEventId,
    filteredGuests,
    selectedEvent,
    selectedEventSlug,
    totalGuestPages,
    paginatedGuests,
    stats,
    recentComments,
    handleGuestAdded,
    handleImportComplete,
    handleLogout,
    handleCopyLink,
    handleCommentStatusUpdate,
    handleCommentDelete,
    handleGuestDelete,
    refreshGuestData,
    handleCreateEvent,
    handleUpdateEvent,
    handleDeleteEvent,
    loadEventAdmins,
    handleAddEventAdmin,
    handleRemoveEventAdmin,
    refreshAdminUsers,
    handleAdminUserRoleUpdate,
    handleCreateAdminUser,
    handleDeleteAdminUser,
    relationshipLabels,
    guestsPerPage,
  } = useGuestManagementController();

  const shouldReduceMotion = useReducedMotion();

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

  const navItems: { id: NavSection; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: "overview", label: "ទិដ្ឋភាពរួម", icon: <LayoutDashboard size={18} /> },
    { id: "events", label: "កម្មពិធី", icon: <CalendarDays size={18} />, badge: events.length },
    { id: "guests", label: "បញ្ជីភ្ញៀវ", icon: <Users size={18} />, badge: stats.total },
    { id: "comments", label: "មតិយោបល់", icon: <MessageSquareText size={18} />, badge: stats.totalComments },
    { id: "add", label: "បន្ថែមភ្ញៀវ", icon: <UserPlus size={18} /> },
    { id: "import", label: "នាំចូលច្រើន", icon: <UploadCloud size={18} /> },
    ...(isSuperAdmin
      ? [{ id: "settings" as const, label: "ការកំណត់", icon: <Settings size={18} /> }]
      : []),
    ...(isSuperAdmin
      ? [{ id: "adminUsers" as const, label: "Admin users", icon: <UserPlus size={18} /> }]
      : []),
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
       inviteHref={selectedEvent ? `/${selectedEvent.slug}` : "/"}
       headerTitle={selectedEvent ? `${selectedEvent.displayName} · ${navItems.find((item) => item.id === activeNav)?.label ?? "Admin"}` : undefined}
       user={user ? { name: user.name, email: user.email, role: user.role, __isImpersonated: user.__isImpersonated } : null}
     >
        <div ref={activeContentRef} className="hide-scrollbar h-full min-h-0 overflow-y-auto pr-1">
      {/* ─── IMPERSONATION BANNER ─── */}
      {user?.__isImpersonated && (
        <div className="mb-4 flex items-center justify-between rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
          <span>
            កំពុង Login ជា <strong>{user.name}</strong> ({user.email})
          </span>
          <button
            onClick={async () => {
              await fetch("/api/admin/impersonate", { method: "DELETE" });
              window.location.reload();
            }}
            className="ml-4 rounded bg-amber-500/20 px-3 py-1 text-amber-200 hover:bg-amber-500/30 transition-colors"
          >
            បញ្ឈប់ Impersonation
          </button>
        </div>
      )}
      <AnimatePresence mode="wait">
            {activeNav === "overview" && (
              <OverviewSection
                loadError={loadError}
                statCards={statCards}
                fadeInUp={fadeInUp}
                statsTotal={stats.total}
                byRelationship={stats.byRelationship}
                addedGuests={addedGuests}
                recentComments={recentComments}
                isLoadingComments={isLoadingComments}
                onNavigate={setActiveNav}
              />
            )}

            {activeNav === "events" && (
              <EventsSection
                isSuperAdmin={isSuperAdmin}
                events={events}
                selectedEventId={selectedEventId}
                selectedEventName={selectedEvent?.displayName}
                isLoadingEvents={isLoadingEvents}
                isSavingEvent={isSavingEvent}
                deletingEventId={deletingEventId}
                loadError={loadError}
                adminUsers={adminUsers}
                eventAdmins={eventAdmins}
                isLoadingEventAdmins={isLoadingEventAdmins}
                isAddingEventAdmin={isAddingEventAdmin}
                removingEventAdminUserId={removingEventAdminUserId}
                eventAdminsError={eventAdminsError}
                onSelectEvent={setSelectedEventId}
                onCreateEvent={handleCreateEvent}
                onUpdateEvent={handleUpdateEvent}
                onDeleteEvent={handleDeleteEvent}
                onRefreshEventAdmins={() => void loadEventAdmins()}
                onAddEventAdmin={handleAddEventAdmin}
                onRemoveEventAdmin={handleRemoveEventAdmin}
              />
            )}

            {activeNav === "guests" && (
              <GuestsSection
                loadError={loadError}
                selectedEventId={selectedEventId}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                filterRelationship={filterRelationship}
                onFilterRelationshipChange={setFilterRelationship}
                relationshipLabels={relationshipLabels}
                isLoadingGuests={isLoadingGuests}
                paginatedGuests={paginatedGuests}
                copiedSlug={copiedSlug}
                onCopyLink={handleCopyLink}
                onRemoveGuest={handleGuestDelete}
                deletingGuestSlug={deletingGuestSlug}
                guestPage={guestPage}
                guestsPerPage={guestsPerPage}
                eventSlug={selectedEventSlug}
                filteredGuestsCount={filteredGuests.length}
                totalGuestPages={totalGuestPages}
                onPreviousPage={() => setGuestPage((prev) => Math.max(1, prev - 1))}
                onNextPage={() => setGuestPage((prev) => Math.min(totalGuestPages, prev + 1))}
              />
            )}

            {activeNav === "comments" && (
              <CommentsSection
                loadError={loadError}
                comments={comments}
                isLoadingComments={isLoadingComments}
                commentStatusFilter={commentStatusFilter}
                onCommentStatusFilterChange={setCommentStatusFilter}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onCommentStatusUpdate={handleCommentStatusUpdate}
                onDeleteComment={handleCommentDelete}
                updatingCommentId={updatingCommentId}
                deletingCommentId={deletingCommentId}
              />
            )}

            {activeNav === "add" && (
              <AddGuestSection selectedEventId={selectedEventId} onGuestAdded={handleGuestAdded} />
            )}

            {activeNav === "import" && (
              <ImportSection selectedEventId={selectedEventId} onImportComplete={handleImportComplete} />
            )}

            {activeNav === "settings" && isSuperAdmin && (
              <SettingsSection
                currentTheme={currentTheme}
                currentThemeName={currentThemeName}
                availableThemes={getAllAvailableThemes()}
                onThemeChange={setTheme}
                onResetTheme={resetTheme}
                onRefreshData={refreshGuestData}
                onResetFilters={() => {
                  setSearchQuery("");
                  setFilterRelationship("all");
                  setCommentStatusFilter("all");
                }}
                onClearSearch={() => setSearchQuery("")}
                isLoadingGuests={isLoadingGuests}
                isLoadingComments={isLoadingComments}
                searchQuery={searchQuery}
                filterRelationship={filterRelationship}
                commentStatusFilter={commentStatusFilter}
              />
            )}

            {activeNav === "adminUsers" && isSuperAdmin && user && (
              <AdminUsersSection
                currentUserId={user.id}
                isSuperAdmin={isSuperAdmin}
                adminUsers={adminUsers}
                isLoadingAdminUsers={isLoadingAdminUsers}
                savingAdminUserId={savingAdminUserId}
                deletingAdminUserId={deletingAdminUserId}
                isCreatingAdminUser={isCreatingAdminUser}
                loadError={loadError}
                onRefresh={refreshAdminUsers}
                onUpdateRole={handleAdminUserRoleUpdate}
                onCreateUser={handleCreateAdminUser}
                onDeleteUser={handleDeleteAdminUser}
              />
            )}
      </AnimatePresence>
      </div>
    </AdminShell>
  );
}
