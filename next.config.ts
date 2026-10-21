import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    serverActions: {
      allowedOrigins: [
        "planspk.com",
        "*.planspk.com",
        "*.trycloudflare.com",
        "*.cloudflareaccess.com",
      ],
    },
  },
  // Izinkan tunnel & domain produksi
  allowedDevOrigins: ["planspk.com", "*.planspk.com", "*.trycloudflare.com"],
};

export default nextConfig;