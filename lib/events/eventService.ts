import { defaultDetailData, type DetailData } from "@/data/detailData";
import { defaultHeroData, type HeroData } from "@/data/heroData";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

const EVENTS_TABLE = process.env.SUPABASE_EVENTS_TABLE ?? "events";
const DEFAULT_EVENT_SLUG = "default";

export type EventRecord = {
  id: string;
  slug: string;
  owner_user_id: string;
  display_name: string;
  groom_name: string | null;
  bride_name: string | null;
  groom_father_name: string | null;
  groom_mother_name: string | null;
  bride_father_name: string | null;
  bride_mother_name: string | null;
  wedding_date: string | null;
  lunar_date: string | null;
  location_text: string | null;
  direction_map_url: string | null;
  directions_json: Array<{ id: number; description: string; detail: string }> | null;
  hero_title: string | null;
  hero_subtitle: string | null;
  invitation_text: string | null;
  theme: string;
};

function toKhmerDigits(value: string): string {
  const digits = ["០", "១", "២", "៣", "៤", "៥", "៦", "៧", "៨", "៩"];
  return value.replace(/\d/g, (digit) => digits[Number(digit)] ?? digit);
}

function mapDateParts(isoDate: string | null): HeroData["eventDate"] {
  if (!isoDate) {
    return defaultHeroData.eventDate;
  }

  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    return defaultHeroData.eventDate;
  }

  const day = toKhmerDigits(String(date.getDate()));
  const month = toKhmerDigits(String(date.getMonth() + 1));
  const year = toKhmerDigits(String(date.getFullYear()));
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const period = hours >= 12 ? "ល្ងាច" : "ព្រឹក";
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  const time = `${toKhmerDigits(String(hour12))}:${toKhmerDigits(String(minutes).padStart(2, "0"))} ${period}`;

  return {
    day,
    dayOfWeek: defaultHeroData.eventDate.dayOfWeek,
    month,
    year,
    time,
  };
}

export async function getEventBySlug(eventSlug: string): Promise<EventRecord | null> {
  try {
    const supabaseAdmin = getSupabaseAdminClient();
    const { data, error } = await supabaseAdmin
      .from(EVENTS_TABLE)
      .select(
        "id, slug, owner_user_id, display_name, groom_name, bride_name, groom_father_name, groom_mother_name, bride_father_name, bride_mother_name, wedding_date, lunar_date, location_text, direction_map_url, directions_json, hero_title, hero_subtitle, invitation_text, theme"
      )
      .eq("slug", eventSlug)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return data as EventRecord;
  } catch {
    return null;
  }
}

export async function getEventBySlugOrDefault(eventSlug?: string): Promise<EventRecord | null> {
  const normalizedSlug = eventSlug?.trim() || DEFAULT_EVENT_SLUG;
  const event = await getEventBySlug(normalizedSlug);
  if (event) {
    return event;
  }

  if (normalizedSlug === DEFAULT_EVENT_SLUG) {
    return null;
  }

  return getEventBySlug(DEFAULT_EVENT_SLUG);
}

export function toEventHeroData(event: EventRecord | null): HeroData {
  if (!event) {
    return defaultHeroData;
  }

  return {
    ...defaultHeroData,
    title: event.hero_title || defaultHeroData.title,
    subtitle: event.hero_subtitle || defaultHeroData.subtitle,
    invitation: event.invitation_text || defaultHeroData.invitation,
    groomName: event.groom_name || defaultHeroData.groomName,
    brideName: event.bride_name || defaultHeroData.brideName,
    eventDate: mapDateParts(event.wedding_date),
    location: event.location_text || defaultHeroData.location,
  };
}

export function toEventDetailData(event: EventRecord | null): DetailData {
  if (!event) {
    return defaultDetailData;
  }

  return {
    ...defaultDetailData,
    parents: [
      {
        father: event.groom_father_name || defaultDetailData.parents[0].father,
        mother: event.groom_mother_name || defaultDetailData.parents[0].mother,
      },
      {
        father: event.bride_father_name || defaultDetailData.parents[1].father,
        mother: event.bride_mother_name || defaultDetailData.parents[1].mother,
      },
    ],
    couple: {
      groom: event.groom_name || defaultDetailData.couple.groom,
      bride: event.bride_name || defaultDetailData.couple.bride,
    },
    dateInfo: {
      lunar: event.lunar_date || defaultDetailData.dateInfo.lunar,
      solar: event.wedding_date
        ? new Date(event.wedding_date).toLocaleDateString("km-KH", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : defaultDetailData.dateInfo.solar,
    },
    directions: event.directions_json && event.directions_json.length > 0
      ? event.directions_json
      : defaultDetailData.directions,
    directionMapUrl: event.direction_map_url || defaultDetailData.directionMapUrl,
  };
}
