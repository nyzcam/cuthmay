import React, { memo } from "react";

const PatternBackground = memo(() => {
  const style: React.CSSProperties = {
    ["--bg-url" as any]: `url(/hol-khmer.svg)`,
    ["--tile-size" as any]: "100px",
  };

  return <div className="pattern-bg" style={style} />;
});

PatternBackground.displayName = "PatternBackground";
export default PatternBackground;
