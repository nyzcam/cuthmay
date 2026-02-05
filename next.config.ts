import type { NextConfig } from "next";
import path from 'path';
import loaderUtils from 'loader-utils';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com" }],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 365,
  },

  compress: true,
  productionBrowserSourceMaps: false,
  staticPageGenerationTimeout: 60,
  experimental: { turbo: false },
};

const hashOnlyIdent = (
  context: any,
  _: any,
  exportName: string // actual class name
) =>
  loaderUtils
    .getHashDigest(
      Buffer.from(
        `${path
          .relative(context.rootContext, context.resourcePath)
          .replace(/\\+/g, "/")}#${exportName}` // include class name
      ),
      "md4",
      "base64",
      5
    )
    .replace(/[^a-zA-Z0-9-_]/g, "_")
    .replace(/^(-?\d|--)/, "_$1");


nextConfig.webpack = (config, { dev, isServer }) => {
  if (dev || isServer) return config;

  const path = require("path");
  const loaderUtils = require("loader-utils");

  const hashOnlyIdent = (context: any, _: any, exportName: string) =>
    loaderUtils
      .getHashDigest(
        Buffer.from(
          `${path
            .relative(context.rootContext, context.resourcePath)
            .replace(/\\+/g, "/")}#${exportName}`
        ),
        "md4",
        "base64",
        6
      )
      .replace(/[^a-zA-Z0-9]/g, "")
      .substring(0, 6);

  const traverseRules = (rules: any[]) => {
    rules.forEach((rule) => {
      if (rule.oneOf) traverseRules(rule.oneOf);

      if (!rule.use) return;

      rule.use.forEach((loader: any) => {
        if (
          loader.loader?.includes("css-loader") &&
          loader.options?.modules
        ) {
          loader.options.modules.getLocalIdent = hashOnlyIdent;
          loader.options.modules.localIdentName = undefined;
        }
      });
    });
  };

  traverseRules(config.module.rules);

  return config;
};




export default nextConfig;
