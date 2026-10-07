import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/components/providers/AuthProvider";
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
  title: "Agung Toyota UjungBatu — Sistem Laporan SPK H-1",
  description:
    "Sistem Laporan Rencana SPK H-1 & Realisasi Closing Sales PT Agung Automall Cabang UjungBatu (Cabang Resmi 247)",
  applicationName: "Agung Toyota SPK H-1",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SPK H-1 ATUB",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
