"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import AdminDashboardLayout from "@/components/templates/AdminDashboardLayout";
import Avatar from "@/components/atoms/Avatar";
import SearchInput from "@/components/molecules/SearchInput";
import type { SalesTeamMember, SalesTeamPlanItem } from "@/lib/actions/users";
import {
  Users,
  Award,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle,
  FileSpreadsheet,
  Download,
  Phone,
  Car,
  ChevronRight,
  Eye,
  X,
  ExternalLink,
  ShieldCheck,
  Calendar,
} from "lucide-react";

export interface AdminTeamClientProps {
  initialMembers: SalesTeamMember[];
  currentUserRole: "ADMIN" | "SPV";
}

export default function AdminTeamClient({
  initialMembers,
  currentUserRole,
}: AdminTeamClientProps) {
  const [members] = useState<SalesTeamMember[]>(initialMembers);
  const [filterTab, setFilterTab] = useState<"ALL" | "TOP" | "ATTENTION" | "PENDING">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal inspection state for a specific sales advisor's plans
  const [selectedMember, setSelectedMember] = useState<SalesTeamMember | null>(null);

  // Summary Metrics calculations
  const totalSales = members.length;
  const totalPlans = useMemo(
    () => members.reduce((acc, m) => acc + m.stats.total, 0),
    [members]
  );
  const totalBerhasil = useMemo(
    () => members.reduce((acc, m) => acc + m.stats.berhasil, 0),
    [members]
  );
  const totalBelumBerhasil = useMemo(
    () => members.reduce((acc, m) => acc + m.stats.belumBerhasil, 0),
    [members]
  );
  const totalPending = useMemo(
    () => members.reduce((acc, m) => acc + m.stats.pending, 0),
    [members]
  );
  const totalDuplicates = useMemo(
    () => members.reduce((acc, m) => acc + m.stats.duplicates, 0),
    [members]
  );
  const branchConversionRate =
    totalPlans > 0 ? ((totalBerhasil / totalPlans) * 100).toFixed(1) : "0.0";

  // Filtered members list
  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const matchSearch =
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.nip && m.nip.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (m.title && m.title.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchSearch) return false;

      if (filterTab === "TOP") {
        return m.stats.berhasil > 0;
      }
      if (filterTab === "ATTENTION") {
        return m.stats.belumBerhasil > 0 || m.stats.duplicates > 0 || m.stats.repeatFailed > 0;
      }
      if (filterTab === "PENDING") {
        return m.stats.pending > 0;
      }

      return true;
    });
  }, [members, searchQuery, filterTab]);

  // Export Sales Performance to CSV (Compatible with Excel)
  const handleExportCsv = () => {
    const headers = [
      "Peringkat",
      "Nama Sales Advisor",
      "NIP",
      "Jabatan",
      "No Telepon",
      "Total Target Rencana",
      "SPK Berhasil (Closing Sah)",
      "Menunggu Hari H (Pending)",
      "Belum Berhasil",
      "Kasus Duplikat",
      "Gagal Berulang",
      "Rasio Konversi (%)",
    ];

    const rows = filteredMembers.map((m, idx) => {
      const rank = idx + 1;
      const nip = m.nip ? `"${m.nip}"` : `"-"`;
      const title = m.title ? `"${m.title.replace(/"/g, '""')}"` : `"-"`;
      const phone = m.phone ? `"${m.phone}"` : `"-"`;
      return [
        rank,
        `"${m.name.replace(/"/g, '""')}"`,
        nip,
        title,
        phone,
        m.stats.total,
        m.stats.berhasil,
        m.stats.pending,
        m.stats.belumBerhasil,
        m.stats.duplicates,
        m.stats.repeatFailed,
        `"${m.stats.successRate}%"`,
      ].join(",");
    });

    const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const today = new Date().toISOString().split("T")[0];
    link.href = url;
    link.setAttribute("download", `Laporan_Performa_Sales_ATUB_${today}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <AdminDashboardLayout
      title="Manajemen Tim Sales"
      subtitle="Evaluasi Kinerja Sales Advisor & Akuntabilitas Target SPK H-1 Cabang 247"
      duplicateCount={totalDuplicates}
      salesCount={totalSales}
    >
      <div className="space-y-6">
        {/* Header Action Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-black text-slate-900 tracking-tight">
                  Tim Sales Agung Toyota UjungBatu
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  {currentUserRole === "ADMIN" ? "Akses Admin" : "Akses Supervisor (SPV)"}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Monitoring closing harian, konversi prospek, dan konsistensi pelaporan H-1.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handleExportCsv}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-2 transition-colors shadow-2xs cursor-pointer"
              title="Unduh laporan performa sales dalam format file CSV / Excel"
            >
              <Download className="w-4 h-4" />
              <span>Ekspor Kinerja (CSV)</span>
            </button>
          </div>
        </div>

        {/* 5 KPI Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
              <span>Total Advisor</span>
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-2xl font-black text-slate-900 tracking-tight">
              {totalSales} <span className="text-xs font-semibold text-slate-500">Sales</span>
            </p>
            <p className="text-[10px] text-slate-400">Terdaftar aktif di sistem</p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
              <span>Rencana SPK</span>
              <FileSpreadsheet className="w-4 h-4 text-slate-600" />
            </div>
            <p className="text-2xl font-black text-slate-900 tracking-tight">
              {totalPlans} <span className="text-xs font-semibold text-slate-500">Unit</span>
            </p>
            <p className="text-[10px] text-slate-400">Target input sales</p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-xs text-emerald-800 font-semibold">
              <span>Closing Sah</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-black text-emerald-700 tracking-tight">
              {totalBerhasil} <span className="text-xs font-semibold text-emerald-600">SPK</span>
            </p>
            <p className="text-[10px] text-emerald-600 font-medium">Realisasi diverifikasi</p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-xs text-blue-800 font-semibold">
              <span>Rasio Konversi</span>
              <TrendingUp className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-2xl font-black text-blue-700 tracking-tight">
              {branchConversionRate}%
            </p>
            <p className="text-[10px] text-slate-400">Rata-rata cabang 247</p>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 shadow-2xs space-y-1 col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between text-xs text-amber-900 font-bold">
              <span>Catatan Sengketa</span>
              <AlertTriangle className="w-4 h-4 text-amber-700" />
            </div>
            <p className="text-2xl font-black text-amber-950 tracking-tight">
              {totalDuplicates}{" "}
              <span className="text-xs font-semibold text-amber-800">Kasus</span>
            </p>
            <p className="text-[10px] text-amber-800 font-medium">Potensi nama ganda</p>
          </div>
        </div>

        {/* Toolbar: Filter Tabs & Search Bar */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setFilterTab("ALL")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${filterTab === "ALL"
                  ? "bg-slate-900 text-white shadow-2xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
            >
              Semua ({totalSales})
            </button>

            <button
              type="button"
              onClick={() => setFilterTab("TOP")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${filterTab === "TOP"
                  ? "bg-emerald-600 text-white shadow-2xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
            >
              Top Performer ({members.filter((m) => m.stats.berhasil > 0).length})
            </button>

            <button
              type="button"
              onClick={() => setFilterTab("ATTENTION")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${filterTab === "ATTENTION"
                  ? "bg-amber-500 text-amber-950 shadow-2xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
            >
              Perlu Perhatian (
              {
                members.filter(
                  (m) =>
                    m.stats.belumBerhasil > 0 ||
                    m.stats.duplicates > 0 ||
                    m.stats.repeatFailed > 0
                ).length
              }
              )
            </button>

            <button
              type="button"
              onClick={() => setFilterTab("PENDING")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${filterTab === "PENDING"
                  ? "bg-blue-600 text-white shadow-2xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
            >
              Ada Pending ({members.filter((m) => m.stats.pending > 0).length})
            </button>
          </div>

          <div className="w-full sm:w-72">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Cari nama sales, NIP, jabatan..."
            />
          </div>
        </div>

        {/* Sales Performance Leaderboard Table */}
        <div className="rounded-2xl bg-white border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/90 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4 text-center w-12">Peringkat</th>
                  <th className="py-3.5 px-4">Sales Advisor</th>
                  <th className="py-3.5 px-4">Kontak</th>
                  <th className="py-3.5 px-4 text-center">Total Rencana</th>
                  <th className="py-3.5 px-4 text-center">Closing Sah</th>
                  <th className="py-3.5 px-4 text-center">Menunggu</th>
                  <th className="py-3.5 px-4 text-center">Belum Berhasil</th>
                  <th className="py-3.5 px-4">Konversi</th>
                  <th className="py-3.5 px-4 text-center">Catatan</th>
                  <th className="py-3.5 px-4 text-center w-28">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMembers.length > 0 ? (
                  filteredMembers.map((member, index) => {
                    const rank = index + 1;
                    const isTop1 = rank === 1 && member.stats.berhasil > 0;
                    const isTop2 = rank === 2 && member.stats.berhasil > 0;
                    const isTop3 = rank === 3 && member.stats.berhasil > 0;

                    return (
                      <tr
                        key={member.id}
                        className={`transition-colors hover:bg-slate-50/80 ${isTop1 ? "bg-amber-50/20" : ""
                          }`}
                      >
                        {/* Rank Badge */}
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          {isTop1 ? (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-400 text-amber-950 font-black text-xs shadow-2xs">
                              1
                            </span>
                          ) : isTop2 ? (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-300 text-slate-800 font-bold text-xs">
                              2
                            </span>
                          ) : isTop3 ? (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-700 text-white font-bold text-xs">
                              3
                            </span>
                          ) : (
                            <span className="text-slate-400 font-semibold">{rank}</span>
                          )}
                        </td>

                        {/* Advisor Profile */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <Avatar name={member.name} size="md" isOnline={member.isActive} />
                            <div>
                              <div className="flex items-center gap-1.5">
                                <p className="font-bold text-slate-900 text-sm">{member.name}</p>
                                {isTop1 && (
                                  <Award className="w-4 h-4 text-amber-500 shrink-0" />
                                )}
                              </div>
                              <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                                {member.nip || "SALES-ATUB"} • {member.title || "Sales Executive"}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Contact */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {member.phone ? (
                            <a
                              href={`https://wa.me/${member.phone.replace(/[^0-9]/g, "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-slate-600 hover:text-emerald-700 font-mono text-[11px] transition-colors"
                              title="Hubungi via WhatsApp"
                            >
                              <Phone className="w-3 h-3 text-emerald-600" />
                              <span>{member.phone}</span>
                            </a>
                          ) : (
                            <span className="text-slate-400 text-[11px] italic">-</span>
                          )}
                        </td>

                        {/* Total Plans */}
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <span className="font-extrabold text-slate-800 text-sm">
                            {member.stats.total}
                          </span>
                          <span className="text-[10px] text-slate-400 ml-1">Unit</span>
                        </td>

                        {/* Closing Sah (Berhasil) */}
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <span className="inline-flex items-center justify-center min-w-[32px] px-2 py-0.5 rounded-full font-bold text-xs bg-emerald-100 text-emerald-900 border border-emerald-300">
                            {member.stats.berhasil}
                          </span>
                        </td>

                        {/* Pending */}
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          {member.stats.pending > 0 ? (
                            <span className="inline-flex items-center justify-center min-w-[32px] px-2 py-0.5 rounded-full font-bold text-xs bg-amber-100 text-amber-900 border border-amber-300">
                              {member.stats.pending}
                            </span>
                          ) : (
                            <span className="text-slate-400 font-mono">0</span>
                          )}
                        </td>

                        {/* Belum Berhasil */}
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          {member.stats.belumBerhasil > 0 ? (
                            <span className="inline-flex items-center justify-center min-w-[32px] px-2 py-0.5 rounded-full font-bold text-xs bg-rose-100 text-rose-900 border border-rose-300">
                              {member.stats.belumBerhasil}
                            </span>
                          ) : (
                            <span className="text-slate-400 font-mono">0</span>
                          )}
                        </td>

                        {/* Conversion Rate */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="w-28 space-y-1">
                            <div className="flex justify-between text-[11px] font-bold">
                              <span
                                className={
                                  parseFloat(member.stats.successRate) >= 50
                                    ? "text-emerald-700"
                                    : "text-slate-700"
                                }
                              >
                                {member.stats.successRate}%
                              </span>
                              <span className="text-[10px] text-slate-400 font-normal">
                                {member.stats.berhasil}/{member.stats.total}
                              </span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${parseFloat(member.stats.successRate) >= 50
                                    ? "bg-emerald-600"
                                    : parseFloat(member.stats.successRate) > 0
                                      ? "bg-blue-600"
                                      : "bg-slate-300"
                                  }`}
                                style={{
                                  width: `${Math.min(
                                    parseFloat(member.stats.successRate),
                                    100
                                  )}%`,
                                }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Notes / Disputes */}
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          {member.stats.duplicates > 0 ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-950 border border-amber-300">
                              <AlertTriangle className="w-3 h-3 text-amber-700" />
                              <span>{member.stats.duplicates} Duplikat</span>
                            </span>
                          ) : member.stats.repeatFailed > 0 ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-950 border border-rose-300">
                              <span>{member.stats.repeatFailed} Gagal Ulang</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                              <span>Normal</span>
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setSelectedMember(member)}
                              className="px-2.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold inline-flex items-center gap-1 transition-colors border border-blue-200 cursor-pointer shadow-2xs"
                              title="Tinjau detail rencana SPK sales ini"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Lihat</span>
                            </button>

                            <Link
                              href={`/admin/prospects?sales=${member.id}`}
                              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                              title="Buka di tabel rencana SPK"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={10} className="text-center py-12 text-slate-400 space-y-2">
                      <Users className="w-8 h-8 text-slate-300 mx-auto" />
                      <p className="font-semibold text-xs text-slate-600">
                        Tidak ada sales advisor yang cocok dengan filter.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery("");
                          setFilterTab("ALL");
                        }}
                        className="text-xs text-blue-600 font-bold hover:underline cursor-pointer"
                      >
                        Reset pencarian & filter
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Operational SOP Policy Box for Branch 247 */}
        {/* <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-3 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>SOP Evaluasi Pelaporan H-1 & Mediasi Sengketa Cabang 247</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">SK/ATUB/2024/09</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-300 pt-1">
            <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-1">
              <strong className="text-white block font-bold">1. Cut-off Input H-1 (08:00 WIB)</strong>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Seluruh sales advisor wajib menginput target closing paling lambat pukul 08:00 WIB hari target SPK. Rencana yang diinput setelahnya masuk ke evaluasi khusus SPV.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-1">
              <strong className="text-white block font-bold">2. Penentuan Realisasi (SPV)</strong>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Supervisor memvalidasi bukti fisik/digital SPK (tanda jadi & berkas). Status hanya dapat diubah menjadi BERHASIL atau BELUM_BERHASIL oleh SPV atau Admin.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-1">
              <strong className="text-white block font-bold">3. Catatan Evaluasi (Admin Only)</strong>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Kendala operasional (berkas leasing, unit indent, negosiasi diskon) dicatat eksklusif oleh Admin pada kolom evaluasi untuk diteruskan ke Branch Manager.
              </p>
            </div>
          </div>
        </div> */}
      </div>

      {/* Quick Inspection Modal for Sales Plans */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
            onClick={() => setSelectedMember(null)}
          />

          <div className="relative z-10 w-full max-w-2xl rounded-2xl bg-white border border-slate-200 shadow-2xl p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <Avatar name={selectedMember.name} size="md" />
                <div>
                  <h3 className="text-base font-black text-slate-900 tracking-tight">
                    {selectedMember.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    {selectedMember.nip || "SALES-ATUB"} • {selectedMember.title || "Sales Executive"} • {selectedMember.phone || "-"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedMember(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 font-semibold block uppercase">
                  Total Target
                </span>
                <span className="text-lg font-black text-slate-900">
                  {selectedMember.stats.total}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
                <span className="text-[10px] text-emerald-800 font-semibold block uppercase">
                  Closing Sah
                </span>
                <span className="text-lg font-black text-emerald-700">
                  {selectedMember.stats.berhasil}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200">
                <span className="text-[10px] text-amber-800 font-semibold block uppercase">
                  Pending
                </span>
                <span className="text-lg font-black text-amber-800">
                  {selectedMember.stats.pending}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200">
                <span className="text-[10px] text-blue-800 font-semibold block uppercase">
                  Konversi
                </span>
                <span className="text-lg font-black text-blue-700">
                  {selectedMember.stats.successRate}%
                </span>
              </div>
            </div>

            {/* Plans List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Daftar Rencana SPK Terdaftar ({selectedMember.planSpks.length})
                </h4>
                <Link
                  href={`/admin/prospects?sales=${selectedMember.id}`}
                  className="text-xs font-bold text-blue-600 hover:underline inline-flex items-center gap-1"
                >
                  <span>Buka di Tabel Utama</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="max-h-64 overflow-y-auto space-y-2 pr-1 divide-y divide-slate-100">
                {selectedMember.planSpks.length > 0 ? (
                  selectedMember.planSpks.map((plan: SalesTeamPlanItem) => {
                    const planDateStr = new Date(plan.planDate).toLocaleDateString(
                      "id-ID",
                      {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      }
                    );

                    return (
                      <div
                        key={plan.id}
                        className="p-3 rounded-xl bg-slate-50/70 border border-slate-200/80 flex items-start justify-between gap-3 text-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">
                              {plan.customerName}
                            </span>
                            {plan.isDuplicate && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                                Duplikat
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-[11px] text-slate-500">
                            <span className="inline-flex items-center gap-1">
                              <Car className="w-3 h-3 text-blue-600" />
                              <strong className="text-slate-700">{plan.unitName}</strong>
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              <span>Target: {planDateStr}</span>
                            </span>
                          </div>
                          {plan.keterangan && (
                            <p className="text-[10px] text-slate-600 italic bg-white p-1.5 rounded border border-slate-200 mt-1">
                              Catatan Evaluasi: &quot;{plan.keterangan}&quot;
                            </p>
                          )}
                        </div>

                        {/* Status Badge */}
                        <div className="shrink-0">
                          {plan.spkStatus === "BERHASIL" ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                              <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                              <span>Berhasil</span>
                            </span>
                          ) : plan.spkStatus === "BELUM_BERHASIL" ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-900 border border-rose-300">
                              <XCircle className="w-3 h-3 text-rose-700" />
                              <span>Belum Berhasil</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                              <Clock className="w-3 h-3 text-amber-700" />
                              <span>Menunggu</span>
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-center py-6 text-xs text-slate-400 italic">
                    Belum ada rencana SPK yang terdaftar untuk sales ini.
                  </p>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedMember(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminDashboardLayout>
  );
}
