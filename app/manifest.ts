import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Cuthmay",
    short_name: "Cuthmay",
    description: "Cuthmay App the digital invitation platform",
    start_url: "/",
    display: "fullscreen",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
