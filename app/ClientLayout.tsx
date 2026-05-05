"use client";
import React from "react";
import { ThemeProvider } from "@/providers/ThemeContext";
import LayoutWrapper from "@/components/LayoutWrapper";
import PatternBackground from "@/components/PatternBackground";

import SplashProvider from "@/providers/SplashProvider";
import { AuthProvider } from "@/providers/AuthContext";
import { MusicProvider } from "@/providers/MusicProvider";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AuthProvider>
        {/* <PatternBackground /> */}
        <MusicProvider>
          <ThemeProvider>
            <SplashProvider>
              <LayoutWrapper>{children}</LayoutWrapper>
            </SplashProvider>
          </ThemeProvider>
        </MusicProvider>
      </AuthProvider>
    </>
  );
}
