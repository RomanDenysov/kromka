import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  typedRoutes: true,
  cacheComponents: true,
  experimental: {
    authInterrupts: true,
  },
};

export default nextConfig;
