"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useReducedMotion } from "framer-motion";
import { Guest } from "@/data/guestList";
import { GuestCommentRecord } from "@/types/types";
import { EventManagerPanel, type AdminEvent } from "@/components/admin/EventManagerPanel";
import { AdminUsersPanel, type AdminRole, type AdminUserRow } from "@/components/admin/AdminUsersPanel";
import { EventAdminsPanel, type EventAdminAssignment } from "@/components/admin/EventAdminsPanel";
import { useAuthMe } from "@/hooks/useAuthMe";
import { useTheme } from "@/providers/ThemeContext";
import {
  COMMENT_STATUS_LABELS,
  GUESTS_PER_PAGE,
  MAX_RECENT_GUESTS,
  RELATIONSHIP_LABELS,
  type CommentStatus,
  type GuestRecord,
  type NavSection,
} from "@/app/admin/guests/_constants/dashboard";

type EventCreatePayload = Parameters<
  React.ComponentProps<typeof EventManagerPanel>["onCreateEvent"]
>[0];

type EventUpdatePayload = Parameters<
  React.ComponentProps<typeof EventManagerPanel>["onUpdateEvent"]
>[1];

export function useGuestManagementController() {
  const router = useRouter();
  const { user } = useAuthMe();
  const isSuperAdmin = user?.role === "super_admin";
  const { currentTheme, currentThemeName, getAllAvailableThemes, setTheme, resetTheme } = useTheme();
  const shouldReduceMotion = useReducedMotion();

  const activeContentRef = useRef<HTMLDivElement | null>(null);

  const [activeNav, setActiveNav] = useState<NavSection>("overview");
  const [dbGuests, setDbGuests] = useState<GuestRecord[]>([]);
  const [comments, setComments] = useState<GuestCommentRecord[]>([]);
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [adminUsers, setAdminUsers] = useState<AdminUserRow[]>([]);
  const [addedGuests, setAddedGuests] = useState<Guest[]>([]);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isLoadingGuests, setIsLoadingGuests] = useState(true);
  const [isLoadingComments, setIsLoadingComments] = useState(true);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [isSavingEvent, setIsSavingEvent] = useState(false);
  const [eventAdmins, setEventAdmins] = useState<EventAdminAssignment[]>([]);
  const [isLoadingEventAdmins, setIsLoadingEventAdmins] = useState(false);
  const [isAddingEventAdmin, setIsAddingEventAdmin] = useState(false);
  const [removingEventAdminUserId, setRemovingEventAdminUserId] = useState<string | null>(null);
  const [eventAdminsError, setEventAdminsError] = useState<string | null>(null);
  const [isLoadingAdminUsers, setIsLoadingAdminUsers] = useState(false);
  const [isCreatingAdminUser, setIsCreatingAdminUser] = useState(false);
  const [updatingCommentId, setUpdatingCommentId] = useState<string | null>(null);
  const [savingAdminUserId, setSavingAdminUserId] = useState<string | null>(null);
  const [deletingAdminUserId, setDeletingAdminUserId] = useState<string | null>(null);
  const [deletingEventId, setDeletingEventId] = useState<string | null>(null);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);
  const [deletingGuestSlug, setDeletingGuestSlug] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRelationship, setFilterRelationship] = useState("all");
  const [commentStatusFilter, setCommentStatusFilter] = useState<"all" | CommentStatus>("all");
  const [guestPage, setGuestPage] = useState(1);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const loadEvents = useCallback(async () => {
    setIsLoadingEvents(true);
    setLoadError(null);

    try {
      const response = await fetch("/api/admin/events", {
        headers: { Accept: "application/json" },
        cache: "no-store",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load events");
      }

      const nextEvents = Array.isArray(data.events) ? data.events : [];
      setEvents(nextEvents);
      setSelectedEventId((current) => {
        if (current && nextEvents.some((event: AdminEvent) => event.id === current)) {
          return current;
        }
        return nextEvents[0]?.id ?? null;
      });
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Failed to load events");
      setEvents([]);
      setSelectedEventId(null);
    } finally {
      setIsLoadingEvents(false);
    }
  }, []);

  const loadGuests = useCallback(async () => {
    if (!selectedEventId) {
      setDbGuests([]);
      setIsLoadingGuests(false);
      return;
    }

    setIsLoadingGuests(true);
    setLoadError(null);
    try {
      const response = await fetch(`/api/guests?eventId=${encodeURIComponent(selectedEventId)}`, {
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
  }, [selectedEventId]);

  const loadAdminUsers = useCallback(async () => {
    if (user?.role !== "super_admin") {
      setAdminUsers([]);
      return;
    }

    setIsLoadingAdminUsers(true);
    setLoadError(null);

    try {
      const response = await fetch("/api/admin/users", {
        headers: { Accept: "application/json" },
        cache: "no-store",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load admin users");
      }

      setAdminUsers(Array.isArray(data.users) ? data.users : []);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Failed to load admin users");
      setAdminUsers([]);
    } finally {
      setIsLoadingAdminUsers(false);
    }
  }, [user?.role]);

  const loadComments = useCallback(async () => {
    if (!selectedEventId) {
      setComments([]);
      setIsLoadingComments(false);
      return;
    }

    setIsLoadingComments(true);
    try {
      const response = await fetch(`/api/guests/comment?eventId=${encodeURIComponent(selectedEventId)}`, {
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
  }, [selectedEventId]);

  const loadEventAdmins = useCallback(async () => {
    if (!isSuperAdmin || !selectedEventId) {
      setEventAdmins([]);
      setEventAdminsError(null);
      return;
    }

    setIsLoadingEventAdmins(true);
    setEventAdminsError(null);
    try {
      const response = await fetch(`/api/admin/events/${encodeURIComponent(selectedEventId)}/admins`, {
        headers: { Accept: "application/json" },
        cache: "no-store",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load event admins");
      }

      setEventAdmins(Array.isArray(data.admins) ? data.admins : []);
    } catch (error) {
      setEventAdminsError(error instanceof Error ? error.message : "Failed to load event admins");
      setEventAdmins([]);
    } finally {
      setIsLoadingEventAdmins(false);
    }
  }, [isSuperAdmin, selectedEventId]);

  useEffect(() => {
    void loadEvents();
  }, [loadEvents]);

  useEffect(() => {
    void loadGuests();
    void loadComments();
  }, [loadGuests, loadComments]);

  useEffect(() => {
    if (!isSuperAdmin && (activeNav === "adminUsers" || activeNav === "settings")) {
      setActiveNav("overview");
    }
  }, [activeNav, isSuperAdmin]);

  useEffect(() => {
    if (isSuperAdmin && (activeNav === "adminUsers" || activeNav === "events")) {
      void loadAdminUsers();
    }
  }, [activeNav, loadAdminUsers, isSuperAdmin]);

  useEffect(() => {
    if (activeNav === "events") {
      void loadEventAdmins();
    }
  }, [activeNav, loadEventAdmins]);

  useEffect(() => {
    setGuestPage(1);
  }, [searchQuery, filterRelationship]);

  useEffect(() => {
    activeContentRef.current?.scrollTo({
      top: 0,
      behavior: shouldReduceMotion ? "auto" : "smooth",
    });
  }, [activeNav, shouldReduceMotion]);

  const allGuests = useMemo(() => {
    const dynamicEntries = addedGuests.map((guest, index) => ({
      slug: `new-${index}`,
      ...guest,
    }));
    return [...dynamicEntries.reverse(), ...dbGuests];
  }, [dbGuests, addedGuests]);

  const filteredGuests = useMemo(() => {
    return allGuests.filter((guest) => {
      const matchSearch =
        searchQuery === "" ||
        guest.khmerName.includes(searchQuery) ||
        (guest.englishName ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        guest.slug.toLowerCase().includes(searchQuery.toLowerCase());
      const matchFilter = filterRelationship === "all" || guest.relationship === filterRelationship;
      return matchSearch && matchFilter;
    });
  }, [allGuests, searchQuery, filterRelationship]);

  const selectedEvent = useMemo(
    () => events.find((event) => event.id === selectedEventId) ?? null,
    [events, selectedEventId]
  );

  const selectedEventSlug = selectedEvent?.slug ?? "default";

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
    const vip = allGuests.filter((guest) => guest.relationship === "vip").length;
    const family = allGuests.filter(
      (guest) => guest.relationship === "family" || guest.relationship === "immediate-family"
    ).length;
    const session = addedGuests.length;
    const totalComments = comments.length;
    const byRelationship = Object.entries(RELATIONSHIP_LABELS).map(([key, label]) => ({
      key,
      label,
      count: allGuests.filter((guest) => guest.relationship === key).length,
    }));
    return { total, vip, family, session, totalComments, byRelationship };
  }, [allGuests, addedGuests.length, comments.length]);

  const recentComments = useMemo(() => comments.slice(0, 6), [comments]);

  const handleGuestAdded = useCallback(
    (guest: Guest) => {
      setAddedGuests((prev) => {
        const next = [...prev, guest];
        return next.length > MAX_RECENT_GUESTS
          ? next.slice(next.length - MAX_RECENT_GUESTS)
          : next;
      });
      void loadGuests();
    },
    [loadGuests]
  );

  const handleImportComplete = useCallback(
    (_count: number) => {
      void loadGuests();
    },
    [loadGuests]
  );

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/");
    } catch {
      setIsLoggingOut(false);
    }
  };

  const handleCopyLink = useCallback(
    async (slug: string) => {
      const url = `${window.location.origin}/${selectedEventSlug}/${slug}`;
      await navigator.clipboard.writeText(url);
      setCopiedSlug(slug);
      setTimeout(() => setCopiedSlug(null), 2000);
    },
    [selectedEventSlug]
  );

  const handleCommentStatusUpdate = useCallback(
    async (id: string, status: CommentStatus) => {
      if (!selectedEventId) {
        return;
      }

      setUpdatingCommentId(id);
      setLoadError(null);

      try {
        const response = await fetch("/api/guests/comment", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id, status, eventId: selectedEventId }),
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
    },
    [selectedEventId]
  );

  const handleCommentDelete = useCallback(
    async (id: string) => {
      if (!selectedEventId) {
        return;
      }

      const confirmed = window.confirm("តើអ្នកប្រាកដថាចង់លុបមតិយោបល់នេះមែនទេ?");
      if (!confirmed) {
        return;
      }

      setDeletingCommentId(id);
      setLoadError(null);

      try {
        const response = await fetch(
          `/api/guests/comment?id=${encodeURIComponent(id)}&eventId=${encodeURIComponent(selectedEventId)}`,
          {
            method: "DELETE",
          }
        );

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
    },
    [selectedEventId]
  );

  const handleGuestDelete = useCallback(
    async (slug: string) => {
      if (!selectedEventId) {
        return;
      }

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
        const response = await fetch(
          `/api/guests?slug=${encodeURIComponent(slug)}&eventId=${encodeURIComponent(selectedEventId)}`,
          {
            method: "DELETE",
          }
        );

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
    },
    [selectedEventId]
  );

  const refreshGuestData = useCallback(() => {
    void loadEvents();
    void loadGuests();
    void loadComments();
  }, [loadComments, loadEvents, loadGuests]);

  const handleCreateEvent = useCallback(async (payload: EventCreatePayload) => {
    setIsSavingEvent(true);
    setLoadError(null);

    try {
      const response = await fetch("/api/admin/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to create event");
      }

      const created = data.event as AdminEvent;
      setEvents((prev) => [created, ...prev]);
      setSelectedEventId(created.id);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Failed to create event");
    } finally {
      setIsSavingEvent(false);
    }
  }, []);

  const handleUpdateEvent = useCallback(async (eventId: string, payload: EventUpdatePayload) => {
    setIsSavingEvent(true);
    setLoadError(null);

    try {
      const response = await fetch(`/api/admin/events/${encodeURIComponent(eventId)}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to update event");
      }

      const updated = data.event as AdminEvent;
      setEvents((prev) => prev.map((event) => (event.id === updated.id ? updated : event)));
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Failed to update event");
    } finally {
      setIsSavingEvent(false);
    }
  }, []);

  const handleDeleteEvent = useCallback(async (eventId: string) => {
    const confirmed = window.confirm("Delete this event and all related guests/comments?");
    if (!confirmed) {
      return;
    }

    setDeletingEventId(eventId);
    setLoadError(null);

    try {
      const response = await fetch(`/api/admin/events/${encodeURIComponent(eventId)}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to delete event");
      }

      setEvents((prev) => {
        const next = prev.filter((event) => event.id !== eventId);
        setSelectedEventId(next[0]?.id ?? null);
        return next;
      });
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Failed to delete event");
    } finally {
      setDeletingEventId(null);
    }
  }, []);

  const handleAddEventAdmin = useCallback(
    async (payload: { userId: string; role: "admin" | "owner" }) => {
      if (!selectedEventId) {
        return;
      }

      setIsAddingEventAdmin(true);
      setEventAdminsError(null);
      try {
        const response = await fetch(`/api/admin/events/${encodeURIComponent(selectedEventId)}/admins`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to add event admin");
        }

        const created = data.admin as EventAdminAssignment;
        setEventAdmins((prev) => [...prev, created]);
      } catch (error) {
        setEventAdminsError(error instanceof Error ? error.message : "Failed to add event admin");
      } finally {
        setIsAddingEventAdmin(false);
      }
    },
    [selectedEventId]
  );

  const handleRemoveEventAdmin = useCallback(
    async (userId: string) => {
      if (!selectedEventId) {
        return;
      }

      const confirmed = window.confirm("Remove this admin from the selected event?");
      if (!confirmed) {
        return;
      }

      setRemovingEventAdminUserId(userId);
      setEventAdminsError(null);
      try {
        const response = await fetch(
          `/api/admin/events/${encodeURIComponent(selectedEventId)}/admins/${encodeURIComponent(userId)}`,
          {
            method: "DELETE",
          }
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to remove event admin");
        }

        setEventAdmins((prev) => prev.filter((admin) => admin.userId !== userId));
      } catch (error) {
        setEventAdminsError(error instanceof Error ? error.message : "Failed to remove event admin");
      } finally {
        setRemovingEventAdminUserId(null);
      }
    },
    [selectedEventId]
  );

  const refreshAdminUsers = useCallback(() => {
    void loadAdminUsers();
  }, [loadAdminUsers]);

  const handleAdminUserRoleUpdate = useCallback(async (id: string, role: AdminRole) => {
    setSavingAdminUserId(id);
    setLoadError(null);

    try {
      const response = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update user role");
      }

      setAdminUsers((prev) => prev.map((userRow) => (userRow.id === id ? data.user : userRow)));
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Failed to update user role");
    } finally {
      setSavingAdminUserId(null);
    }
  }, []);

  const handleCreateAdminUser = useCallback(async (payload: {
    name: string;
    email: string;
    password: string;
    role: AdminRole;
  }) => {
    setIsCreatingAdminUser(true);
    setLoadError(null);

    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create user");
      }

      setAdminUsers((prev) => [data.user, ...prev]);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Failed to create user");
    } finally {
      setIsCreatingAdminUser(false);
    }
  }, []);

  const handleDeleteAdminUser = useCallback(async (id: string) => {
    const confirmed = window.confirm("តើអ្នកប្រាកដថាចង់លុបអ្នកប្រើនេះមែនទេ?");
    if (!confirmed) {
      return;
    }

    setDeletingAdminUserId(id);
    setLoadError(null);

    try {
      const response = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete user");
      }

      setAdminUsers((prev) => prev.filter((userRow) => userRow.id !== id));
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Failed to delete user");
    } finally {
      setDeletingAdminUserId(null);
    }
  }, []);

  return {
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
    relationshipLabels: RELATIONSHIP_LABELS,
    commentStatusLabels: COMMENT_STATUS_LABELS,
    guestsPerPage: GUESTS_PER_PAGE,
  };
}
