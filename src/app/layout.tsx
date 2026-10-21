import { Analytics } from "@vercel/analytics/next";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { InstallPrompt } from "@/components/organisms/InstallPrompt";
import { ServiceWorkerRegister } from "@/components/pwa/ServiceWorkerRegister";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#ef4444",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "Agung Toyota UjungBatu: Sistem Laporan SPK H-1",
  description:
    "Sistem Laporan Rencana SPK H-1 & Realisasi Closing Sales PT Agung Automall Cabang UjungBatu (Cabang Resmi 220)",
  applicationName: "Plan SPK H-1",
  icons: {
    icon: "/icon.jpg",
    apple: "/apple-icon.jpg",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Plan SPK H-1",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          {children}
          <InstallPrompt />
          <ServiceWorkerRegister />
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
