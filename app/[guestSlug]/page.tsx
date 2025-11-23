import type { Metadata } from "next";
import { guestList, getGuestDisplayName, findGuestBySlug } from "@/data/guestList";

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
    const decodedSlug = decodeURIComponent(guestSlug);
    guestName = decodedSlug ? decodedSlug.replace(/-/g, " ") : "Guest";
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const title = `សូមគោរមអញ្ជើញ ${guestName}`;
  const description = `កាលបរិច្ឆេទ៖ អាទិត្យ ១៧ មេសា ២០២៦ • វេលាម៉ោង ៦:០០ ល្ងាច — សូមចូលរួមនៅគេហដ្ឋានខាងស្រី`;
  const imageUrl = `${siteUrl.replace(/\/$/, "")}/preview-image.webp`;

  return {
    title,
    description,
    keywords: ["wedding", "invitation", "សម្ងាត់", "invite", guestName],
    openGraph: {
      title,
      description,
      images: [
        {
          url: imageUrl,
          alt: `Invitation preview for ${guestName}`,
        },
      ],
      siteName: "Cuthmay Invitation",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

import Hero from "@/components/Hero";
import Detail from "@/components/Detail";
import AbaQr from "@/components/AbaQr";
import Footer from "@/components/Footer";
import PhotosGallary from "@/components/PhotosGallary";

export default async function GuestPage({ params }: Props) {
  return (
    <>
      <Hero />
      <Detail />
      <PhotosGallary />
      <AbaQr />
      <Footer />
    </>
  );
}