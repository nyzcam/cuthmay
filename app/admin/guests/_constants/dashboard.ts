import { Guest } from "@/data/guestList";
import { GuestCommentRecord } from "@/types/types";

export const MAX_RECENT_GUESTS = 200;
export const GUESTS_PER_PAGE = 10;

export type NavSection =
  | "overview"
  | "events"
  | "guests"
  | "comments"
  | "add"
  | "import"
  | "settings"
  | "adminUsers";

export type GuestRecord = Guest & { slug: string };
export type CommentStatus = GuestCommentRecord["status"];

export const RELATIONSHIP_LABELS: Record<string, string> = {
  "immediate-family": "គ្រួសារបន្ទាន់",
  family: "គ្រួសារ",
  vip: "VIP",
  friend: "មិត្តភ័ក្ដ",
  colleague: "មិត្តរួមការងារ",
  guest: "ភ្ញៀវ",
};

export const COMMENT_STATUS_LABELS: Record<CommentStatus, string> = {
  new: "ថ្មី",
  reviewed: "បានមើល",
  archived: "បានទុក",
};

export function formatTimestamp(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toISOString().slice(0, 16).replace("T", " ");
}
