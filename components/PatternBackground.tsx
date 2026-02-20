"use client";

import React, { memo } from "react";

interface PatternBackgroundProps {
  patternUrl?: string;
  tileSize?: string;
  opacity?: number;
}

const PatternBackground = memo(
  ({ tileSize = "100px" }: PatternBackgroundProps) => {
    const style = {
      "--tile-size": tileSize,
    } as React.CSSProperties;

    return <div className="pattern-bg" style={style} />;
  }
);

PatternBackground.displayName = "PatternBackground";
export default PatternBackground;
