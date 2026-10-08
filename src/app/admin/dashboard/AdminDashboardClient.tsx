"use client";

import React, { useState } from "react";
import Link from "next/link";
import AdminDashboardLayout from "@/components/templates/AdminDashboardLayout";
import MetricCard from "@/components/molecules/MetricCard";
import Avatar from "@/components/atoms/Avatar";
import {
  FileSpreadsheet,
  Download,
  Users,
  Award,
  AlertTriangle,
  Clock,
  Sparkles,
  TrendingUp,
  Layers,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Car,
  Calendar,
} from "lucide-react";

export interface WeeklyDataPoint {
  week: string;
  date: string;
  prospects: number;
  spk: number;
}

export interface SalesLeaderboardItem {
  id: string;
  rank: number;
  name: string;
  npk: string;
  spk: number;
  total: number;
  conversionRate: string;
}

export interface TopModelItem {
  name: string;
  count: number;
}

export interface RecentPlanItem {
  id: string;
  customerName: string;
  unitName: string;
  salesName: string;
  salesNpk: string;
  planDate: string;
  spkStatus: "PENDING" | "BERHASIL" | "BELUM_BERHASIL";
  isDuplicate: boolean;
  isRepeatFailed: boolean;
}

export interface AdminDashboardClientProps {
  totalPlans: number;
  berhasilPlans: number;
  pendingPlans: number;
  belumBerhasilPlans: number;
  duplicatePlans: number;
  repeatFailedPlans: number;
  activeSalesCount: number;
  closingRate: string;
  weeklyData: WeeklyDataPoint[];
  leaderboard: SalesLeaderboardItem[];
  topModels: TopModelItem[];
  recentPlans: RecentPlanItem[];
}

export default function AdminDashboardClient({
  totalPlans,
  berhasilPlans,
  pendingPlans,
  belumBerhasilPlans,
  duplicatePlans,
  repeatFailedPlans,
  activeSalesCount,
  closingRate,
  weeklyData,
  leaderboard,
  topModels,
  recentPlans,
}: AdminDashboardClientProps) {
  const [activeTooltipWeek, setActiveTooltipWeek] = useState<number>(
    weeklyData.length > 0 ? weeklyData.length : 1
  );

  const totalFlagged = duplicatePlans + repeatFailedPlans;
  const duplicateRate =
    totalPlans > 0 ? ((totalFlagged / totalPlans) * 100).toFixed(1) : "0.0";

  // Calculate highest volume in chart for dynamic proportional height scaling
  const maxWeeklyVol = Math.max(
    1,
    ...weeklyData.map((d) => Math.max(d.prospects, d.spk))
  );

  const currentSelectedWeek = weeklyData[activeTooltipWeek - 1] || weeklyData[0];

  const primaryModel = topModels[0]?.name || "Toyota Hilux Rangga";
  const primaryModelCount = topModels[0]?.count || 0;

  return (
    <AdminDashboardLayout
      title="Dashboard Analytics"
      subtitle="Monitoring Rencana SPK H-1 & Realisasi Closing • Cabang UjungBatu"
      duplicateCount={totalFlagged}
      salesCount={activeSalesCount}
    >
      <div className="space-y-6">
        {/* 4 Primary Operational Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total Rencana SPK"
            value={totalPlans}
            subtitle="Akumulasi Target H-1 Masuk"
            icon={<Layers className="w-4 h-4 text-blue-600" />}
            trend={{ value: `${closingRate}% closing`, isPositive: true }}
          />

          <MetricCard
            title="Realisasi SPK Berhasil"
            value={berhasilPlans}
            subtitle="Closing Sah Terverifikasi"
            icon={<Award className="w-4 h-4 text-emerald-600" />}
            trend={{ value: `${berhasilPlans} unit closing`, isPositive: true }}
          />

          <MetricCard
            title="Menunggu Hari H"
            value={pendingPlans}
            subtitle="Menunggu Evaluasi Realisasi"
            icon={<Clock className="w-4 h-4 text-amber-600" />}
          />

          <MetricCard
            title="Duplikasi & Gagal Ulang"
            value={totalFlagged}
            subtitle={`${duplicateRate}% Kasus • Perlu Perhatian`}
            icon={<AlertTriangle className="w-4 h-4 text-amber-700" />}
            isDuplicate={totalFlagged > 0}
          />
        </div>

        {/* Middle Section: Movement Trend Chart & Top 5 Sales Leaderboard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Dual Bar Time-Series Chart */}
          <div className="lg:col-span-2 rounded-2xl bg-white border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div>
                  <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                    <span>Tren Pergerakan Rencana vs Realisasi SPK</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      Bulan Berjalan
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Perbandingan volume target rencana H-1 terhadap unit yang berhasil closing.
                  </p>
                </div>

                {/* Chart Legends */}
                <div className="flex items-center gap-4 text-xs font-semibold">
                  <div className="flex items-center gap-1.5 text-blue-600">
                    <span className="w-3 h-3 rounded-full bg-blue-600" />
                    <span>Rencana SPK</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-600">
                    <span className="w-3 h-3 rounded-full bg-emerald-600" />
                    <span>SPK Berhasil</span>
                  </div>
                </div>
              </div>

              {/* Chart Visual Representation with Active Inspection Pill */}
              <div className="relative pt-2 pb-2">
                {currentSelectedWeek && (
                  <div className="mb-4 p-3 rounded-xl bg-slate-900 text-white flex items-center justify-between text-xs shadow-md">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-blue-400">
                        {currentSelectedWeek.week} ({currentSelectedWeek.date}):
                      </span>
                      <span>{currentSelectedWeek.prospects} Rencana</span>
                      <span>•</span>
                      <span className="text-emerald-400 font-semibold">
                        {currentSelectedWeek.spk} SPK Berhasil
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      Rasio Realisasi:{" "}
                      {currentSelectedWeek.prospects > 0
                        ? (
                            (currentSelectedWeek.spk /
                              currentSelectedWeek.prospects) *
                            100
                          ).toFixed(1)
                        : "0.0"}
                      %
                    </span>
                  </div>
                )}

                {/* Visual Height Scaled Bars */}
                <div className="h-48 w-full flex items-end justify-between gap-3 pt-2 px-2">
                  {weeklyData.map((d, idx) => {
                    const isSelected = activeTooltipWeek === idx + 1;
                    const plansHeight = Math.max(
                      6,
                      Math.round((d.prospects / maxWeeklyVol) * 100)
                    );
                    const spkHeight = Math.max(
                      6,
                      Math.round((d.spk / maxWeeklyVol) * 100)
                    );

                    return (
                      <div
                        key={d.week}
                        onClick={() => setActiveTooltipWeek(idx + 1)}
                        className={`flex-1 flex flex-col items-center justify-end cursor-pointer group transition-all p-2 rounded-xl ${
                          isSelected
                            ? "bg-slate-50 ring-1 ring-blue-200"
                            : "hover:bg-slate-50/50"
                        }`}
                      >
                        {/* Values label */}
                        <div className="flex items-center gap-1.5 mb-2 text-[11px] font-bold">
                          <span className="text-blue-600">{d.prospects}</span>
                          <span className="text-slate-300">/</span>
                          <span className="text-emerald-600">{d.spk}</span>
                        </div>

                        {/* Dual Bar Column */}
                        <div className="w-full flex items-end justify-center gap-1.5 h-28">
                          <div
                            className={`w-6 rounded-t-lg transition-all ${
                              isSelected
                                ? "bg-blue-600"
                                : "bg-blue-400/80 group-hover:bg-blue-500"
                            }`}
                            style={{ height: `${plansHeight}%` }}
                          />
                          <div
                            className={`w-6 rounded-t-lg transition-all ${
                              isSelected
                                ? "bg-emerald-600"
                                : "bg-emerald-400/80 group-hover:bg-emerald-500"
                            }`}
                            style={{ height: `${spkHeight}%` }}
                          />
                        </div>

                        {/* Bottom Label */}
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
              <span>* Data diupdate otomatis via sinkronisasi PostgreSQL.</span>
              <span className="font-semibold text-blue-600">
                Total Realisasi: {berhasilPlans} dari {totalPlans} Rencana
              </span>
            </div>
          </div>

          {/* Top 5 Sales Leaderboard */}
          <div className="rounded-2xl bg-white border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 tracking-tight">
                    Top 5 Sales Advisor
                  </h3>
                  <p className="text-xs text-slate-500">
                    Leaderboard Realisasi SPK UjungBatu
                  </p>
                </div>
                <Link
                  href="/admin/team"
                  className="text-xs text-blue-600 font-semibold hover:underline"
                >
                  Semua ({activeSalesCount}) &rarr;
                </Link>
              </div>

              {/* Leaderboard List */}
              <div className="space-y-2.5">
                {leaderboard.length > 0 ? (
                  leaderboard.map((item, index) => (
                    <div
                      key={item.id}
                      className="p-2.5 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/50 transition-colors flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
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
                  ))
                ) : (
                  <div className="text-center py-6 text-xs text-slate-400">
                    Belum ada data aktivitas sales tercatat.
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100">
              <Link
                href="/admin/team"
                className="w-full h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
              >
                <span>Lihat Seluruh Tim Sales ({activeSalesCount})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Funnel Repeat Lead & Branch Intelligence Box */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Funnel 3 Columns */}
          <div className="lg:col-span-2 rounded-2xl bg-white border border-slate-200/90 p-5 sm:p-6 shadow-xs">
            <div className="mb-4">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Pola Evaluasi & Audit Rencana SPK
              </h3>
              <p className="text-xs text-slate-500">
                Alur pergerakan customer dari target rencana H-1 menuju closing valid dan status duplikasi.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Step 1: Total Plans */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Tahap 1: Target Rencana
                </span>
                <p className="text-2xl font-black text-slate-900">
                  {totalPlans} Unit
                </p>
                <p className="text-xs text-slate-500 leading-snug">
                  100% rencana SPK H-1 tercatat di sistem cabang.
                </p>
              </div>

              {/* Step 2: Duplicate Flagged */}
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 space-y-2 ring-1 ring-amber-300/60">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider">
                    Tahap 2: Duplikat & Ulang
                  </span>
                  <span className="text-[10px] font-bold bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded">
                    {duplicateRate}%
                  </span>
                </div>
                <p className="text-2xl font-black text-amber-950">
                  {totalFlagged} Kasus
                </p>
                <p className="text-xs text-amber-900/90 leading-snug">
                  {duplicatePlans} duplikat nama, {repeatFailedPlans} riwayat gagal penutupan.
                </p>
              </div>

              {/* Step 3: Success Realization */}
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                    Tahap 3: Closing Valid
                  </span>
                  <span className="text-[10px] font-bold bg-emerald-200 text-emerald-900 px-1.5 py-0.5 rounded">
                    {closingRate}%
                  </span>
                </div>
                <p className="text-2xl font-black text-emerald-900">
                  {berhasilPlans} Unit
                </p>
                <p className="text-xs text-emerald-800/90 leading-snug">
                  SPK closing sah yang diverifikasi oleh SPV.
                </p>
              </div>
            </div>
          </div>

          {/* Branch Operational Insight Card */}
          <div className="rounded-2xl bg-gradient-to-br from-blue-900 to-indigo-950 text-white p-5 sm:p-6 shadow-md flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-300 uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span>Insight Operasional Cabang</span>
              </div>

              <h4 className="font-extrabold text-base leading-snug text-white">
                Fokus Unit: {primaryModel}
              </h4>

              <p className="text-xs text-blue-100/90 leading-relaxed">
                Unit dengan rencana closing terbanyak adalah{" "}
                <strong>{primaryModel}</strong> ({primaryModelCount} unit),
                mendominasi permintaan armada dan niaga di wilayah UjungBatu dan Tandun.
              </p>

              {topModels.length > 1 && (
                <div className="p-3 rounded-xl bg-white/10 border border-white/15 text-xs text-blue-100 space-y-1.5">
                  <p className="font-semibold text-white">Distribusi Unit Teratas:</p>
                  <ul className="text-[11px] text-blue-200 space-y-1">
                    {topModels.slice(0, 3).map((m) => (
                      <li key={m.name} className="flex justify-between items-center">
                        <span className="truncate">{m.name}</span>
                        <span className="font-bold text-white shrink-0 ml-2">
                          {m.count} unit
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-blue-300">
              <span>Sistem Pelaporan H-1 (08:00 WIB)</span>
              <span className="font-bold text-white">Aktif</span>
            </div>
          </div>
        </div>

        {/* Live Feed: 5 Rencana Terbaru yang Diinput Sales */}
        <div className="rounded-2xl bg-white border border-slate-200/90 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Aktivitas Rencana SPK Terbaru
              </h3>
              <p className="text-xs text-slate-500">
                5 rencana closing H-1 terakhir yang diinput oleh sales advisor.
              </p>
            </div>

            <Link
              href="/admin/prospects"
              className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1"
            >
              <span>Lihat Semua Rencana</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-3">Nama Pelanggan</th>
                  <th className="py-2.5 px-3">Model Toyota</th>
                  <th className="py-2.5 px-3">Sales Advisor</th>
                  <th className="py-2.5 px-3">Target Hari H</th>
                  <th className="py-2.5 px-3 text-center">Status Realisasi</th>
                  <th className="py-2.5 px-3 text-right">Penanda</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentPlans.length > 0 ? (
                  recentPlans.map((plan) => (
                    <tr
                      key={plan.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        plan.isRepeatFailed || plan.isDuplicate
                          ? "bg-amber-50/40"
                          : ""
                      }`}
                    >
                      <td className="py-3 px-3 font-bold text-slate-900">
                        {plan.customerName}
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-700">
                        {plan.unitName}
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-semibold text-slate-800">
                          {plan.salesName}
                        </span>
                        <span className="text-[10px] text-slate-400 block font-mono">
                          {plan.salesNpk}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-500">
                        {plan.planDate}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {plan.spkStatus === "BERHASIL" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>SPK Berhasil</span>
                          </span>
                        ) : plan.spkStatus === "BELUM_BERHASIL" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
                            <XCircle className="w-3 h-3 text-rose-600" />
                            <span>Belum Berhasil</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>Menunggu</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        {plan.isRepeatFailed ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                            <AlertTriangle className="w-3 h-3 text-amber-700" />
                            <span>Gagal Berulang</span>
                          </span>
                        ) : plan.isDuplicate ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                            Duplikat
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400">Normal</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-6 text-slate-400">
                      Belum ada data rencana yang masuk.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom Operational Action Banner */}
        <div className="rounded-2xl bg-white border border-slate-200/90 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-sm text-slate-900">
              Manajemen & Evaluasi Realisasi Rencana SPK
            </h4>
            <p className="text-xs text-slate-500">
              Buka tabel operasional untuk menentukan status closing SPK (SPV) atau mengisi catatan evaluasi (Admin).
            </p>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <Link
              href="/admin/prospects"
              className="flex-1 sm:flex-initial h-10 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-xs"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Kelola & Verifikasi Realisasi SPK &rarr;</span>
            </Link>
          </div>
        </div>
      </div>
    </AdminDashboardLayout>
  );
}
