import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Image optimization */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year for immutable images
  },

  /* Enable compression */
  compress: true,

  /* Optimize production builds */
  productionBrowserSourceMaps: false,

  /* Static page generation timeout */
  staticPageGenerationTimeout: 60,

  experimental: {
    cssChunking: true,
    globalNotFound: true,
  },
} satisfies NextConfig

export default nextConfig;
