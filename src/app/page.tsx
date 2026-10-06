import Link from "next/link";
import ToyotaLogo from "@/components/atoms/ToyotaLogo";
import Badge from "@/components/atoms/Badge";
import {
  Smartphone,
  LayoutDashboard,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  Users,
  FileSpreadsheet,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between p-4 md:p-8 antialiased selection:bg-blue-600 selection:text-white">
      {/* Top Header */}
      <header className="max-w-6xl w-full mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 py-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <ToyotaLogo variant="white" size="md" />
          <div className="flex flex-col">
            <span className="font-black text-white text-base tracking-tight">
              Agung Toyota
            </span>
            <span className="text-xs text-slate-400">
              Cabang UjungBatu • Rokan Hulu (Cabang 247)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="ONLINE" size="md" showDot>
            Sistem Aktif (DMS Connected)
          </Badge>
          <span className="text-xs text-slate-400 font-mono hidden sm:inline">
            v2.4.0 PWA Ready
          </span>
        </div>
      </header>

      {/* Main Hero & Portal Switcher */}
      <main className="max-w-5xl w-full mx-auto my-auto py-10 sm:py-16 text-center space-y-10">
        <div className="space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-900/40 border border-blue-700/60 text-blue-300 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
            Sistem Pelaporan Prospek Sales & Deteksi Duplikasi Real-Time
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Agung Toyota UjungBatu
          </h1>

          <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
            Platform operasional terpadu pencegahan sengketa prospek ganda,
            pencatatan touchpoint interaksi pelanggan, dan analitik performa
            sales di wilayah Rokan Hulu.
          </p>
        </div>

        {/* 2 Portal Choice Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left max-w-4xl mx-auto">
          {/* Card 1: Portal Sales PWA */}
          <Link
            href="/beranda"
            className="group relative rounded-3xl bg-slate-800/80 border border-slate-700/90 p-6 sm:p-8 hover:border-blue-500 hover:bg-slate-800 transition-all duration-200 shadow-xl flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center">
                <Smartphone className="w-6 h-6" />
              </div>

              <div>
                <span className="text-[11px] font-bold text-blue-400 tracking-wider uppercase">
                  Mobile-First PWA
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-white mt-0.5 group-hover:text-blue-400 transition-colors">
                  Portal Sales Lapangan
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
                  Antarmuka khusus Sales Advisor untuk input cepat prospek baru,
                  verifikasi nomor telepon duplikat seketika, dan tracking target
                  SPK bulanan.
                </p>
              </div>

              <div className="pt-2 space-y-2 border-t border-slate-700/60 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Input Prospek & Deteksi Nomor Ganda</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Notifikasi Otomatis ke WA Group Sales</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Riwayat & Filter Prospek Pribadi</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between text-xs font-semibold text-blue-400 group-hover:text-blue-300">
              <span>Buka Portal Sales (Mode PWA)</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 2: Portal Admin Dashboard */}
          <Link
            href="/admin/dashboard"
            className="group relative rounded-3xl bg-slate-800/80 border border-slate-700/90 p-6 sm:p-8 hover:border-amber-500 hover:bg-slate-800 transition-all duration-200 shadow-xl flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center">
                <LayoutDashboard className="w-6 h-6" />
              </div>

              <div>
                <span className="text-[11px] font-bold text-amber-400 tracking-wider uppercase">
                  Desktop & Tablet Executive
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-white mt-0.5 group-hover:text-amber-400 transition-colors">
                  Portal Manajemen Admin
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
                  Dashboard analytics pimpinan cabang untuk pengawasan data
                  prospek, mediasi sengketa repeat lead, monitoring 14 sales,
                  dan ekspor laporan.
                </p>
              </div>

              <div className="pt-2 space-y-2 border-t border-slate-700/60 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Highlight Duplikasi & Slide-over Audit Trail</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>Grafik Performa & Funnel Repeat Leads</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Manajemen Zonasi & SOP Sengketa Sales</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between text-xs font-semibold text-amber-400 group-hover:text-amber-300">
              <span>Buka Portal Admin Executive</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl w-full mx-auto py-4 border-t border-slate-800 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p>© 2024 PT Agung Automall — Cabang UjungBatu, Kab. Rokan Hulu, Riau.</p>
        <p className="font-mono text-[11px]">Strict TypeScript • Atomic Architecture</p>
      </footer>
    </div>
  );
}
