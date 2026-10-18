"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Download, Share2, PlusSquare, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Cek apakah aplikasi sudah berjalan dalam mode PWA Standalone (sudah terinstal di HP / Desktop)
    const isStandaloneMode =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    if (isStandaloneMode) {
      queueMicrotask(() => {
        setIsStandalone(true);
      });
      return;
    }

    // Cek apakah pengguna baru saja menutup prompt dalam 3 hari terakhir
    const dismissedTime = localStorage.getItem("pwa_prompt_dismissed");
    if (dismissedTime) {
      const daysSinceDismissed =
        (Date.now() - parseInt(dismissedTime, 10)) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 3) {
        return;
      }
    }

    // Deteksi perangkat iOS (iPhone / iPad)
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice =
      /iphone|ipad|ipod/.test(userAgent) && !(window as unknown as { MSStream?: unknown }).MSStream;
    queueMicrotask(() => {
      setIsIos(isIosDevice);
    });

    if (isIosDevice) {
      // Tampilkan panduan iOS setelah 3 detik
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
      return () => clearTimeout(timer);
    }

    // Untuk Android / Desktop Chrome & Edge: tangkap event beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Tampilkan popup setelah 2 detik agar tidak mengganggu fokus awal user
      setTimeout(() => {
        setShowPrompt(true);
      }, 2000);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;

    if (choice.outcome === "accepted") {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("pwa_prompt_dismissed", Date.now().toString());
  };

  if (!showPrompt || isStandalone) {
    return null;
  }

  return (
    <aside
      aria-label="Unduh Aplikasi PWA"
      className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-96 z-50 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl shadow-2xl p-4 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 flex-shrink-0 flex items-center justify-center p-1.5 shadow-sm">
            <Image
              src="/ToyotaLogo.png"
              alt="Toyota Logo"
              width={40}
              height={40}
              className="object-contain"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-red-50 text-red-600 border border-red-100">
                Aplikasi Resmi
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Cabang 220</span>
            </div>
            <h4 className="text-sm font-bold text-slate-900 leading-snug mt-0.5">
              Pasang Plan SPK H-1
            </h4>
          </div>
        </div>

        <button
          onClick={handleDismiss}
          className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          title="Tutup"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">
        Akses cepat form input SPK, approval realisasi, &amp; dashboard analitik cabang tanpa membuka browser berulang kali.
      </p>

      {isIos ? (
        <div className="mt-3.5 pt-3 border-t border-slate-100 text-xs text-slate-700 space-y-2 bg-slate-50/70 p-2.5 rounded-xl">
          <div className="font-semibold text-slate-800 text-[11px] uppercase tracking-wide">
            Cara Pasang di iPhone / iPad:
          </div>
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <span>
              1. Ketuk tombol <strong>Bagikan</strong> (ikon kotak panah ke atas) di Safari.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <PlusSquare className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>
              2. Gulir ke bawah lalu pilih <strong>&quot;Tambahkan ke Layar Utama&quot;</strong>.
            </span>
          </div>
        </div>
      ) : (
        <div className="mt-3.5 flex items-center gap-2">
          <button
            onClick={handleInstallClick}
            className="flex-1 py-2 px-3.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 shadow-sm shadow-red-200 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Pasang di Perangkat</span>
          </button>
          <button
            onClick={handleDismiss}
            className="py-2 px-3 text-xs font-medium text-slate-500 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
          >
            Nanti
          </button>
        </div>
      )}
    </aside>
  );
}
