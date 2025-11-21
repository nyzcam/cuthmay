"use client";

import { useEffect, useRef, useState } from "react";
import Preloader from "../components/Preloader";
import { AppPhase } from "@/types/types";

export default function SplashProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const playedOnce = useRef(false);
  const [phase, setPhase] = useState<AppPhase>(AppPhase.LOADING);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (playedOnce.current) {
      setVisible(false);
      return;
    }

    const t = setTimeout(() => {
      setPhase(AppPhase.COMPLETE);

      setTimeout(() => {
        playedOnce.current = true;
        setVisible(false);
      }, 900);
    }, 1500);

    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <Preloader phase={phase} visible={visible} />
      {children}
    </>
  );
}
