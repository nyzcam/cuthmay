import type { Metadata } from "next";
import dynamic from "next/dynamic";
import WeddingTimeline from "../components/WeddingTimeline";
import { AdminButton } from "@/components/AdminButton";

export const metadata: Metadata = {
  title: "សិរីសួស្ដីអាពាហ៍ពិពាហ៍",
  description: "សូមគោរមអញ្ជើញ ឯកឧត្តម លោកជំទាវ លោក លោកស្រី អ្នកនាងកញ្ញា",
};

const InvitationContent = dynamic(() => import("@/components/InvitationContent"));
const Detail = dynamic(() => import("@/components/Detail"));
const AbaQr = dynamic(() => import("@/components/AbaQr"));
const Footer = dynamic(() => import("@/components/Footer"));
import PhotosGallary from "@/components/PhotosGallary";

export default function HomePage() {
  return (
    <>
      <InvitationContent />
      <Detail />
      {/* <WeddingTimeline /> */}
      <PhotosGallary />
      <AbaQr />
      <Footer />
      <AdminButton />
    </>
  );
}
