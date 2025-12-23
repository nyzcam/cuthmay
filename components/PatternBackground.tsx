"use client";

import React, { memo } from "react";

const PatternBackground = memo(() => {
  const style = {
    "--bg-url": `url(/hol-khmer.svg)`,
    "--tile-size": "100px",
  } as React.CSSProperties;

  return <div className="pattern-bg" style={style} />;
});

PatternBackground.displayName = "PatternBackground";
export default PatternBackground;
