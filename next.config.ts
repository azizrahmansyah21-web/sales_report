import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ["*.trycloudflare.com"],
    },
  },
  // Izinkan tunnel di development
  allowedDevOrigins: ["*.trycloudflare.com"],
};


export default nextConfig;