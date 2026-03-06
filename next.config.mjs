/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.mjs");

import createPWA from "@ducanh2912/next-pwa";

/** @type {import("next").NextConfig} */
const baseConfig = {
  reactStrictMode: true,

  /**
   * If you have `experimental: { appDir: true }` set, then you must comment the below `i18n` config
   * out.
   *
   * @see https://github.com/vercel/next.js/issues/41980
   */
  i18n: {
    locales: ["en"],
    defaultLocale: "en",
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

const withPWA = createPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  runtimeCaching: [
    // Cache Google Fonts stylesheets with a stale-while-revalidate strategy
    {
      urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*$/,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "google-fonts-stylesheets",
      },
    },
    // Cache the underlying font files with a cache-first strategy for 1 year
    {
      urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*$/,
      handler: "CacheFirst",
      options: {
        cacheName: "google-fonts-webfonts",
        expiration: { maxEntries: 16, maxAgeSeconds: 60 * 60 * 24 * 365 },
      },
    },
    // Cache images from same-origin and remote with a stale-while-revalidate strategy
    {
      // Cache images when same-origin
      /**
       * @param {{
       *   request: Request,
       *   sameOrigin: boolean,
       *   url?: URL,
       *   event?: Event,
       *   [key: string]: any
       * }} ctx
       */
      urlPattern: (ctx) =>
        ctx.request.destination === "image" && ctx.sameOrigin,
      handler: "StaleWhileRevalidate",
      options: { cacheName: "images" },
    },
  ],
});

export default withPWA(baseConfig);
