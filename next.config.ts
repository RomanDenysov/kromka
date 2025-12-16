import type { NextConfig } from "next";
import { env } from "@/env";

const BLOB_STORE_URL = new URL(
  `https://${env.BLOB_STORE_ID}.public.blob.vercel-storage.com/**`
);

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  typedRoutes: true,
  experimental: {
    authInterrupts: true,
    serverActions: {
      bodySizeLimit: "4mb",
    },
    viewTransition: true,
  },
  cacheComponents: true,
  serverExternalPackages: [
    "better-auth",
    "kysely",
    "@better-auth/core",
    "@better-auth/utils",
  ],
  images: {
    remotePatterns: [BLOB_STORE_URL],
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [
      {
        source: "/icons/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/favicon.ico",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/android-chrome-192x192.png",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/android-chrome-512x512.png",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/apple-touch-icon.png",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/favicon-16x16.png",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/favicon-32x32.png",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/icon.png",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
