import type { Metadata } from "next";
import { getGuestDisplayName, findGuestBySlug } from "@/data/guestList";
import Hero from "@/components/Hero";
import Detail from "@/components/Detail";
import EventTimeline from "@/components/EventTimeline";
import AbaQr from "@/components/AbaQr";
import Footer from "@/components/Footer";
import PhotosGallary from "@/components/PhotosGallary";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://cuthmay.vercel.app";
const DEFAULT_GUEST_NAME = "Guest";
const WEDDING_DATE = "ថ្ងៃអាទិត្យ ១៧ មករា ២០២៧";
const WEDDING_LOCATION = "នៅភូមិអន្លង់គគី ឃុំកណ្ដោល ស្រុកទឹកឈូ ខេត្តកំពត";
const WEDDING_DESCRIPTION = `${WEDDING_DATE} — ${WEDDING_LOCATION}។ សូមចូលរួមអបអរសាទរពិធីមង្គលការរវាង កុម្ភម្នី & វឌ្ឍណា`;
const GUESTS_TABLE = process.env.SUPABASE_GUESTS_TABLE ?? "guests";

type Props = {
  params: Promise<{ guestSlug: string }>;
  searchParams: Promise<{ theme?: string }>;
};

async function getGuestNameFromDatabase(guestSlug: string): Promise<string | null> {
  try {
    const supabaseAdmin = getSupabaseAdminClient();
    const { data, error } = await supabaseAdmin
      .from(GUESTS_TABLE)
      .select("khmer_name, title")
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

async function normalizeGuestName(guestSlug: string): Promise<string> {
  if (!guestSlug) return DEFAULT_GUEST_NAME;

  const dbGuestName = await getGuestNameFromDatabase(guestSlug);
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
  const { guestSlug } = await params;
  const { theme } = await searchParams;
  const guestName = await normalizeGuestName(guestSlug);
  const title = generatePageTitle(guestName);
  const themeParam = theme ? `?theme=${theme}` : '';
  const ogUrl = `${SITE_URL}/api/og/${guestSlug}${themeParam}`;
  const pageUrl = `${SITE_URL}/invite/${guestSlug}${theme ? `?theme=${theme}` : ''}`;

  return {
    title,
    description: WEDDING_DESCRIPTION,
    openGraph: {
      title,
      description: WEDDING_DESCRIPTION,
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
      description: WEDDING_DESCRIPTION,
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


export default async function GuestPage({ params, searchParams }: Props) {
  const { guestSlug } = await params;
  const { theme } = await searchParams;
  const guestName = await normalizeGuestName(guestSlug);

  return (
    <div className="min-h-screen">
      <Hero guestName={guestName} themeOverride={theme} />
      <Detail />
      <EventTimeline />
      <PhotosGallary />
      <AbaQr guestSlug={guestSlug} guestName={guestName} />
      <Footer />
    </div>
  );
}
