"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from "react";

interface MusicContextType {
  isPlaying: boolean;
  togglePlay: () => void;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

const BGM_PATH = "/3.m4a";

export function MusicProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const audio = new Audio(BGM_PATH);
    audio.loop = true;
    audio.volume = 0.3;
    audioRef.current = audio;

    const playAudio = async () => {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch {
        // Autoplay blocked, wait for user interaction
        setIsPlaying(false);
      }
    };

    const onUserInteraction = () => {
      if (audio.paused) {
        playAudio();
      }
    };

    // Attempt initial autoplay
    playAudio();

    // Attach listeners for interaction fallback; 'once: true' ensures they fire only once per event type
    document.addEventListener("click", onUserInteraction, { once: true });
    document.addEventListener("keydown", onUserInteraction, { once: true });

    return () => {
      audio.pause();
      audio.src = ""; // Free memory
      audioRef.current = null;
      document.removeEventListener("click", onUserInteraction);
      document.removeEventListener("keydown", onUserInteraction);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      audio.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  };

  return (
    <MusicContext.Provider value={{ isPlaying, togglePlay }}>
      {children}
    </MusicContext.Provider>
  );
}

export function useMusic(): MusicContextType {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error("useMusic must be used within a MusicProvider");
  }
  return context;
}

