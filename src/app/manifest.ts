import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Agung Toyota UjungBatu - Laporan SPK H-1",
    short_name: "SPK H-1 ATUB",
    description:
      "Sistem Laporan Rencana SPK H-1 & Realisasi Closing Sales Agung Toyota Cabang UjungBatu",
    start_url: "/beranda",
    display: "standalone",
    background_color: "#f8fafc",
    theme_color: "#2563eb",
    icons: [
      {
        src: "/icon.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
