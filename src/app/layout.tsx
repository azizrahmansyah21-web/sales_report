import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Agung Toyota UjungBatu — Sistem Pelaporan Prospek & Deteksi Duplikasi",
  description:
    "Sistem Pelaporan Prospek Sales & Deteksi Duplikasi Real-Time PT Agung Automall Cabang UjungBatu (Cabang Resmi 247)",
  applicationName: "Agung Toyota Sales Report",
  authors: [{ name: "PT Agung Automall UjungBatu" }],
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Toyota ATUB",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
