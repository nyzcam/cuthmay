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

  return {
    title: `សូមគោរមអញ្ជើញ ${guestName}`,
    description: `ថ្ងៃ អាទិត្យ ទី ១៧ ខែ មេសា ឆ្នាំ ២០២៦​ វេលាម៉ោង៖ ៦ៈ០០ ល្ងាច
នៅគេហដ្ឋានខាងស្រី`,
    openGraph: {
      title: `សូមគោរមអញ្ជើញ ${guestName}`,
      description: `Join us on our special day, ${guestName}!`,
      images: ["/preview-image.webp"],
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