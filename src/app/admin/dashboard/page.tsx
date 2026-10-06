"use client";

import React, { useState } from "react";
import Link from "next/link";
import AdminDashboardLayout from "@/components/templates/AdminDashboardLayout";
import MetricCard from "@/components/molecules/MetricCard";
import Avatar from "@/components/atoms/Avatar";
import { TOP_SALES_LEADERBOARD } from "@/lib/mockData";
import {
  FileSpreadsheet,
  Download,
  Users,
  Award,
  AlertTriangle,
  ArrowUpRight,
  Sparkles,
  TrendingUp,
  Layers,
  ChevronRight,
  Filter,
} from "lucide-react";

export default function AdminDashboardPage() {
  const [activeTooltipWeek, setActiveTooltipWeek] = useState<number>(3);

  // Time-series mock weeks
  const weeklyData = [
    { week: "Minggu 1", date: "1-7 Okt", prospects: 82, spk: 16 },
    { week: "Minggu 2", date: "8-14 Okt", prospects: 104, spk: 21 },
    { week: "Minggu 3", date: "15-21 Okt", prospects: 128, spk: 26 },
    { week: "Minggu 4", date: "22-28 Okt", prospects: 114, spk: 23 },
  ];

  return (
    <AdminDashboardLayout
      title="Dashboard Analytics"
      subtitle="Portal Operasional Cabang UjungBatu • Ringkasan Kuartal IV 2024"
      duplicateCount={3}
    >
      <div className="space-y-6">
        {/* 4 Primary KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total Prospek Masuk"
            value="428"
            subtitle="Akumulasi Oktober 2024"
            icon={<Layers className="w-4 h-4 text-blue-600" />}
            trend={{ value: "+12.4%", isPositive: true }}
          />

          <MetricCard
            title="Realisasi SPK Closing"
            value="86"
            subtitle="Unit Kendaraan Valid"
            icon={<Award className="w-4 h-4 text-emerald-600" />}
            trend={{ value: "+18.4%", isPositive: true }}
          />

          <MetricCard
            title="Sales Advisor Aktif"
            value="14"
            subtitle="100% Shift Lapangan & Showroom"
            icon={<Users className="w-4 h-4 text-purple-600" />}
          />

          {/* Prominent Duplicate Metric Card (Amber Highlight Mode) */}
          <MetricCard
            title="Duplikasi Terdeteksi"
            value="23"
            subtitle="5.4% Duplicate Rate • Perlu Verifikasi"
            icon={<AlertTriangle className="w-4 h-4 text-amber-700" />}
            isDuplicate={true}
          />
        </div>

        {/* Middle Section: Chart & Top 5 Leaderboard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Time-series Interactive Curve */}
          <div className="lg:col-span-2 rounded-2xl bg-white border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div>
                  <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                    <span>Tren Pergerakan Prospek vs Realisasi SPK</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      Oktober 2024
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Kurva perbandingan volume minat masuk terhadap konversi SPK cabang.
                  </p>
                </div>

                {/* Chart Legends */}
                <div className="flex items-center gap-4 text-xs font-semibold">
                  <div className="flex items-center gap-1.5 text-blue-600">
                    <span className="w-3 h-3 rounded-full bg-blue-600" />
                    <span>Prospek Baru</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-600">
                    <span className="w-3 h-3 rounded-full bg-emerald-600" />
                    <span>SPK Closing</span>
                  </div>
                </div>
              </div>

              {/* Custom SVG Dual Line Chart with Tooltip */}
              <div className="relative pt-6 pb-2">
                {/* Active Tooltip Pill */}
                <div className="mb-4 p-3 rounded-xl bg-slate-900 text-white flex items-center justify-between text-xs shadow-md">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-blue-400">
                      {weeklyData[activeTooltipWeek - 1].week} (
                      {weeklyData[activeTooltipWeek - 1].date}):
                    </span>
                    <span>
                      {weeklyData[activeTooltipWeek - 1].prospects} Prospek
                    </span>
                    <span>•</span>
                    <span className="text-emerald-400 font-semibold">
                      {weeklyData[activeTooltipWeek - 1].spk} SPK Closing
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Rasio Konversi:{" "}
                    {(
                      (weeklyData[activeTooltipWeek - 1].spk /
                        weeklyData[activeTooltipWeek - 1].prospects) *
                      100
                    ).toFixed(1)}
                    %
                  </span>
                </div>

                {/* SVG Visual Representation */}
                <div className="h-52 w-full flex items-end justify-between gap-3 pt-4 px-2">
                  {weeklyData.map((d, idx) => {
                    const isSelected = activeTooltipWeek === idx + 1;
                    return (
                      <div
                        key={d.week}
                        onClick={() => setActiveTooltipWeek(idx + 1)}
                        className={`flex-1 flex flex-col items-center justify-end cursor-pointer group transition-all p-2 rounded-xl ${
                          isSelected ? "bg-slate-50 ring-1 ring-blue-200" : "hover:bg-slate-50/50"
                        }`}
                      >
                        {/* Values on top of bars */}
                        <div className="flex items-center gap-1.5 mb-2 text-[11px] font-bold">
                          <span className="text-blue-600">{d.prospects}</span>
                          <span className="text-slate-300">/</span>
                          <span className="text-emerald-600">{d.spk}</span>
                        </div>

                        {/* Dual Bar Representation */}
                        <div className="w-full flex items-end justify-center gap-1.5 h-32">
                          {/* Prospects Bar */}
                          <div
                            className={`w-6 rounded-t-lg transition-all ${
                              isSelected ? "bg-blue-600" : "bg-blue-400/80 group-hover:bg-blue-500"
                            }`}
                            style={{ height: `${(d.prospects / 140) * 100}%` }}
                          />
                          {/* SPK Bar */}
                          <div
                            className={`w-6 rounded-t-lg transition-all ${
                              isSelected
                                ? "bg-emerald-600"
                                : "bg-emerald-400/80 group-hover:bg-emerald-500"
                            }`}
                            style={{ height: `${(d.spk / 35) * 100}%` }}
                          />
                        </div>

                        {/* Label */}
                        <span className="text-xs font-semibold text-slate-700 mt-2 text-center">
                          {d.week}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {d.date}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>* Data diupdate otomatis via DMS Central setiap 15 menit.</span>
              <span className="font-semibold text-blue-600">Puncak Konversi: Minggu ke-3</span>
            </div>
          </div>

          {/* Right Col: Top 5 Sales Leaderboard */}
          <div className="rounded-2xl bg-white border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 tracking-tight">
                    Top 5 Sales Advisor
                  </h3>
                  <p className="text-xs text-slate-500">
                    Leaderboard Konversi SPK UjungBatu
                  </p>
                </div>
                <Link
                  href="/admin/team"
                  className="text-xs text-blue-600 font-semibold hover:underline"
                >
                  Semua (14) &rarr;
                </Link>
              </div>

              {/* Leaderboard List */}
              <div className="space-y-3">
                {TOP_SALES_LEADERBOARD.map((item, index) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/50 transition-colors flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Rank Number */}
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                          index === 0
                            ? "bg-amber-100 text-amber-900 border border-amber-300"
                            : index === 1
                            ? "bg-slate-200 text-slate-800"
                            : index === 2
                            ? "bg-amber-700/20 text-amber-900"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {item.rank}
                      </span>

                      <Avatar name={item.name} size="sm" />

                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {item.name}
                        </p>
                        <p className="text-[10px] text-slate-500 font-mono">
                          {item.npk}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-extrabold text-slate-900 block">
                        {item.spk} SPK
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {item.conversionRate}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100">
              <Link
                href="/admin/team"
                className="w-full h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
              >
                <span>Lihat Manajemen Tim & Zonasi</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Funnel Repeat Lead & AI Insight */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Funnel 3 Kolom */}
          <div className="lg:col-span-2 rounded-2xl bg-white border border-slate-200/90 p-5 sm:p-6 shadow-xs">
            <div className="mb-4">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Repeat Lead Funnel (Pola Duplikasi Pelanggan)
              </h3>
              <p className="text-xs text-slate-500">
                Alur pergerakan customer yang melakukan re-engagement atau tercatat ganda.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Step 1 */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Tahap 1: Entry Awal
                </span>
                <p className="text-2xl font-black text-slate-900">428 Lead</p>
                <p className="text-xs text-slate-500 leading-snug">
                  100% prospek pertama kali masuk ke database cabang.
                </p>
              </div>

              {/* Step 2: Amber Highlight */}
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 space-y-2 ring-1 ring-amber-300/60">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider">
                    Tahap 2: Re-Engagement
                  </span>
                  <span className="text-[10px] font-bold bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded">
                    5.4%
                  </span>
                </div>
                <p className="text-2xl font-black text-amber-950">23 Kasus</p>
                <p className="text-xs text-amber-900/90 leading-snug">
                  Nomor HP sama diinput ulang oleh sales lain dalam rentang 30 hari.
                </p>
              </div>

              {/* Step 3 */}
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                    Tahap 3: Deal Terselesaikan
                  </span>
                  <span className="text-[10px] font-bold bg-emerald-200 text-emerald-900 px-1.5 py-0.5 rounded">
                    SPK
                  </span>
                </div>
                <p className="text-2xl font-black text-emerald-900">8 Unit</p>
                <p className="text-xs text-emerald-800/90 leading-snug">
                  Berhasil closing dengan kesepakatan komisi split 50:50 sesuai SOP.
                </p>
              </div>
            </div>
          </div>

          {/* AI Intelligence / Branch Guidance Box */}
          <div className="rounded-2xl bg-gradient-to-br from-blue-900 to-indigo-950 text-white p-5 sm:p-6 shadow-md flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-300 uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span>AI Insight & Rekomendasi Branch</span>
              </div>

              <h4 className="font-extrabold text-base leading-snug text-white">
                Analisis Duplikasi Sektor Sawit UjungBatu
              </h4>

              <p className="text-xs text-blue-100/90 leading-relaxed">
                65% kasus repeat lead terpusat pada pemesanan unit{" "}
                <strong>Hilux Rangga & Hilux 4x4</strong> dari asosiasi perkebunan
                Kecamatan Tandun dan Kunto Darussalam.
              </p>

              <div className="p-3 rounded-xl bg-white/10 border border-white/15 text-xs text-blue-100 space-y-1">
                <p className="font-semibold text-white">
                  SOP Cabang 247 UjungBatu:
                </p>
                <p className="text-[11px] text-blue-200 leading-normal">
                  Jika jeda waktu input antar sales &lt; 30 hari tanpa penutupan SPK,
                  berlakukan mediasi split komisi 50:50 untuk menjaga soliditas tim.
                </p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-blue-300">
              <span>SK Branch Manager No. 12/ATUB/2024</span>
              <span className="font-bold text-white">Aktif</span>
            </div>
          </div>
        </div>

        {/* Bottom Banner with Actions */}
        <div className="rounded-2xl bg-white border border-slate-200/90 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-sm text-slate-900">
              Laporan Operasional & Data Prospek Real-Time
            </h4>
            <p className="text-xs text-slate-500">
              Unduh rekapan komprehensif atau buka tabel lengkap dengan penanda duplikasi.
            </p>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => alert("Mengunduh laporan prospek CSV / Excel...")}
              className="flex-1 sm:flex-initial h-10 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-2 border border-slate-300 transition-colors"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>Export CSV / Excel</span>
            </button>

            <Link
              href="/admin/prospects"
              className="flex-1 sm:flex-initial h-10 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-xs"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Buka Data Prospek Lengkap &rarr;</span>
            </Link>
          </div>
        </div>
      </div>
    </AdminDashboardLayout>
  );
}
