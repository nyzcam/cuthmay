"use client";
import React from 'react';
import { ThemeProvider } from "@/providers/ThemeContext";
import LayoutWrapperOld from "@/components/LayoutWrapperOld";
import SplashProvider from "@/providers/SplashProvider";
import "../styles/index.css";
import "../styles/App.css";

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