"use client";
import React from 'react';
import { ThemeProvider } from "@/providers/ThemeContext";
import LayoutWrapperOld from "@/components/LayoutWrapperOld";
import SplashProvider from "@/providers/SplashProvider";
import { AuthProvider } from "@/providers/AuthContext";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (

    <>
      <AuthProvider>
        <SplashProvider>
          <ThemeProvider>
            <LayoutWrapperOld>{children}</LayoutWrapperOld>
          </ThemeProvider>

        </SplashProvider>
      </AuthProvider>

    </>

  );
}