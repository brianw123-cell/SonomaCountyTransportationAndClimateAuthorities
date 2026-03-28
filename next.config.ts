import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "sctca.ca.gov",
      },
    ],
  },
};

export default nextConfig;
