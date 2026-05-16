"use client";
import React from "react";
import { usePathname } from "next/navigation";
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
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");

  if (isAdminRoute) {
    return (
      <AuthProvider>
        <ThemeProvider>
          <div className="min-h-screen w-full">{children}</div>
        </ThemeProvider>
      </AuthProvider>
    );
  }

  return (
    <>
      <AuthProvider>
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
