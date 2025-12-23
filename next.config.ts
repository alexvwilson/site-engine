import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configure Server Actions to allow larger file uploads
  experimental: {
    serverActions: {
      bodySizeLimit: "15mb",
    },
  },
};

export default nextConfig;
