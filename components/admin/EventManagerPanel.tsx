import React, { useMemo, useState } from "react";
import { CalendarPlus, Pencil, Save, Trash2, XCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Theme } from "@/config/themeConfig";
import { useAuthMe } from "@/hooks/useAuthMe";
import { type AdminUserRow } from "@/components/admin/AdminUsersPanel";

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
  directionsJson?: Array<{ id: number; description: string; detail: string }>;
  heroTitle?: string;
  heroSubtitle?: string;
  invitationText?: string;
  theme?: string;
  ownerUserId?: string;
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
  dir1Desc: string;
  dir1Detail: string;
  dir2Desc: string;
  dir2Detail: string;
  heroTitle: string;
  heroSubtitle: string;
  invitationText: string;
  theme: string;
  ownerUserId: string;
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
  dir1Desc: "",
  dir1Detail: "",
  dir2Desc: "",
  dir2Detail: "",
  heroTitle: "",
  heroSubtitle: "",
  invitationText: "",
  theme: "default",
  ownerUserId: "",
};

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

function formToDirectionsJson(form: FormState): Array<{ id: number; description: string; detail: string }> | undefined {
  const dirs: Array<{ id: number; description: string; detail: string }> = [];
  if (form.dir1Desc) dirs.push({ id: 1, description: form.dir1Desc, detail: form.dir1Detail });
  if (form.dir2Desc) dirs.push({ id: 2, description: form.dir2Desc, detail: form.dir2Detail });
  return dirs.length > 0 ? dirs : undefined;
}

function eventToForm(event: AdminEvent): FormState {
  const d = event.directionsJson;
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
    dir1Desc: d?.[0]?.description ?? "",
    dir1Detail: d?.[0]?.detail ?? "",
    dir2Desc: d?.[1]?.description ?? "",
    dir2Detail: d?.[1]?.detail ?? "",
    heroTitle: event.heroTitle ?? "",
    heroSubtitle: event.heroSubtitle ?? "",
    invitationText: event.invitationText ?? "",
    theme: event.theme ?? "default",
    ownerUserId: event.ownerUserId ?? "",
  };
}

function formToPayload(form: FormState): EventPayload {
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
    directionsJson: formToDirectionsJson(form),
    heroTitle: form.heroTitle || undefined,
    heroSubtitle: form.heroSubtitle || undefined,
    invitationText: form.invitationText || undefined,
    theme: form.theme || undefined,
    ownerUserId: form.ownerUserId || undefined,
  };
}

const inputCls = "rounded-xl border border-white/15 bg-black/25 px-4 py-2.5 text-white outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors w-full";
const textareaCls = "rounded-xl border border-white/15 bg-black/25 px-4 py-2.5 text-white outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors w-full resize-y min-h-[80px]";

function FormBlock({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/15 p-4">
      <p className="mb-3 text-xs uppercase tracking-[0.12em] text-white/40 font-khmer">{label}</p>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {children}
      </div>
    </div>
  );
}

interface EventFormFieldsProps {
  form: FormState;
  onChange: (field: keyof FormState, value: string) => void;
  themes: Theme[];
  isSuperAdmin?: boolean;
  assignableOwners?: AdminUserRow[];
}

function EventFormFields({ form, onChange, themes, isSuperAdmin, assignableOwners }: EventFormFieldsProps) {
  return (
    <div className="mt-4 space-y-3">
      <FormBlock label="ព្រឹត្តិការណ៍">
        <input required aria-label="ឈ្មោះបង្ហាញ" value={form.displayName} onChange={(e) => onChange("displayName", e.target.value)} placeholder="ឈ្មោះបង្ហាញ (Display Name)" className={inputCls} />
        <input required aria-label="តំណភ្ជាប់" value={form.slug} onChange={(e) => onChange("slug", e.target.value)} placeholder="តំណភ្ជាប់ (Slug)" className={inputCls} />
      </FormBlock>

      <FormBlock label="គូស្នេហ៍">
        <input aria-label="ឈ្មោះកូនកំលោះ" value={form.groomName} onChange={(e) => onChange("groomName", e.target.value)} placeholder="ឈ្មោះកូនកំលោះ (Groom Name)" className={inputCls} />
        <input aria-label="ឈ្មោះកូនក្រមុំ" value={form.brideName} onChange={(e) => onChange("brideName", e.target.value)} placeholder="ឈ្មោះកូនក្រមុំ (Bride Name)" className={inputCls} />
      </FormBlock>

      <FormBlock label="ពេលវេលា & ទីតាំង">
        <input type="datetime-local" aria-label="កាលបរិច្ឆេទ" value={form.weddingDate} onChange={(e) => onChange("weddingDate", e.target.value)} className={inputCls} />
        <input aria-label="ថ្ងៃខែព្រះចន្ទ" value={form.lunarDate} onChange={(e) => onChange("lunarDate", e.target.value)} placeholder="ថ្ងៃខែព្រះចន្ទ (Lunar Date)" className={inputCls} />
        <div className="md:col-span-2">
          <input aria-label="ទីតាំង" value={form.locationText} onChange={(e) => onChange("locationText", e.target.value)} placeholder="ទីតាំង (Location)" className={inputCls} />
        </div>
      </FormBlock>

      <FormBlock label="ឪពុកម្ដាយ">
        <input aria-label="ឈ្មោះឪពុកកំលោះ" value={form.groomFatherName} onChange={(e) => onChange("groomFatherName", e.target.value)} placeholder="ឈ្មោះឪពុកកំលោះ (Groom Father)" className={inputCls} />
        <input aria-label="ឈ្មោះម្ដាយកំលោះ" value={form.groomMotherName} onChange={(e) => onChange("groomMotherName", e.target.value)} placeholder="ឈ្មោះម្ដាយកំលោះ (Groom Mother)" className={inputCls} />
        <input aria-label="ឈ្មោះឪពុកក្រមុំ" value={form.brideFatherName} onChange={(e) => onChange("brideFatherName", e.target.value)} placeholder="ឈ្មោះឪពុកក្រមុំ (Bride Father)" className={inputCls} />
        <input aria-label="ឈ្មោះម្ដាយក្រមុំ" value={form.brideMotherName} onChange={(e) => onChange("brideMotherName", e.target.value)} placeholder="ឈ្មោះម្ដាយក្រមុំ (Bride Mother)" className={inputCls} />
      </FormBlock>

      <FormBlock label="ទិសដៅ">
        <div className="md:col-span-2">
          <input aria-label="Direction Map URL" value={form.directionMapUrl} onChange={(e) => onChange("directionMapUrl", e.target.value)} placeholder="Google Maps URL" className={inputCls} />
        </div>
        <input aria-label="ទិសដៅទី១ ការពិពណ៌នា" value={form.dir1Desc} onChange={(e) => onChange("dir1Desc", e.target.value)} placeholder="ទិសដៅទី១ - ការពិពណ៌នា" className={inputCls} />
        <input aria-label="ទិសដៅទី១ ព័ត៌មានលម្អិត" value={form.dir1Detail} onChange={(e) => onChange("dir1Detail", e.target.value)} placeholder="ទិសដៅទី១ - ព័ត៌មានលម្អិត" className={inputCls} />
        <input aria-label="ទិសដៅទី២ ការពិពណ៌នា" value={form.dir2Desc} onChange={(e) => onChange("dir2Desc", e.target.value)} placeholder="ទិសដៅទី២ - ការពិពណ៌នា" className={inputCls} />
        <input aria-label="ទិសដៅទី២ ព័ត៌មានលម្អិត" value={form.dir2Detail} onChange={(e) => onChange("dir2Detail", e.target.value)} placeholder="ទិសដៅទី២ - ព័ត៌មានលម្អិត" className={inputCls} />
      </FormBlock>

      <FormBlock label="ខ្លឹមសារ (Content)">
        <input aria-label="Hero Title" value={form.heroTitle} onChange={(e) => onChange("heroTitle", e.target.value)} placeholder="Hero Title" className={inputCls} />
        <input aria-label="Hero Subtitle" value={form.heroSubtitle} onChange={(e) => onChange("heroSubtitle", e.target.value)} placeholder="Hero Subtitle" className={inputCls} />
        <div className="md:col-span-2">
          <textarea aria-label="Invitation Text" value={form.invitationText} onChange={(e) => onChange("invitationText", e.target.value)} placeholder="Invitation Text" className={textareaCls} />
        </div>
      </FormBlock>

      {isSuperAdmin && (
        <FormBlock label="Admin">
          <select aria-label="Theme" value={form.theme} onChange={(e) => onChange("theme", e.target.value)} className={inputCls}>
            <option value="" disabled>ជ្រើសរើស Theme</option>
            {themes.map(t => (
              <option key={t.id} value={t.id}>{t.name} ({t.id})</option>
            ))}
          </select>
          {assignableOwners && assignableOwners.length > 0 ? (
            <select
              aria-label="Owner User"
              value={form.ownerUserId}
              onChange={(e) => onChange("ownerUserId", e.target.value)}
              className="rounded-xl border border-orange-500/30 bg-black/25 px-4 py-2.5 text-orange-200 outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 transition-colors w-full"
            >
              <option value="">ជ្រើសរើស Owner</option>
              {assignableOwners.map((u) => (
                <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
              ))}
            </select>
          ) : (
            <input aria-label="Admin/Owner User ID" value={form.ownerUserId} onChange={(e) => onChange("ownerUserId", e.target.value)} placeholder="Owner User ID (System Admin Only)" className="rounded-xl border border-orange-500/30 bg-black/25 px-4 py-2.5 text-orange-200 outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 transition-colors w-full" />
          )}
        </FormBlock>
      )}
    </div>
  );
}

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
    () => events.find((event) => event.id === selectedEventId) ?? null,
    [events, selectedEventId]
  );

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState<FormState>(emptyForm);
  const [editForm, setEditForm] = useState<FormState>(emptyForm);

  React.useEffect(() => {
    setEditForm(selectedEvent ? eventToForm(selectedEvent) : emptyForm);
  }, [selectedEvent]);

  const hasEvent = events.length > 0;

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <p className="text-xs uppercase tracking-[0.14em] text-white/35 font-khmer">ជ្រើសរើស ព្រឹត្តិការណ៍</p>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
          <select
            value={selectedEventId ?? ""}
            onChange={(e) => onSelectEvent(e.target.value)}
            className="w-full rounded-xl border border-white/15 bg-black/25 px-4 py-2.5 text-white outline-none font-khmer"
            disabled={loading || !hasEvent}
          >
            {!hasEvent && <option value="">មិនមានព្រឹត្តិការណ៍ទេ</option>}
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.displayName} ({event.slug})
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setShowCreateForm((prev) => !prev)}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white/85 hover:bg-white/10 font-khmer"
          >
            <CalendarPlus size={15} />
            {showCreateForm ? "បិទ (Close)" : "បង្កើតព្រឹត្តិការណ៍"}
          </button>
        </div>
      </div>

      {showCreateForm && (
        <motion.form
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-white/10 bg-white/5 p-5 font-khmer"
          onSubmit={async (e) => {
            e.preventDefault();
            await onCreateEvent(formToPayload(createForm));
            setCreateForm(emptyForm);
            setShowCreateForm(false);
          }}
        >
          <h3 className="text-lg font-semibold text-white">បង្កើតព្រឹត្តិការណ៍</h3>
          <EventFormFields 
            form={createForm} 
            onChange={(field, value) => setCreateForm((prev) => ({ ...prev, [field]: value }))} 
            themes={themes}
            isSuperAdmin={isSuperAdmin}
            assignableOwners={assignableOwners}
          />
          <div className="mt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/80"
            >
              <XCircle size={14} />
              បោះបង់
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl border border-cyan-400/30 bg-cyan-500/20 px-4 py-2 text-sm text-cyan-100 disabled:opacity-60"
            >
              <Save size={14} />
              {saving ? "កំពុងរក្សាទុក..." : "បង្កើត"}
            </button>
          </div>
        </motion.form>
      )}

      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 font-khmer">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-white">កែប្រែព្រឹត្តិការណ៍</h3>
          {selectedEvent && (
            <button
              type="button"
              onClick={() => void onDeleteEvent(selectedEvent.id)}
              disabled={deletingEventId === selectedEvent.id || saving}
              className="inline-flex items-center gap-2 rounded-xl border border-red-400/25 bg-red-500/10 px-4 py-2 text-sm text-red-200 disabled:opacity-50"
            >
              <Trash2 size={14} />
              {deletingEventId === selectedEvent.id ? "កំពុងលុប..." : "លុប"}
            </button>
          )}
        </div>

        {!selectedEvent ? (
          <p className="text-sm text-white/45">ជ្រើសរើសព្រឹត្តិការណ៍ដើម្បីកែប្រែ។</p>
        ) : (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              await onUpdateEvent(selectedEvent.id, formToPayload(editForm));
            }}
          >
            <EventFormFields 
              form={editForm} 
              onChange={(field, value) => setEditForm((prev) => ({ ...prev, [field]: value }))} 
              themes={themes}
              isSuperAdmin={isSuperAdmin}
              assignableOwners={assignableOwners}
            />
            <div className="mt-4 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl border border-cyan-400/30 bg-cyan-500/20 px-4 py-2 text-sm text-cyan-100 disabled:opacity-60"
              >
                <Pencil size={14} />
                {saving ? "កំពុងរក្សាទុក..." : "ធ្វើបច្ចុប្បន្នភាព"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
