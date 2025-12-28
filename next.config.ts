import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configure Server Actions to allow larger file uploads
  experimental: {
    serverActions: {
      bodySizeLimit: "15mb",
    },
  },
  // Allow images from Supabase storage
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
