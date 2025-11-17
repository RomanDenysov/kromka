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
  },
  // cacheComponents: true,
  images: {
    remotePatterns: [BLOB_STORE_URL],
  },
};

export default nextConfig;
