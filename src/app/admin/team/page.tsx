"use client";

import React, { useState, useMemo } from "react";
import AdminDashboardLayout from "@/components/templates/AdminDashboardLayout";
import Avatar from "@/components/atoms/Avatar";
import Badge from "@/components/atoms/Badge";
import { SALES_ADVISORS, SalesAdvisor } from "@/lib/mockData";
import {
  Users,
  MapPin,
  Award,
  AlertTriangle,
  Briefcase,
  TrendingUp,
  Search,
  CheckCircle2,
  HelpCircle,
} from "lucide-react";

export default function AdminTeamPage() {
  const [filterTab, setFilterTab] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredAdvisors = useMemo(() => {
    return SALES_ADVISORS.filter((advisor) => {
      const matchSearch =
        advisor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        advisor.npk.toLowerCase().includes(searchQuery.toLowerCase()) ||
        advisor.zone.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchSearch) return false;

      if (filterTab === "TOP") return advisor.conversionRate >= 18;
      if (filterTab === "SAWIT") return advisor.zone.includes("Tandun") || advisor.zone.includes("Kunto");
      if (filterTab === "DISPUTE") return advisor.disputes > 0;

      return true;
    });
  }, [filterTab, searchQuery]);

  return (
    <AdminDashboardLayout
      title="Manajemen Tim Sales"
      subtitle="Monitoring 14 Sales Advisor Cabang UjungBatu & Resolusi Sengketa Lead"
      duplicateCount={3}
    >
      <div className="space-y-6">
        {/* 4 Summary Team Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
              <span>Total Advisor</span>
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-2xl font-black text-slate-900">14 Orang</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Semua bersertifikasi TAM</p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
              <span>Aktif Lapangan</span>
              <MapPin className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-black text-emerald-700">10 Orang</p>
            <p className="text-[11px] text-emerald-600 font-medium mt-0.5">Penetrasi Ring 1-3</p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
              <span>Aktif Showroom</span>
              <Briefcase className="w-4 h-4 text-purple-600" />
            </div>
            <p className="text-2xl font-black text-purple-700">4 Orang</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Walk-in Customer Cabang</p>
          </div>

          {/* Sengketa Lead Box */}
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 shadow-2xs ring-1 ring-amber-300/60">
            <div className="flex items-center justify-between text-xs text-amber-900 font-bold mb-1">
              <span>Sengketa Lead Q4</span>
              <AlertTriangle className="w-4 h-4 text-amber-700" />
            </div>
            <p className="text-2xl font-black text-amber-950">3 Kasus</p>
            <p className="text-[11px] text-amber-800 font-semibold mt-0.5">
              Menunggu Mediasi Branch
            </p>
          </div>
        </div>

        {/* Tab Filters & Search Bar */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setFilterTab("ALL")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all ${
                filterTab === "ALL"
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
              }`}
            >
              Semua (14)
            </button>

            <button
              type="button"
              onClick={() => setFilterTab("TOP")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all ${
                filterTab === "TOP"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
              }`}
            >
              Top Performer
            </button>

            <button
              type="button"
              onClick={() => setFilterTab("SAWIT")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all ${
                filterTab === "SAWIT"
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
              }`}
            >
              Spesialis Sawit
            </button>

            <button
              type="button"
              onClick={() => setFilterTab("DISPUTE")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all ${
                filterTab === "DISPUTE"
                  ? "bg-amber-500 text-amber-950 border-amber-500"
                  : "bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100"
              }`}
            >
              ⚠️ Perlu Resolusi Lead (3)
            </button>
          </div>

          <div className="w-full sm:w-72 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama sales, NPK, zona..."
              className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-300 bg-slate-50 text-xs focus:bg-white focus:border-blue-600 outline-none"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </div>
        </div>

        {/* Sales Advisors Table */}
        <div className="rounded-2xl bg-white border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Sales Advisor</th>
                  <th className="py-3.5 px-4">Zona Wilayah Penetrasi</th>
                  <th className="py-3.5 px-4">Status Shift</th>
                  <th className="py-3.5 px-4">Prospek & SPK</th>
                  <th className="py-3.5 px-4">Pencapaian Target</th>
                  <th className="py-3.5 px-4">Konversi</th>
                  <th className="py-3.5 px-4 text-center">Status Sengketa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAdvisors.map((sa) => (
                  <tr key={sa.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Advisor Info */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={sa.name} size="md" isOnline={sa.status !== "Off Duty / Cuti"} />
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{sa.name}</p>
                          <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                            {sa.npk} • {sa.title}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Zone */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="font-medium text-slate-800 leading-snug">
                        {sa.zone}
                      </p>
                    </td>

                    {/* Shift Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <Badge
                        variant={sa.status === "Aktif Lapangan" ? "ONLINE" : sa.status === "Aktif Showroom" ? "BRANCH" : "OFFLINE"}
                        size="sm"
                        showDot
                      >
                        {sa.status}
                      </Badge>
                    </td>

                    {/* Prospects & SPK */}
                    <td className="py-3.5 px-4 whitespace-nowrap font-medium text-slate-700">
                      <span className="font-bold text-slate-900">{sa.prospectsCount}</span> Prospek /{" "}
                      <span className="font-bold text-emerald-700">{sa.spkCount}</span> SPK
                    </td>

                    {/* Target Progress */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="w-28 space-y-1">
                        <div className="flex justify-between text-[11px] font-semibold">
                          <span>{sa.spkTarget} Unit</span>
                          <span className={sa.targetPct >= 80 ? "text-emerald-700" : "text-blue-600"}>
                            {sa.targetPct}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              sa.targetPct >= 80 ? "bg-emerald-600" : "bg-blue-600"
                            }`}
                            style={{ width: `${Math.min(sa.targetPct, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Conversion Rate */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-bold text-xs px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {sa.conversionRate}%
                      </span>
                    </td>

                    {/* Dispute Status */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      {sa.disputes > 0 ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                          <span>{sa.disputes} Sengketa Lead</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Aman (0)</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 4 Cards for Rokan Hulu Operational Zones */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span>Pemetaan 4 Zonasi Operasional Kabupaten Rokan Hulu</span>
            </h3>
            <span className="text-xs text-slate-500">Radius Coverage: 75 km</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 space-y-1.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded uppercase">
                  Ring 1
                </span>
                <span className="text-xs font-bold text-slate-700">5 Sales</span>
              </div>
              <h4 className="font-extrabold text-slate-900 text-sm">
                Kec. UjungBatu
              </h4>
              <p className="text-[11px] text-slate-500 leading-normal">
                Sentra showroom resmi, pusat perdagangan ruko, PNS & walk-in customer.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 space-y-1.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded uppercase">
                  Ring 2
                </span>
                <span className="text-xs font-bold text-slate-700">4 Sales</span>
              </div>
              <h4 className="font-extrabold text-slate-900 text-sm">
                Kec. Tandun
              </h4>
              <p className="text-[11px] text-slate-500 leading-normal">
                Sentra perkebunan kelapa sawit rakyat, koperasi unit desa (KUD), armada Hilux.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 space-y-1.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded uppercase">
                  Ring 3
                </span>
                <span className="text-xs font-bold text-slate-700">3 Sales</span>
              </div>
              <h4 className="font-extrabold text-slate-900 text-sm">
                Kec. Pasir Pengaraian
              </h4>
              <p className="text-[11px] text-slate-500 leading-normal">
                Ibukota Kabupaten Rokan Hulu, kantor dinas Pemkab, pengadaan unit instansi.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 space-y-1.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded uppercase">
                  Ring 4
                </span>
                <span className="text-xs font-bold text-slate-700">2 Sales</span>
              </div>
              <h4 className="font-extrabold text-slate-900 text-sm">
                Kec. Kunto Darussalam
              </h4>
              <p className="text-[11px] text-slate-500 leading-normal">
                Kawasan Pabrik Kelapa Sawit (PKS), kontraktor logistik, heavy-duty 4x4.
              </p>
            </div>
          </div>
        </div>

        {/* SOP Sengketa Callout Box */}
        <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-2 border border-slate-800 shadow-md">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider">
            <HelpCircle className="w-4 h-4" />
            <span>SOP Mediasi & Resolusi Sengketa Lead (SK Branch No. 12/ATUB/2024)</span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Jika pelanggan pernah dihubungi oleh Sales A kurang dari 30 hari lalu tanpa
            ada SPK, dan kemudian dihubungi kembali oleh Sales B:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-xs text-slate-300">
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80">
              <strong className="text-white block mb-0.5">1. Skenario Overlap &lt; 30 Hari:</strong>
              Komisi SPK dibagi 50% untuk Sales Pertama (pembuka lead) dan 50% untuk Sales Kedua (eksekusi closing).
            </div>
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80">
              <strong className="text-white block mb-0.5">2. Skenario Jeda &gt; 30 Hari (Cold Lead):</strong>
              Lead dinyatakan hangus secara otomatis. Komisi SPK diberikan 100% penuh kepada Sales yang melakukan re-engagement baru.
            </div>
          </div>
        </div>
      </div>
    </AdminDashboardLayout>
  );
}
