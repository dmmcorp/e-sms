import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ideal-cardinal-706.convex.cloud',
      },
    ]
  }
};

export default nextConfig;
