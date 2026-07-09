"use client";

import React from "react";
import { motion } from "framer-motion";
import { getAllThemes } from "@/config/themeConfig";
import { EventManagerPanel, type AdminEvent } from "@/components/admin/EventManagerPanel";
import { type AdminUserRow } from "@/components/admin/AdminUsersPanel";
import { EventAdminsPanel, type EventAdminAssignment } from "@/components/admin/EventAdminsPanel";

interface EventsSectionProps {
  isSuperAdmin: boolean;
  events: AdminEvent[];
  selectedEventId: string | null;
  selectedEventName?: string;
  isLoadingEvents: boolean;
  isSavingEvent: boolean;
  deletingEventId: string | null;
  loadError: string | null;
  adminUsers: AdminUserRow[];
  eventAdmins: EventAdminAssignment[];
  isLoadingEventAdmins: boolean;
  isAddingEventAdmin: boolean;
  removingEventAdminUserId: string | null;
  eventAdminsError: string | null;
  onSelectEvent: (eventId: string) => void;
  onCreateEvent: React.ComponentProps<typeof EventManagerPanel>["onCreateEvent"];
  onUpdateEvent: React.ComponentProps<typeof EventManagerPanel>["onUpdateEvent"];
  onDeleteEvent: React.ComponentProps<typeof EventManagerPanel>["onDeleteEvent"];
  onRefreshEventAdmins: () => void;
  onAddEventAdmin: (payload: { userId: string; role: "admin" | "owner" }) => Promise<void>;
  onRemoveEventAdmin: (userId: string) => Promise<void>;
}

export function EventsSection({
  isSuperAdmin,
  events,
  selectedEventId,
  selectedEventName,
  isLoadingEvents,
  isSavingEvent,
  deletingEventId,
  loadError,
  adminUsers,
  eventAdmins,
  isLoadingEventAdmins,
  isAddingEventAdmin,
  removingEventAdminUserId,
  eventAdminsError,
  onSelectEvent,
  onCreateEvent,
  onUpdateEvent,
  onDeleteEvent,
  onRefreshEventAdmins,
  onAddEventAdmin,
  onRemoveEventAdmin,
}: EventsSectionProps) {
  return (
    <motion.div
      key="events"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <EventManagerPanel
        events={events}
        selectedEventId={selectedEventId}
        loading={isLoadingEvents}
        saving={isSavingEvent}
        deletingEventId={deletingEventId}
        error={loadError}
        themes={getAllThemes()}
        assignableOwners={adminUsers}
        onSelectEvent={onSelectEvent}
        onCreateEvent={onCreateEvent}
        onUpdateEvent={onUpdateEvent}
        onDeleteEvent={onDeleteEvent}
      />
      {isSuperAdmin && (
        <EventAdminsPanel
          eventId={selectedEventId}
          eventLabel={selectedEventName}
          admins={eventAdmins}
          adminUsers={adminUsers}
          isLoading={isLoadingEventAdmins}
          isAdding={isAddingEventAdmin}
          removingUserId={removingEventAdminUserId}
          error={eventAdminsError}
          onRefresh={onRefreshEventAdmins}
          onAddAdmin={onAddEventAdmin}
          onRemoveAdmin={onRemoveEventAdmin}
        />
      )}
    </motion.div>
  );
}
