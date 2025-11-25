import type { Metadata } from "next";
import { guestList, getGuestDisplayName, findGuestBySlug } from "@/data/guestList";

type Props = {
  params: Promise<{ guestSlug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // Await the params promise
  const { guestSlug } = await params;

  const guest = findGuestBySlug(guestSlug);
  let guestName: string;

  if (guest) {
    guestName = getGuestDisplayName(guest);
  } else {
    const decoded = decodeURIComponent(guestSlug).replace(/-/g, " ");
    guestName = decoded || "Guest";
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://cuthmay-digi.vercel.app";

  const title = `សិរីសួស្ដីអាពាហ៍ពិពាហ៍ - សូមគោរមអញ្ជើញ ${guestName}`;
  const description = `អាទិត្យ ១៧ មេសា ២០២៦ • វេលាម៉ោង ៦:០០ ល្ងាច — នៅគេហដ្ឋានខាងស្រី`;

  const ogUrl = `${siteUrl}/api/og/${guestSlug}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${siteUrl}/invite/${guestSlug}`,
      images: [
        {
          url: ogUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogUrl],
    },
  };
}

import Hero from "@/components/Hero";
import Detail from "@/components/Detail";
import AbaQr from "@/components/AbaQr";
import Footer from "@/components/Footer";
import PhotosGallary from "@/components/PhotosGallary";

export default async function GuestPage({ params }: Props) {
  // Await params in the page component too
  const { guestSlug } = await params;

  return (
    <>
      <Hero/>
      <Detail/>
      <PhotosGallary />
      <AbaQr />
      <Footer />
    </>
  );
}