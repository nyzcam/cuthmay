"use client";

import React, { Suspense } from "react";
import LayoutWrapperOld from "@/components/LayoutWrapperOld";
import Hero from "@/components/Hero";
import Detail from "@/components/Detail";
import AbaQr from "@/components/AbaQr";
import Footer from "@/components/Footer";
import ErrorBoundary from "@/components/ErrorBoundary";
import { ThemeProvider } from "@/lib/ThemeContext";
import dynamic from "next/dynamic";

const PhotosGallary = dynamic(
  () => import("@/components/PhotosGallary"),
  {
    ssr: false,
    loading: () => <div>Loading photos...</div>,
  }
);

export default function InvitePage({
  params,
}: {
  params: { guestSlug: string };
}) {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <LayoutWrapperOld>
          <Hero />
          <Detail />
          <Suspense fallback={<div>Loading photos…</div>}>
            <PhotosGallary />
          </Suspense>
          <AbaQr />
          <Footer />
        </LayoutWrapperOld>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
