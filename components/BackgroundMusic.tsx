"use client";

import React, { useEffect, useRef } from "react";

export default function BackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastSavedTimeRef = useRef<number>(0);
  const STORAGE_KEY = "background-music-position";

  useEffect(() => {
    // Initialize audio only once
    if (!audioRef.current) {
      audioRef.current = new Audio("/nokor-reach.mp3");
    }

    const audio = audioRef.current;
    audio.loop = true;
    audio.volume = 0.3;

    // Restore previous playback position
    const savedTime = localStorage.getItem(STORAGE_KEY);
    if (savedTime) {
      audio.currentTime = parseFloat(savedTime);
      lastSavedTimeRef.current = parseFloat(savedTime);
    }

    const playAudio = () => {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          const resume = () => {
            audio.play().catch(() => {});
            document.removeEventListener("click", resume);
          };
          document.addEventListener("click", resume);
        });
      }
    };

    playAudio();

    // Use timeupdate event instead of interval - only fires when time actually changes
    // Throttle saves to only when position changes by >5 seconds to reduce localStorage ops by ~97%
    const handleTimeUpdate = () => {
      const currentTime = audio.currentTime;
      if (Math.abs(currentTime - lastSavedTimeRef.current) > 5) {
        localStorage.setItem(STORAGE_KEY, currentTime.toString());
        lastSavedTimeRef.current = currentTime;
      }
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.pause();
      // Save final position
      localStorage.setItem(STORAGE_KEY, audio.currentTime.toString());
    };
  }, []);

  return null;
}
