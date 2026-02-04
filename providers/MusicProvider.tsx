"use client";

import React, { createContext, useContext, useEffect, useRef, ReactNode } from "react";

interface MusicContextType {
  isPlaying: boolean;
  currentTrack: string | null;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export function MusicProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastSavedTimeRef = useRef<number>(0);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [currentTrack, setCurrentTrack] = React.useState<string | null>(null);

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
    if (!musicSrc) return;

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
    setCurrentTrack(musicSrc);

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
    setIsPlaying(true);

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
      setIsPlaying(false);
      localStorage.setItem(STORAGE_KEY, audio.currentTime.toString());
    };
  }, []);

  return (
    <MusicContext.Provider value={{ isPlaying, currentTrack }}>
      {children}
    </MusicContext.Provider>
  );
}

export function useMusic() {
  const context = useContext(MusicContext);
  if (context === undefined) {
    throw new Error("useMusic must be used within a MusicProvider");
  }
  return context;
}
