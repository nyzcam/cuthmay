import type { Metadata } from "next";
import { guestList, getGuestDisplayName, findGuestBySlug } from "@/data/guestList";
import PreviewImg from "@public/preview-image.webp";

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

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://cuthmay-digi.vercel.app/";
  const title = `សិរីសួស្ដីអាពាហ៍ពិពាហ៍ - សូមគោរមអញ្ជើញ ${guestName}`;
  const description = `អាទិត្យ ១៧ មេសា ២០២៦ • វេលាម៉ោង ៦:០០ ល្ងាច — នៅគេហដ្ឋានខាងស្រី`;
  const imageUrl = PreviewImg.src;

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
          alt: `សិរីសួស្ដីអាពាហ៍ពិពាហ៍ - សូមគោរមអញ្ជើញ ${guestName}`,
        },
      ],
      siteName: "ចុតហ្មាយទំនើប",
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