"use client";
import { ThemeProvider } from "@/lib/ThemeContext";
import LayoutWrapperOld from "@/components/LayoutWrapperOld";
import { AnimatePresence } from 'framer-motion';
import { useState } from "react";
import dynamic from "next/dynamic";
import "../styles/index.css";
import "../styles/App.css";

const Preloader = dynamic(() => import("@/components/Preloader"));

export default function ClientLayout({ children }: { children: React.ReactNode }) {
const [showSplash, setShowSplash] = useState(true);
  return (
    <>
      <AnimatePresence mode="wait">
       
          <Preloader 
                onComplete={() => setShowSplash(false)}
                minimumDisplayTime={1500}
                />
        
      </AnimatePresence>
      <ThemeProvider>
        <LayoutWrapperOld>
          {children}
        </LayoutWrapperOld>
      </ThemeProvider>
    </>
  );
}
