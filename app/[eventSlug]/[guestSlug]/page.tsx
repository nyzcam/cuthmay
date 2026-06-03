import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getGuestDisplayName, findGuestBySlug } from "@/data/guestList";
import Hero from "@/components/Hero";
import Detail from "@/components/Detail";
import EventTimeline from "@/components/EventTimeline";
import AbaQr from "@/components/AbaQr";
import Footer from "@/components/Footer";
import PhotosGallary from "@/components/PhotosGallary";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getEventBySlug, toEventDetailData, toEventHeroData } from "@/lib/events/eventService";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://cuthmay.vercel.app";
const DEFAULT_GUEST_NAME = "Guest";
const GUESTS_TABLE = process.env.SUPABASE_GUESTS_TABLE ?? "guests";

type Props = {
  params: Promise<{ eventSlug: string; guestSlug: string }>;
  searchParams: Promise<{ theme?: string }>;
};

async function getGuestNameFromDatabase(eventId: string, guestSlug: string): Promise<string | null> {
  try {
    const supabaseAdmin = getSupabaseAdminClient();
    const { data, error } = await supabaseAdmin
      .from(GUESTS_TABLE)
      .select("khmer_name, title")
      .eq("event_id", eventId)
      .eq("slug", guestSlug)
      .maybeSingle();

    if (error || !data?.khmer_name) {
      return null;
    }

    if (data.title) {
      return `${data.title} ${data.khmer_name}`;
    }

    return data.khmer_name;
  } catch {
    return null;
  }
}

async function normalizeGuestName(eventId: string, guestSlug: string): Promise<string> {
  if (!guestSlug) return DEFAULT_GUEST_NAME;

  const dbGuestName = await getGuestNameFromDatabase(eventId, guestSlug);
  if (dbGuestName) {
    return dbGuestName;
  }

  const guest = findGuestBySlug(guestSlug);
  if (guest) {
    return getGuestDisplayName(guest);
  }

  try {
    const decoded = decodeURIComponent(guestSlug).replace(/-/g, " ");
    return decoded || DEFAULT_GUEST_NAME;
  } catch {
    return DEFAULT_GUEST_NAME;
  }
}

function generatePageTitle(guestName: string): string {
  return `សិរីសួស្ដីអាពាហ៍ពិពាហ៍ - សូមគោរមអញ្ជើញ ${guestName}`;
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { eventSlug, guestSlug } = await params;
  const { theme } = await searchParams;
  const event = await getEventBySlug(eventSlug);

  if (!event) {
    return {
      title: "Invitation Not Found",
      description: "The requested invitation event was not found.",
    };
  }

  const guestName = await normalizeGuestName(event.id, guestSlug);
  const title = generatePageTitle(guestName);
  const themeParam = theme ? `?theme=${theme}` : "";
  const ogUrl = `${SITE_URL}/api/og/${guestSlug}${themeParam}`;
  const pageUrl = `${SITE_URL}/${eventSlug}/${guestSlug}${theme ? `?theme=${theme}` : ""}`;

  return {
    title,
    description: event.display_name,
    openGraph: {
      title,
      description: event.display_name,
      url: pageUrl,
      images: [
        {
          url: ogUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      type: "website",
      locale: "km_KH",
      siteName: "Cuthmay",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: event.display_name,
      images: [ogUrl],
    },
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical: pageUrl,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function EventGuestPage({ params, searchParams }: Props) {
  const { eventSlug, guestSlug } = await params;
  const { theme } = await searchParams;
  const event = await getEventBySlug(eventSlug);

  if (!event) {
    notFound();
  }

  const guestName = await normalizeGuestName(event.id, guestSlug);

  return (
    <div className="min-h-screen">
      <Hero guestName={guestName} heroData={toEventHeroData(event)} themeOverride={theme} />
      <Detail detailData={toEventDetailData(event)} targetDate={event.wedding_date ?? undefined} />
      <EventTimeline />
      <PhotosGallary />
      <AbaQr guestSlug={guestSlug} guestName={guestName} />
      <Footer />
    </div>
  );
}
