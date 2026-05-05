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
  currentTrack: string | null;
  togglePlay: () => void;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

const MUSIC_FILES = [
  "/1.m4a",
  "/2.m4a",
  "/3.m4a",
  "/4.m4a",
  "/5.m4a",
  "/6.m4a",
  "/7.m4a",
];

function getRandomTrack(): string {
  const index = Math.floor(Math.random() * MUSIC_FILES.length);
  return MUSIC_FILES[index];
}

export function MusicProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<string | null>(null);

  const togglePlay = (): void => {
    if (!audioRef.current) return;

    if (audioRef.current.paused) {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    const selectedSrc = getRandomTrack(); // 🔥 always new track

    const audio = new Audio(selectedSrc);
    audio.loop = true;
    audio.volume = 0.3;

    audioRef.current = audio;
    setCurrentTrack(selectedSrc);

    let interactionHandler: (() => void) | null = null;

    const tryAutoplay = async (): Promise<void> => {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch {
        setIsPlaying(false);

        interactionHandler = () => {
          audio.play().then(() => setIsPlaying(true)).catch(() => {});
          document.removeEventListener("click", interactionHandler!);
          document.removeEventListener("keydown", interactionHandler!);
        };

        document.addEventListener("click", interactionHandler);
        document.addEventListener("keydown", interactionHandler);
      }
    };

    tryAutoplay();

    return () => {
      if (interactionHandler) {
        document.removeEventListener("click", interactionHandler);
        document.removeEventListener("keydown", interactionHandler);
      }

      audio.pause();
      audioRef.current = null;
    };
  }, []);

  return (
    <MusicContext.Provider value={{ isPlaying, currentTrack, togglePlay }}>
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
