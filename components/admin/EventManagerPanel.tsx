import React, { useMemo, useRef, useState } from "react";
import { CalendarPlus, ChevronDown, Pencil, Plus, Save, Trash2, XCircle } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Theme } from "@/config/themeConfig";
import { useAuthMe } from "@/hooks/useAuthMe";
import { type AdminUserRow } from "@/components/admin/AdminUsersPanel";

// ── Types ────────────────────────────────────────────────────────────────────

export interface AdminEvent {
  id: string;
  slug: string;
  displayName: string;
  groomName?: string | null;
  brideName?: string | null;
  groomFatherName?: string | null;
  groomMotherName?: string | null;
  brideFatherName?: string | null;
  brideMotherName?: string | null;
  weddingDate?: string | null;
  lunarDate?: string | null;
  locationText?: string | null;
  directionMapUrl?: string | null;
  directionsJson?: Array<{ id: number; description: string; detail: string }> | null;
  heroTitle?: string | null;
  heroSubtitle?: string | null;
  invitationText?: string | null;
  ownerUserId: string;
  theme?: string;
}

type EventPayload = {
  slug: string;
  displayName: string;
  groomName?: string;
  brideName?: string;
  groomFatherName?: string;
  groomMotherName?: string;
  brideFatherName?: string;
  brideMotherName?: string;
  weddingDate?: string;
  lunarDate?: string;
  locationText?: string;
  directionMapUrl?: string;
  directionsJson?: Array<{ id: number; detail: string }>;
  heroTitle?: string;
  heroSubtitle?: string;
  invitationText?: string;
  theme?: string;
  ownerUserId?: string;
  adminUserIds?: string[];
};

interface EventManagerPanelProps {
  events: AdminEvent[];
  selectedEventId: string | null;
  loading: boolean;
  saving: boolean;
  deletingEventId: string | null;
  error: string | null;
  themes: Theme[];
  assignableOwners?: AdminUserRow[];
  onSelectEvent: (eventId: string) => void;
  onCreateEvent: (payload: EventPayload) => Promise<void>;
  onUpdateEvent: (eventId: string, payload: EventPayload) => Promise<void>;
  onDeleteEvent: (eventId: string) => Promise<void>;
}

// ── Direction types ───────────────────────────────────────────────────────────

type DirectionEntry = {
  id: number;
  details: string[];
};

// ── FormState (directions split out) ─────────────────────────────────────────

type FormState = {
  slug: string;
  displayName: string;
  groomName: string;
  brideName: string;
  groomFatherName: string;
  groomMotherName: string;
  brideFatherName: string;
  brideMotherName: string;
  weddingDate: string;
  lunarDate: string;
  locationText: string;
  directionMapUrl: string;
  heroTitle: string;
  heroSubtitle: string;
  invitationText: string;
  theme: string;
  ownerUserId: string;
  adminUserIds: string;
};

const emptyForm: FormState = {
  slug: "",
  displayName: "",
  groomName: "",
  brideName: "",
  groomFatherName: "",
  groomMotherName: "",
  brideFatherName: "",
  brideMotherName: "",
  weddingDate: "",
  lunarDate: "",
  locationText: "",
  directionMapUrl: "",
  heroTitle: "",
  heroSubtitle: "",
  invitationText: "",
  theme: "default",
  ownerUserId: "",
  adminUserIds: "",
};

const emptyDirections: DirectionEntry[] = [];

// ── Helpers ───────────────────────────────────────────────────────────────────

function toDateInputValue(value: string | null | undefined): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function toIsoUtc(localDateTime: string): string | undefined {
  if (!localDateTime) return undefined;
  const date = new Date(localDateTime);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString();
}

function parseAdminUserIds(value: string): string[] | undefined {
  const ids = Array.from(new Set(value.split(",").map((s) => s.trim()).filter(Boolean)));
  return ids.length > 0 ? ids : undefined;
}

/** Convert DirectionEntry[] → the API shape */
function directionsToJson(
  dirs: DirectionEntry[]
): Array<{ id: number; detail: string }> | undefined {
  const result = dirs
    .map((d) => ({
      id: d.id,
      detail: d.details.filter(Boolean).join("\n"),
    }));
  return result.length > 0 ? result : undefined;
}

/** Convert API directionsJson → DirectionEntry[] */
function jsonToDirections(
  json: Array<{ id: number; detail: string }> | null | undefined
): DirectionEntry[] {
  if (!json || json.length === 0) return [];
  return json.map((d) => ({
    id: d.id,
    details: d.detail ? d.detail.split("\n") : [""],
  }));
}

function eventToForm(event: AdminEvent): FormState {
  return {
    slug: event.slug,
    displayName: event.displayName,
    groomName: event.groomName ?? "",
    brideName: event.brideName ?? "",
    groomFatherName: event.groomFatherName ?? "",
    groomMotherName: event.groomMotherName ?? "",
    brideFatherName: event.brideFatherName ?? "",
    brideMotherName: event.brideMotherName ?? "",
    weddingDate: toDateInputValue(event.weddingDate),
    lunarDate: event.lunarDate ?? "",
    locationText: event.locationText ?? "",
    directionMapUrl: event.directionMapUrl ?? "",
    heroTitle: event.heroTitle ?? "",
    heroSubtitle: event.heroSubtitle ?? "",
    invitationText: event.invitationText ?? "",
    theme: event.theme ?? "default",
    ownerUserId: event.ownerUserId ?? "",
    adminUserIds: "",
  };
}

function formToPayload(form: FormState, directions: DirectionEntry[]): EventPayload {
  return {
    slug: form.slug,
    displayName: form.displayName,
    groomName: form.groomName || undefined,
    brideName: form.brideName || undefined,
    groomFatherName: form.groomFatherName || undefined,
    groomMotherName: form.groomMotherName || undefined,
    brideFatherName: form.brideFatherName || undefined,
    brideMotherName: form.brideMotherName || undefined,
    weddingDate: toIsoUtc(form.weddingDate),
    lunarDate: form.lunarDate || undefined,
    locationText: form.locationText || undefined,
    directionMapUrl: form.directionMapUrl || undefined,
    directionsJson: directionsToJson(directions),
    heroTitle: form.heroTitle || undefined,
    heroSubtitle: form.heroSubtitle || undefined,
    invitationText: form.invitationText || undefined,
    theme: form.theme || undefined,
    ownerUserId: form.ownerUserId || undefined,
    adminUserIds: parseAdminUserIds(form.adminUserIds),
  };
}

// ── Shared styles ─────────────────────────────────────────────────────────────

const inputCls =
  "w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white " +
  "placeholder:text-white/25 outline-none focus:border-white/30 focus:bg-white/[0.07] transition-colors duration-150";

const textareaCls =
  "w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white " +
  "placeholder:text-white/25 outline-none focus:border-white/30 focus:bg-white/[0.07] " +
  "transition-colors duration-150 resize-y min-h-[80px]";

// ── Layout helpers ────────────────────────────────────────────────────────────

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-[10px] font-medium uppercase tracking-widest text-white/30 font-khmer">{label}</p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">{children}</div>
    </div>
  );
}

function FullWidth({ children }: { children: React.ReactNode }) {
  return <div className="sm:col-span-2">{children}</div>;
}

// ── Button ────────────────────────────────────────────────────────────────────

function Btn({
  type = "button",
  variant = "ghost",
  disabled,
  onClick,
  children,
}: {
  type?: "button" | "submit";
  variant?: "ghost" | "primary" | "danger";
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  const base =
    "inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium " +
    "transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed";
  const styles = {
    ghost: "border border-white/10 bg-white/[0.03] text-white/70 hover:bg-white/[0.07] hover:text-white",
    primary: "border border-white/15 bg-white/10 text-white hover:bg-white/[0.15]",
    danger: "border border-red-400/20 bg-red-500/10 text-red-300 hover:bg-red-500/20",
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${styles[variant]}`}>
      {children}
    </button>
  );
}

export function DirectionsSection({
  mapUrl,
  onMapUrl,
  directions,
  onDirections,
}: {
  mapUrl: string;
  onMapUrl: (v: string) => void;
  directions: any[];
  onDirections: (dirs: any[]) => void;
}) {
  const [enabled, setEnabled] = useState(directions.length > 0);
  const nextId = useRef(Math.max(0, ...directions.map((d) => d.id)) + 1);

  const toggle = (checked: boolean) => {
    setEnabled(checked);
    if (checked && directions.length === 0) {
      onDirections([{ id: nextId.current++, value: "" }]);
    }
    if (!checked) {
      onDirections([]);
    }
  };

  const addDir = () => {
    onDirections([...directions, { id: nextId.current++, value: "" }]);
  };

  const removeDir = (id: number) => {
    const next = directions.filter((d) => d.id !== id);
    onDirections(next);
    if (next.length === 0) setEnabled(false);
  };

  const updateDir = (id: number, value: string) => {
    onDirections(directions.map((d) => (d.id === id ? { ...d, value } : d)));
  };

  return (
    <Section label="ទិសដៅ">
      {/* Map URL */}
      <FullWidth>
        <input
          value={mapUrl}
          onChange={(e) => onMapUrl(e.target.value)}
          placeholder="Google Maps URL"
          className={inputCls}
        />
      </FullWidth>

      {/* Toggle */}
      <FullWidth>
        <label className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2.5 select-none transition-colors hover:bg-white/[0.06]">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => toggle(e.target.checked)}
            className="h-3.5 w-3.5 accent-white"
          />
          <span className="text-sm text-white/60">Direction footnote</span>
        </label>
      </FullWidth>

      {/* Footnote List */}
      {enabled && (
        <FullWidth>
          <div className="space-y-2">
            {directions.map((dir, i) => (
              <div key={dir.id} className="flex items-center gap-2">
                <input
                  value={dir.value || ""} // Using 'value' instead of 'details'
                  onChange={(e) => updateDir(dir.id, e.target.value)}
                  placeholder={`Footnote ${i + 1}`}
                  className={inputCls}
                />
                <button
                  type="button"
                  onClick={() => removeDir(dir.id)}
                  className="flex items-center p-0.5 text-white/25 transition-colors hover:text-red-400"
                  aria-label={`Remove footnote ${i + 1}`}
                >
                  <XCircle size={15} />
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={addDir}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-white/15 py-2 text-[12px] text-white/35 transition-colors hover:border-white/25 hover:text-white/60"
            >
              <Plus size={12} />
              Add footnote
            </button>
          </div>
        </FullWidth>
      )}
    </Section>
  );
}


interface EventFormFieldsProps {
  form: FormState;
  directions: DirectionEntry[];
  onChange: (field: keyof FormState, value: string) => void;
  onDirections: (dirs: DirectionEntry[]) => void;
  themes: Theme[];
  isSuperAdmin?: boolean;
}

function EventFormFields({
  form,
  directions,
  onChange,
  onDirections,
  themes,
  isSuperAdmin,
}: EventFormFieldsProps) {
  const f =
    (field: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      onChange(field, e.target.value);

  return (
    <div className="space-y-5">
      {/* Event */}
      <Section label="ព្រឹត្តិការណ៍">
        <input value={form.displayName} onChange={f("displayName")} placeholder="Display Name" className={inputCls} required />
        <input value={form.slug} onChange={f("slug")} placeholder="Slug" className={inputCls} required />
      </Section>

      {/* Couple */}
      <Section label="គូស្នេហ៍">
        <input value={form.groomName} onChange={f("groomName")} placeholder="Groom Name" className={inputCls} />
        <input value={form.brideName} onChange={f("brideName")} placeholder="Bride Name" className={inputCls} />
      </Section>

      {/* Date & Location */}
      <Section label="ពេលវេលា & ទីតាំង">
        <input type="datetime-local" value={form.weddingDate} onChange={f("weddingDate")} className={inputCls} />
        <input value={form.lunarDate} onChange={f("lunarDate")} placeholder="Lunar Date" className={inputCls} />
        <FullWidth>
          <input value={form.locationText} onChange={f("locationText")} placeholder="Location" className={inputCls} />
        </FullWidth>
      </Section>

      {/* Parents */}
      <Section label="ឪពុកម្ដាយ">
        <input value={form.groomFatherName} onChange={f("groomFatherName")} placeholder="Groom Father" className={inputCls} />
        <input value={form.groomMotherName} onChange={f("groomMotherName")} placeholder="Groom Mother" className={inputCls} />
        <input value={form.brideFatherName} onChange={f("brideFatherName")} placeholder="Bride Father" className={inputCls} />
        <input value={form.brideMotherName} onChange={f("brideMotherName")} placeholder="Bride Mother" className={inputCls} />
      </Section>

      {/* Directions — new UX */}
      <DirectionsSection
        mapUrl={form.directionMapUrl}
        onMapUrl={(v) => onChange("directionMapUrl", v)}
        directions={directions}
        onDirections={onDirections}
      />

      {/* Admin (super admin only) */}
      {isSuperAdmin && (
        <Section label="Admin">
          <div className="relative">
            <select value={form.theme} onChange={f("theme")} className={`${inputCls} appearance-none pr-8`}>
              <option value="" disabled>Select Theme</option>
              {themes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.id})
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-white/30" />
          </div>
        </Section>
      )}
    </div>
  );
}

// ── Main panel ────────────────────────────────────────────────────────────────

export function EventManagerPanel({
  events,
  selectedEventId,
  loading,
  saving,
  deletingEventId,
  error,
  themes,
  assignableOwners,
  onSelectEvent,
  onCreateEvent,
  onUpdateEvent,
  onDeleteEvent,
}: EventManagerPanelProps) {
  const { user } = useAuthMe();
  const isSuperAdmin = user?.role === "super_admin";

  const selectedEvent = useMemo(
    () => events.find((e) => e.id === selectedEventId) ?? null,
    [events, selectedEventId]
  );

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState<FormState>(emptyForm);
  const [createDirections, setCreateDirections] = useState<DirectionEntry[]>(emptyDirections);

  const [editForm, setEditForm] = useState<FormState>(emptyForm);
  const [editDirections, setEditDirections] = useState<DirectionEntry[]>(emptyDirections);

  React.useEffect(() => {
    if (selectedEvent) {
      setEditForm(eventToForm(selectedEvent));
      setEditDirections(jsonToDirections(selectedEvent.directionsJson));
    } else {
      setEditForm(emptyForm);
      setEditDirections(emptyDirections);
    }
  }, [selectedEvent]);

  const hasEvents = events.length > 0;

  return (
    <div className="space-y-4 font-khmer">
      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Event selector */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <select
            value={selectedEventId ?? ""}
            onChange={(e) => onSelectEvent(e.target.value)}
            disabled={loading || !hasEvents}
            className={`${inputCls} appearance-none pr-8`}
          >
            {!hasEvents && <option value="">មិនមានព្រឹត្តិការណ៍</option>}
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.displayName} ({event.slug})
              </option>
            ))}
          </select>
          <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-white/30" />
        </div>

        {isSuperAdmin && (
          <Btn onClick={() => setShowCreateForm((p) => !p)}>
            <CalendarPlus size={14} />
            {showCreateForm ? "Close" : "New"}
          </Btn>
        )}
      </div>

      {/* Create form */}
      <AnimatePresence>
        {isSuperAdmin && showCreateForm && (
          <motion.div
            key="create"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <form
              className="rounded-xl border border-white/10 bg-white/[0.03] p-5 space-y-5"
              onSubmit={async (e) => {
                e.preventDefault();
                await onCreateEvent(formToPayload(createForm, createDirections));
                setCreateForm(emptyForm);
                setCreateDirections(emptyDirections);
                setShowCreateForm(false);
              }}
            >
              <p className="text-[10px] font-medium uppercase tracking-widest text-white/30">
                បង្កើតព្រឹត្តិការណ៍ថ្មី
              </p>

              <EventFormFields
                form={createForm}
                directions={createDirections}
                onChange={(field, value) => setCreateForm((prev) => ({ ...prev, [field]: value }))}
                onDirections={setCreateDirections}
                themes={themes}
                isSuperAdmin={isSuperAdmin}
              />

              <div className="flex justify-end gap-2 pt-1">
                <Btn onClick={() => setShowCreateForm(false)}>
                  <XCircle size={13} /> Cancel
                </Btn>
                <Btn type="submit" variant="primary" disabled={saving}>
                  <Save size={13} /> {saving ? "Saving…" : "Create"}
                </Btn>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit form */}
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
        <div className="mb-5 flex items-center justify-between">
          <p className="text-[10px] font-medium uppercase tracking-widest text-white/30">
            {selectedEvent ? selectedEvent.displayName : "កែប្រែព្រឹត្តិការណ៍"}
          </p>
          {selectedEvent && (
            <Btn
              variant="danger"
              onClick={() => void onDeleteEvent(selectedEvent.id)}
              disabled={deletingEventId === selectedEvent.id || saving}
            >
              <Trash2 size={13} />
              {deletingEventId === selectedEvent.id ? "Deleting…" : "Delete"}
            </Btn>
          )}
        </div>

        {!selectedEvent ? (
          <p className="text-sm text-white/25">ជ្រើសរើសព្រឹត្តិការណ៍ដើម្បីកែប្រែ</p>
        ) : (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              await onUpdateEvent(selectedEvent.id, formToPayload(editForm, editDirections));
            }}
          >
            <EventFormFields
              form={editForm}
              directions={editDirections}
              onChange={(field, value) => setEditForm((prev) => ({ ...prev, [field]: value }))}
              onDirections={setEditDirections}
              themes={themes}
              isSuperAdmin={isSuperAdmin}
            />

            <div className="mt-5 flex justify-end">
              <Btn type="submit" variant="primary" disabled={saving}>
                <Pencil size={13} />
                {saving ? "Saving…" : "Update"}
              </Btn>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}