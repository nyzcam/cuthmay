"use client";
import React from 'react';
import { ThemeProvider } from "@/providers/ThemeContext";
import LayoutWrapperOld from "@/components/LayoutWrapperOld";
import SplashProvider from "@/providers/SplashProvider";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (

    <>
      <SplashProvider>
        <ThemeProvider>
          <LayoutWrapperOld>{children}</LayoutWrapperOld>
        </ThemeProvider>

      </SplashProvider>

    </>

  );
}