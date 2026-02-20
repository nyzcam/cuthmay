"use client";

import { useEffect, useState } from "react";
import Preloader from "@/components/Preloader";
import { AppPhase } from "@/types/types";
import { useTheme } from "./ThemeContext";

export default function SplashProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { currentTheme } = useTheme();
  const [phase, setPhase] = useState<AppPhase>(AppPhase.LOADING);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const lockScroll = () => {
      document.body.classList.add("overflow-hidden");
      document.documentElement.classList.add("overflow-hidden");
    };

    const unlockScroll = () => {
      document.body.classList.remove("overflow-hidden");
      document.documentElement.classList.remove("overflow-hidden");
    };

    lockScroll();

    const timerPhase = setTimeout(() => {
      setPhase(AppPhase.COMPLETE);
    }, 2500);

    const timerRemove = setTimeout(() => {
      setVisible(false);
      unlockScroll();
    }, 3300);

    return () => {
      clearTimeout(timerPhase);
      clearTimeout(timerRemove);
      unlockScroll();
    };
  }, []);

  return (
    <>
      <Preloader phase={phase} visible={visible} theme={currentTheme} />
      <div
      // style={{
      //   height: visible ? "100svh" : "auto",
      //   overflow: visible ? "hidden" : "visible",
      // }}
      >
        {children}
      </div>
    </>
  );
}
