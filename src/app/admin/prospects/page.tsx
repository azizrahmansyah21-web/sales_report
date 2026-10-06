"use client";

import React, { useState, useMemo } from "react";
import AdminDashboardLayout from "@/components/templates/AdminDashboardLayout";
import TimelineJourneyDrawer from "@/components/organisms/TimelineJourneyDrawer";
import Badge from "@/components/atoms/Badge";
import DuplicateBadge from "@/components/atoms/DuplicateBadge";
import SearchInput from "@/components/molecules/SearchInput";
import {
  MOCK_PROSPECTS_TABLE,
  MOCK_TIMELINE_BAMBANG,
  ProspectTableRow,
  TimelineDrawerData,
  TOYOTA_MODELS,
} from "@/lib/mockData";
import {
  Download,
  Filter,
  Eye,
  AlertTriangle,
  Layers,
  ChevronLeft,
  ChevronRight,
  Calendar,
} from "lucide-react";

export default function AdminProspectsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSales, setSelectedSales] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [onlyDuplicates, setOnlyDuplicates] = useState(false);

  // Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerData, setDrawerData] =
    useState<TimelineDrawerData | null>(MOCK_TIMELINE_BAMBANG);

  const openDrawerForProspect = (prospect: ProspectTableRow) => {
    // If it's Bambang Sudiro, show full 3-step timeline, or adapt for others
    if (prospect.customerName.includes("Bambang")) {
      setDrawerData(MOCK_TIMELINE_BAMBANG);
    } else {
      setDrawerData({
        prospectId: prospect.id,
        customerName: prospect.customerName,
        customerPhone: prospect.customerPhone,
        location: prospect.customerLocation || "UjungBatu, Rokan Hulu",
        duplicateCount: prospect.duplicateFrequency || 2,
        touchpoints: [
          {
            id: "tp-1",
            stepNumber: 1,
            stepTitle: "Pendaftaran Minat Awal",
            date: "Bulan lalu",
            vehicle: prospect.unitName,
            description: "Pernah kontak pertama kali untuk informasi unit promo.",
            salesName: "Rian Pratama",
            salesNpk: "NPK-ATUB-202204",
            statusBadge: "Prospek Awal",
            statusColor: "blue",
          },
          {
            id: "tp-2",
            stepNumber: 2,
            stepTitle: "Kunjungan & Pengajuan SPK",
            date: prospect.dateTime,
            vehicle: prospect.unitName,
            description: prospect.notes || "Input lanjutan di sistem cabang.",
            salesName: prospect.salesName,
            salesNpk: prospect.salesNpk || "NPK-ATUB-202108",
            statusBadge: "Follow Up",
            statusColor: "amber",
          },
        ],
      });
    }
    setIsDrawerOpen(true);
  };

  // Filter prospects
  const filteredData = useMemo(() => {
    return MOCK_PROSPECTS_TABLE.filter((row) => {
      const matchSearch =
        row.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        row.customerPhone.includes(searchQuery) ||
        row.unitName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        row.salesName.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchSearch) return false;
      if (onlyDuplicates && !row.isDuplicate) return false;
      if (selectedSales !== "ALL" && row.salesName !== selectedSales) return false;
      if (selectedStatus !== "ALL" && row.status !== selectedStatus) return false;

      return true;
    });
  }, [searchQuery, onlyDuplicates, selectedSales, selectedStatus]);

  return (
    <AdminDashboardLayout
      title="Data Prospek & Deteksi Duplikasi"
      subtitle="Database Minat Pelanggan & Audit Trail Cabang UjungBatu (428 Prospek)"
      duplicateCount={3}
    >
      <div className="space-y-6">
        {/* 6 Quick Summary Metric Boxes */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Prospek
            </span>
            <p className="text-xl font-black text-slate-900 mt-1">428</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Semua data</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">
              Lead Baru
            </span>
            <p className="text-xl font-black text-blue-700 mt-1">142</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Belum dihubungi</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
            <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block">
              Follow-Up
            </span>
            <p className="text-xl font-black text-amber-700 mt-1">184</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Sedang diproses</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">
              Deal Closing
            </span>
            <p className="text-xl font-black text-emerald-700 mt-1">86</p>
            <p className="text-[10px] text-emerald-600 font-medium mt-0.5">SPK Valid</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
            <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider block">
              Lost
            </span>
            <p className="text-xl font-black text-red-700 mt-1">16</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Batal / Unit lain</p>
          </div>

          {/* Duplicates Metric Box (Prominent Amber Mode) */}
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 shadow-2xs ring-1 ring-amber-300/60">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider">
                Duplikat
              </span>
              <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
            </div>
            <p className="text-xl font-black text-amber-950 mt-1">23</p>
            <p className="text-[10px] text-amber-800 font-semibold mt-0.5">5.4% Kasus Ganda</p>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="w-full lg:w-96">
              <SearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Cari pelanggan, nomor HP, unit, sales..."
              />
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Sales Filter */}
              <select
                value={selectedSales}
                onChange={(e) => setSelectedSales(e.target.value)}
                className="h-11 px-3 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-700 outline-none focus:border-blue-600"
              >
                <option value="ALL">Semua Sales (14 Advisor)</option>
                <option value="Bagus Triyanto">Bagus Triyanto</option>
                <option value="Rian Pratama">Rian Pratama</option>
                <option value="Siti Nurhaliza">Siti Nurhaliza</option>
                <option value="Deni Kurniawan">Deni Kurniawan</option>
                <option value="Hendra Wijaya">Hendra Wijaya</option>
              </select>

              {/* Status Filter */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="h-11 px-3 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-700 outline-none focus:border-blue-600"
              >
                <option value="ALL">Semua Status</option>
                <option value="NEW">Baru</option>
                <option value="FOLLOW_UP">Follow Up</option>
                <option value="DEAL">Deal (SPK)</option>
                <option value="LOST">Lost</option>
              </select>

              {/* Duplicate Checkbox Toggle */}
              <label
                className={`h-11 px-3 rounded-xl border flex items-center gap-2 cursor-pointer text-xs font-bold transition-all select-none ${
                  onlyDuplicates
                    ? "bg-amber-100 border-amber-400 text-amber-950 shadow-2xs"
                    : "bg-amber-50/60 border-amber-200 text-amber-800 hover:bg-amber-100/60"
                }`}
              >
                <input
                  type="checkbox"
                  checked={onlyDuplicates}
                  onChange={(e) => setOnlyDuplicates(e.target.checked)}
                  className="rounded border-amber-400 text-amber-600 focus:ring-amber-500"
                />
                <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                <span>Hanya Duplikat (23)</span>
              </label>

              {/* Export Buttons */}
              <button
                type="button"
                onClick={() => alert("Mengekspor data ke format Excel (.xlsx)...")}
                className="h-11 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Excel</span>
              </button>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="rounded-2xl bg-white border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Waktu & Tanggal</th>
                  <th className="py-3.5 px-4">Customer & Lokasi</th>
                  <th className="py-3.5 px-4">Nomor HP</th>
                  <th className="py-3.5 px-4">Model Unit Toyota</th>
                  <th className="py-3.5 px-4">Sales Advisor</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Deteksi Duplikasi</th>
                  <th className="py-3.5 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredData.map((row) => {
                  const isDup = row.isDuplicate;

                  return (
                    <tr
                      key={row.id}
                      onClick={() => openDrawerForProspect(row)}
                      className={`cursor-pointer transition-colors group ${
                        isDup
                          ? "bg-amber-50/70 hover:bg-amber-100/70 border-l-4 border-l-amber-500"
                          : "hover:bg-slate-50/80"
                      }`}
                    >
                      {/* Date & Time */}
                      <td className="py-3.5 px-4 font-mono text-slate-600 whitespace-nowrap">
                        {row.dateTime}
                      </td>

                      {/* Customer Name & Location */}
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {row.customerName}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {row.customerLocation || "UjungBatu"}
                        </p>
                      </td>

                      {/* Phone */}
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-800 whitespace-nowrap">
                        {row.customerPhone}
                      </td>

                      {/* Vehicle Unit */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="font-semibold text-slate-800 truncate">
                          {row.unitName}
                        </p>
                        {row.notes && (
                          <p className="text-[10px] text-slate-400 truncate italic">
                            &quot;{row.notes}&quot;
                          </p>
                        )}
                      </td>

                      {/* Sales Advisor */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <p className="font-bold text-slate-800">{row.salesName}</p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {row.salesNpk}
                        </p>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <Badge variant={row.status} size="sm">
                          {row.status === "NEW" && "BARU"}
                          {row.status === "FOLLOW_UP" && "FOLLOW UP"}
                          {row.status === "DEAL" && "DEAL"}
                          {row.status === "LOST" && "LOST"}
                        </Badge>
                      </td>

                      {/* Duplicate Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {isDup ? (
                          <DuplicateBadge
                            frequency={row.duplicateFrequency || 2}
                            size="sm"
                          />
                        ) : (
                          <span className="text-[11px] text-slate-400 font-medium">
                            —
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openDrawerForProspect(row);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold inline-flex items-center gap-1 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Journey</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Footer Pagination */}
          <div className="p-4 border-t border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <span>
              Menampilkan <strong>{filteredData.length}</strong> dari <strong>428</strong> data prospek
            </span>

            <div className="flex items-center gap-1">
              <button
                type="button"
                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                disabled
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 py-1 text-xs font-semibold bg-blue-600 text-white rounded-lg">
                1
              </span>
              <button
                type="button"
                className="px-3 py-1 text-xs rounded-lg hover:bg-slate-200/60"
              >
                2
              </button>
              <button
                type="button"
                className="px-3 py-1 text-xs rounded-lg hover:bg-slate-200/60"
              >
                3
              </button>
              <button
                type="button"
                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Slide-over Audit Trail Drawer */}
      <TimelineJourneyDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        data={drawerData}
      />
    </AdminDashboardLayout>
  );
}
