"use client";

import React, { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";

interface MusicContextType {
  isPlaying: boolean;
  currentTrack: string | null;
  togglePlay: () => void;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export function MusicProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<string | null>(null);

  const STORAGE_KEY_TIME = "background-music-position";
  const STORAGE_KEY_TRACK = "background-music-track";

  const musicFiles = [
    '/nokor-reach.mp3',
    '/1.m4a', '/2.m4a', '/3.m4a', '/4.m4a', '/5.m4a', '/6.m4a', '/7.m4a'
  ];

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(e => console.error("Play error:", e));
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    const savedTrack = localStorage.getItem(STORAGE_KEY_TRACK);
    let selectedSrc = savedTrack;

    if (!selectedSrc || !musicFiles.includes(selectedSrc)) {
      const randomIndex = Math.floor(Math.random() * musicFiles.length);
      selectedSrc = musicFiles[randomIndex];
    }
    
    if (!selectedSrc) return;

    if (!audioRef.current) {
      audioRef.current = new Audio(selectedSrc);
    } else if (audioRef.current.src !== `${window.location.origin}${selectedSrc}`) {
      audioRef.current.src = selectedSrc;
    }

    const audio = audioRef.current;
    audio.loop = true;
    audio.volume = 0.3;
    setCurrentTrack(selectedSrc);

    const savedTime = localStorage.getItem(STORAGE_KEY_TIME);
    if (savedTime && savedTrack === selectedSrc) {
      const parsedTime = parseFloat(savedTime);
      if (!isNaN(parsedTime)) {
        audio.currentTime = parsedTime;
      }
    }

    const attemptPlay = async () => {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch (err) {
        console.log("Autoplay blocked, waiting for interaction");
        setIsPlaying(false);
        
        const resumeOnInteraction = () => {
            audio.play().then(() => setIsPlaying(true)).catch(() => {});
            document.removeEventListener("click", resumeOnInteraction);
            document.removeEventListener("keydown", resumeOnInteraction);
        };
        
        document.addEventListener("click", resumeOnInteraction);
        document.addEventListener("keydown", resumeOnInteraction);
        
        return () => {
            document.removeEventListener("click", resumeOnInteraction);
            document.removeEventListener("keydown", resumeOnInteraction);
        };
      }
    };

    const cleanupInteractionListener = attemptPlay();

    let lastSavedTime = 0;
    const handleTimeUpdate = () => {
      const currentTime = audio.currentTime;
      if (Math.abs(currentTime - lastSavedTime) > 5) {
        localStorage.setItem(STORAGE_KEY_TIME, currentTime.toString());
        localStorage.setItem(STORAGE_KEY_TRACK, selectedSrc!); // Save track name too
        lastSavedTime = currentTime;
      }
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      localStorage.setItem(STORAGE_KEY_TIME, audio.currentTime.toString());
      localStorage.setItem(STORAGE_KEY_TRACK, selectedSrc!);
      
      audio.pause();
      if (cleanupInteractionListener instanceof Promise) {
        cleanupInteractionListener.then(cleanup => cleanup && cleanup());
      }
    };
  }, []);

  return (
    <MusicContext.Provider value={{ isPlaying, currentTrack, togglePlay }}>
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