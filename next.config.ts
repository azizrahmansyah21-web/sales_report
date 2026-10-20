import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    serverActions: {
      allowedOrigins: ["*.trycloudflare.com", "*.cloudflareaccess.com"],
    },
  },
  // Izinkan tunnel di development
  allowedDevOrigins: ["*.trycloudflare.com"],
};


export default nextConfig;