"use client";

import React, { memo } from "react";

interface PatternBackgroundProps {
  patternUrl?: string;
  tileSize?: string;
  opacity?: number;
}

const PatternBackground = memo(
  ({
    patternUrl = "/hol-khmer.svg",
    tileSize = "100px",
    opacity = 0.1,
  }: PatternBackgroundProps) => {
    const style = {
      "--bg-url": `url(${patternUrl})`,
      "--tile-size": tileSize,
      "--opacity": opacity,
    } as React.CSSProperties;

    return <div className="pattern-bg" style={style} />;
  }
);

PatternBackground.displayName = "PatternBackground";
export default PatternBackground;
