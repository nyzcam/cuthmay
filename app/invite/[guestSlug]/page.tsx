import type { Metadata } from "next";
import { getGuestDisplayName, findGuestBySlug } from "@/data/guestList";
import Hero from "@/components/Hero";
import Detail from "@/components/Detail";
import AbaQr from "@/components/AbaQr";
import Footer from "@/components/Footer";
import PhotosGallary from "@/components/PhotosGallary";

type Props = {
  params: Promise<{ guestSlug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
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
  const description = `អាទិត្យ ១៧ មេសា ២០២៦ • វេលាម៉ោង ៦:០០ ល្ងាច — នៅគេហដ្ឋានខាងស្រី ភូមិល សង្កាត់ស្ទឹងមានជ័យ ខណ្ឌចំការមន រាជធានីភ្នំពេញ។ សូមចូលរួមអបអរសាទរពិធីមង្គលការរវាង កុម្ភម្នី & កញ្ញា គន្ធា។`;

  const ogUrl = `${siteUrl}/preview_image.webp`;

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
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogUrl],
    },
    metadataBase: new URL(siteUrl),
  };
}

export default async function GuestPage({ params }: Props) {
  const { guestSlug } = await params;
  
  const guest = findGuestBySlug(guestSlug);
  let guestName: string;

  if (guest) {
    guestName = getGuestDisplayName(guest);
  } else {
    const decoded = decodeURIComponent(guestSlug).replace(/-/g, " ");
    guestName = decoded || "Guest";
  }

  return (
    <>
      <Hero guestName={guestName} />
      <Detail />
      <PhotosGallary />
      <AbaQr />
      <Footer />
    </>
  );
}