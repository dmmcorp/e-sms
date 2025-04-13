import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ideal-cardinal-706.convex.cloud',
      },
      {
        protocol: 'https',
        hostname: 'reliable-eagle-883.convex.cloud',
      },
      {
        protocol: 'https',
        hostname: 'enduring-bandicoot-966.convex.site',
      },
    ]
  }
};

export default nextConfig;
