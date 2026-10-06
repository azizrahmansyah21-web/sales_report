import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Agung Toyota UjungBatu - Sales Report",
    short_name: "Toyota ATUB",
    description:
      "Sistem Pelaporan Prospek Sales & Deteksi Duplikasi Real-Time Agung Toyota Cabang UjungBatu",
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
