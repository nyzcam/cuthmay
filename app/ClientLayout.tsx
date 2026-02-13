"use client";
import React from "react";
import { ThemeProvider } from "@/providers/ThemeContext";
import LayoutWrapperOld from "@/components/LayoutWrapperOld";
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
        <MusicProvider>
          <ThemeProvider>
            <SplashProvider>
              <LayoutWrapperOld>{children}</LayoutWrapperOld>
            </SplashProvider>
          </ThemeProvider>
        </MusicProvider>
      </AuthProvider>
    </>
  );
}
