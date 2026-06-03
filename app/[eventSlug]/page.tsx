import type { Metadata } from "next";
import { notFound } from "next/navigation";
import InvitationContent from "@/components/InvitationContent";
import Detail from "@/components/Detail";
import EventTimeline from "@/components/EventTimeline";
import PhotosGallary from "@/components/PhotosGallary";
import AbaQr from "@/components/AbaQr";
import Footer from "@/components/Footer";
import { getEventBySlug, toEventDetailData, toEventHeroData } from "@/lib/events/eventService";

type Props = {
  params: Promise<{ eventSlug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { eventSlug } = await params;
  const event = await getEventBySlug(eventSlug);

  if (!event) {
    return {
      title: "Invitation Not Found",
      description: "The requested invitation event was not found.",
    };
  }

  return {
    title: event.hero_title ?? "សិរីសួស្ដីអាពាហ៍ពិពាហ៍",
    description: event.display_name,
  };
}

export default async function EventLandingPage({ params }: Props) {
  const { eventSlug } = await params;
  const event = await getEventBySlug(eventSlug);

  if (!event) {
    notFound();
  }

  return (
    <>
      <InvitationContent heroData={toEventHeroData(event)} />
      <Detail detailData={toEventDetailData(event)} targetDate={event.wedding_date ?? undefined} />
      <EventTimeline />
      <PhotosGallary />
      <AbaQr />
      <Footer />
    </>
  );
}
