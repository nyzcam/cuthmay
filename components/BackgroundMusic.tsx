"use client";

import React, { useEffect, useRef } from "react";

export default function BackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastSavedTimeRef = useRef<number>(0);
  const STORAGE_KEY = "background-music-position";

  const musicFiles = [
    '/nokor-reach.mp3',
    '/1.m4a',
    '/2.m4a',
    '/3.m4a',
    '/4.m4a',
    '/5.m4a',
    '/6.m4a',
    '/7.m4a'
  ];

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * musicFiles.length);
    const musicSrc = musicFiles[randomIndex];
    if (!musicSrc) return; // No music selected

    if (!audioRef.current || audioRef.current.src !== `${window.location.origin}${musicSrc}`) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      audioRef.current = new Audio(musicSrc);
    }

    const audio = audioRef.current;
    audio.loop = true;
    audio.volume = 0.3;

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
      localStorage.setItem(STORAGE_KEY, audio.currentTime.toString());
    };
  }, []);

  return null;
}
