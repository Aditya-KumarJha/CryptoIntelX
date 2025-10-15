import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Explicit domains for next/image remote loading
    domains: [
      "avatar.vercel.sh",
      "skiper-ui.com",
      "i.giphy.com",
      "media.giphy.com",
      "media4.giphy.com",
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "skiper-ui.com",
      },
      {
        protocol: "https",
        hostname: "i.giphy.com",
      },
      {
        protocol: "https",
        hostname: "media.giphy.com",
      },
      {
        protocol: "https",
        hostname: "media4.giphy.com",
      },
      {
        protocol: "https",
        hostname: "avatar.vercel.sh",
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true, 
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
