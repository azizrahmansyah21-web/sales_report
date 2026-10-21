import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Agung Toyota UjungBatu - Laporan SPK H-1",
    short_name: "Plan SPK H-1",
    description:
      "Sistem Laporan Rencana SPK H-1 & Realisasi Closing Sales Agung Toyota Cabang UjungBatu (Cabang Resmi 220)",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#ef4444",
    icons: [
      {
        src: "/icon.jpg",
        sizes: "192x192",
        type: "image/jpeg",
      },
      {
        src: "/icon.jpg",
        sizes: "512x512",
        type: "image/jpeg",
      },
      {
        src: "/icon.jpg",
        sizes: "512x512",
        type: "image/jpeg",
        purpose: "maskable",
      },
    ],
  };
}
