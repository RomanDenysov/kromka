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
  images: {
    remotePatterns: [BLOB_STORE_URL],
    formats: ["image/avif", "image/webp"],
  },
  async redirects() {
    return [
      {
        source: "/products/:slug",
        destination: "/product/:slug",
        permanent: true,
      },
      {
        source: "/products",
        destination: "/e-shop",
        permanent: true,
      },
      {
        source: "/about",
        destination: "/o-nas",
        permanent: true,
      },
      {
        source: "/contact",
        destination: "/kontakt",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source:
          "/:path(favicon.ico|icon.png|apple-touch-icon.png|favicon-16x16.png|favicon-32x32.png|android-chrome-192x192.png|android-chrome-512x512.png)",
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
