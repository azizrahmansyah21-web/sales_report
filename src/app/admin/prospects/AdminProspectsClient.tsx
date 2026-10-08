"use client";

import React, { useState, useMemo, useTransition } from "react";
import Link from "next/link";
import AdminDashboardLayout from "@/components/templates/AdminDashboardLayout";
import SearchInput from "@/components/molecules/SearchInput";
import TimelineJourneyDrawer, {
  TimelineDrawerPlanItem,
} from "@/components/organisms/TimelineJourneyDrawer";
import {
  updateSpkStatus,
  updateKeterangan,
  getCustomerHistory,
} from "@/lib/actions/planSpk";
import type { SpkStatus } from "@prisma/client";
import {
  Download,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  Lock,
  Edit3,
  Calendar,
  Layers,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  User,
  Shield,
  Save,
  X,
  History,
} from "lucide-react";

export interface PlanWithSalesUser {
  id: string;
  customerName: string;
  unitName: string;
  planDate: string | Date;
  spkStatus: SpkStatus;
  keterangan: string | null;
  isDuplicate: boolean;
  isRepeatFailed: boolean;
  createdAt: string | Date;
  sales: {
    id: string;
    name: string;
    nip: string | null;
    title: string | null;
  };
}

export interface AdminProspectsClientProps {
  initialPlans: PlanWithSalesUser[];
  salesUsers: Array<{ id: string; name: string; nip: string | null }>;
  currentUserRole: "ADMIN" | "SPV";
}

export default function AdminProspectsClient({
  initialPlans,
  salesUsers,
  currentUserRole,
}: AdminProspectsClientProps) {
  const [plans, setPlans] = useState<PlanWithSalesUser[]>(initialPlans);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSalesId, setSelectedSalesId] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [onlyFlagged, setOnlyFlagged] = useState(false);

  const [isPending, startTransition] = useTransition();
  const [actionError, setActionError] = useState<string | null>(null);

  // Modal state for Admin editing Keterangan
  const [keteranganModal, setKeteranganModal] = useState<{
    isOpen: boolean;
    planId: string;
    customerName: string;
    unitName: string;
    currentValue: string;
  }>({
    isOpen: false,
    planId: "",
    customerName: "",
    unitName: "",
    currentValue: "",
  });

  // Drawer state for inspecting full Customer Journey history
  const [drawerState, setDrawerState] = useState<{
    isOpen: boolean;
    customerName: string;
    plans: TimelineDrawerPlanItem[];
    isLoading: boolean;
  }>({
    isOpen: false,
    customerName: "",
    plans: [],
    isLoading: false,
  });

  const openCustomerAudit = async (customerName: string) => {
    const localMatches: TimelineDrawerPlanItem[] = plans
      .filter(
        (p) => p.customerName.toLowerCase() === customerName.toLowerCase()
      )
      .map((p) => ({
        ...p,
        sales: {
          ...p.sales,
          phone: null,
        },
      }));

    setDrawerState({
      isOpen: true,
      customerName,
      plans: localMatches,
      isLoading: true,
    });

    const res = await getCustomerHistory(customerName);
    if (res.success && res.data) {
      const formatted: TimelineDrawerPlanItem[] = res.data.map((item) => ({
        id: item.id,
        customerName: item.customerName,
        unitName: item.unitName,
        planDate: item.planDate,
        spkStatus: item.spkStatus,
        keterangan: item.keterangan,
        isDuplicate: item.isDuplicate,
        isRepeatFailed: item.isRepeatFailed,
        createdAt: item.createdAt,
        sales: {
          id: item.sales.id,
          name: item.sales.name,
          nip: item.sales.nip,
          title: item.sales.title,
          phone: item.sales.phone,
        },
      }));

      setDrawerState((prev) => ({
        ...prev,
        plans: formatted,
        isLoading: false,
      }));
    } else {
      setDrawerState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  // Calculate real metrics from current dataset
  const metrics = useMemo(() => {
    let pending = 0;
    let berhasil = 0;
    let belumBerhasil = 0;
    let duplicate = 0;
    let repeatFailed = 0;

    for (const p of plans) {
      if (p.spkStatus === "PENDING") pending++;
      else if (p.spkStatus === "BERHASIL") berhasil++;
      else if (p.spkStatus === "BELUM_BERHASIL") belumBerhasil++;

      if (p.isDuplicate) duplicate++;
      if (p.isRepeatFailed) repeatFailed++;
    }

    return {
      total: plans.length,
      pending,
      berhasil,
      belumBerhasil,
      duplicate,
      repeatFailed,
      totalFlagged: duplicate + repeatFailed,
    };
  }, [plans]);

  // Filter plans based on search, sales, status, and duplicate flag
  const filteredPlans = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return plans.filter((p) => {
      const matchSearch =
        q === "" ||
        p.customerName.toLowerCase().includes(q) ||
        p.unitName.toLowerCase().includes(q) ||
        p.sales.name.toLowerCase().includes(q);

      if (!matchSearch) return false;

      if (selectedSalesId !== "ALL" && p.sales.id !== selectedSalesId) {
        return false;
      }

      if (selectedStatus !== "ALL" && p.spkStatus !== selectedStatus) {
        return false;
      }

      if (onlyFlagged && !p.isDuplicate && !p.isRepeatFailed) {
        return false;
      }

      return true;
    });
  }, [plans, searchQuery, selectedSalesId, selectedStatus, onlyFlagged]);

  // Handle SPK Status change (Authorized for both Admin & SPV)
  const handleStatusChange = async (planId: string, newStatus: SpkStatus) => {
    setActionError(null);

    // Optimistic UI update
    setPlans((prev) =>
      prev.map((item) =>
        item.id === planId ? { ...item, spkStatus: newStatus } : item
      )
    );

    startTransition(async () => {
      const res = await updateSpkStatus(planId, { spkStatus: newStatus });
      if (!res.success) {
        setActionError(res.error);
        // Rollback on failure
        setPlans(initialPlans);
      }
    });
  };

  // Handle Keterangan update (Authorized exclusively for Admin)
  const handleSaveKeterangan = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);

    const { planId, currentValue } = keteranganModal;

    // Optimistic UI update
    setPlans((prev) =>
      prev.map((item) =>
        item.id === planId
          ? { ...item, keterangan: currentValue.trim() || null }
          : item
      )
    );

    setKeteranganModal((prev) => ({ ...prev, isOpen: false }));

    startTransition(async () => {
      const res = await updateKeterangan(planId, {
        keterangan: currentValue.trim() || undefined,
      });
      if (!res.success) {
        setActionError(res.error);
        setPlans(initialPlans);
      }
    });
  };

  // Quick export CSV helper
  const handleExportCSV = () => {
    const headers = [
      "No",
      "Tanggal Plan (Hari H)",
      "Nama Pelanggan",
      "Model Toyota",
      "Sales Advisor",
      "NPK Sales",
      "Status Realisasi",
      "Duplikat",
      "Gagal Berulang",
      "Catatan Evaluasi",
    ];

    const rows = filteredPlans.map((p, idx) => {
      const dateStr = new Date(p.planDate).toLocaleDateString("id-ID");
      return [
        idx + 1,
        `"${dateStr}"`,
        `"${p.customerName.replace(/"/g, '""')}"`,
        `"${p.unitName.replace(/"/g, '""')}"`,
        `"${p.sales.name.replace(/"/g, '""')}"`,
        `"${p.sales.nip || "-"}"`,
        `"${p.spkStatus}"`,
        p.isDuplicate ? "Ya" : "Tidak",
        p.isRepeatFailed ? "Ya" : "Tidak",
        `"${(p.keterangan || "").replace(/"/g, '""')}"`,
      ].join(",");
    });

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(","), ...rows].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `Laporan_SPK_H1_AgungToyota_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AdminDashboardLayout
      title="Data Rencana SPK H-1"
      subtitle={`Verifikasi Realisasi Closing & Evaluasi Operasional Cabang (${plans.length} Rencana Terdaftar)`}
      duplicateCount={metrics.totalFlagged}
      salesCount={salesUsers.length}
    >
      <div className="space-y-6">
        {/* Role Notice Banner */}
        <div className="rounded-2xl bg-white border border-slate-200 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                currentUserRole === "ADMIN"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-purple-100 text-purple-700"
              }`}
            >
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-slate-800">
                  Hak Akses: {currentUserRole === "ADMIN" ? "Branch Admin" : "Supervisor SPV"}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    currentUserRole === "ADMIN"
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "bg-purple-50 text-purple-700 border border-purple-200"
                  }`}
                >
                  {currentUserRole === "ADMIN"
                    ? "Full Access (Status & Keterangan)"
                    : "Review Access (Ubah Status Saja)"}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {currentUserRole === "ADMIN"
                  ? "Anda dapat mengubah status SPK serta mengisi atau merevisi catatan evaluasi operasional."
                  : "Anda berwenang menentukan status realisasi SPK (Berhasil / Belum Berhasil). Catatan keterangan dikelola oleh Admin."}
              </p>
            </div>
          </div>

          {actionError && (
            <div className="p-2.5 rounded-xl bg-red-50 text-red-700 border border-red-200 text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{actionError}</span>
            </div>
          )}
        </div>

        {/* 6 Quick Summary Metric Boxes */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Total Rencana
            </span>
            <p className="text-xl font-black text-slate-900 mt-1">{metrics.total}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Unit terdaftar</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
            <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block">
              Menunggu
            </span>
            <p className="text-xl font-black text-amber-700 mt-1">{metrics.pending}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Menunggu Hari H</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">
              SPK Berhasil
            </span>
            <p className="text-xl font-black text-emerald-700 mt-1">{metrics.berhasil}</p>
            <p className="text-[10px] text-emerald-600 font-medium mt-0.5">Closing Sah</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
            <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider block">
              Belum Berhasil
            </span>
            <p className="text-xl font-black text-rose-700 mt-1">{metrics.belumBerhasil}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Tertunda closing</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Duplikat
            </span>
            <p className="text-xl font-black text-slate-800 mt-1">{metrics.duplicate}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Nama sama</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 shadow-2xs ring-1 ring-amber-300/60">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider">
                Gagal Ulang
              </span>
              <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
            </div>
            <p className="text-xl font-black text-amber-950 mt-1">{metrics.repeatFailed}</p>
            <p className="text-[10px] text-amber-800 font-semibold mt-0.5">Prioritas Evaluasi</p>
          </div>
        </div>

        {/* Filter & Search Toolbar */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="w-full lg:w-96">
              <SearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Cari pelanggan, model unit, sales..."
              />
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Sales Advisor Dropdown Filter */}
              <select
                value={selectedSalesId}
                onChange={(e) => setSelectedSalesId(e.target.value)}
                className="h-11 px-3 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-700 outline-none focus:border-blue-600"
              >
                <option value="ALL">Semua Sales ({salesUsers.length} Advisor)</option>
                {salesUsers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} {s.nip ? `(${s.nip})` : ""}
                  </option>
                ))}
              </select>

              {/* Status Realisasi Filter */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="h-11 px-3 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-700 outline-none focus:border-blue-600"
              >
                <option value="ALL">Semua Status SPK</option>
                <option value="PENDING">Menunggu Hari H</option>
                <option value="BERHASIL">SPK Berhasil</option>
                <option value="BELUM_BERHASIL">Belum Berhasil</option>
              </select>

              {/* Flagged Filter Toggle */}
              <label
                className={`h-11 px-3 rounded-xl border flex items-center gap-2 cursor-pointer text-xs font-bold transition-all select-none ${
                  onlyFlagged
                    ? "bg-amber-100 border-amber-400 text-amber-950 shadow-2xs"
                    : "bg-amber-50/60 border-amber-200 text-amber-800 hover:bg-amber-100/60"
                }`}
              >
                <input
                  type="checkbox"
                  checked={onlyFlagged}
                  onChange={(e) => setOnlyFlagged(e.target.checked)}
                  className="rounded border-amber-400 text-amber-600 focus:ring-amber-500"
                />
                <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                <span>Hanya Duplikat ({metrics.totalFlagged})</span>
              </label>

              {/* CSV Export Button */}
              <button
                type="button"
                onClick={handleExportCSV}
                className="h-11 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                title="Unduh data tabel dalam format CSV"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
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
                  <th className="py-3.5 px-4">Target Hari H</th>
                  <th className="py-3.5 px-4">Nama Pelanggan</th>
                  <th className="py-3.5 px-4">Model Unit Toyota</th>
                  <th className="py-3.5 px-4">Sales Advisor</th>
                  <th className="py-3.5 px-4">Penanda Sistem</th>
                  <th className="py-3.5 px-4 min-w-[170px]">Status Realisasi SPK</th>
                  <th className="py-3.5 px-4 min-w-[220px]">Catatan Evaluasi (Admin)</th>
                  <th className="py-3.5 px-4 text-center">Audit Trail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPlans.length > 0 ? (
                  filteredPlans.map((row) => {
                    const isFlagged = row.isRepeatFailed || row.isDuplicate;
                    const dateFormatted = new Date(row.planDate).toLocaleDateString(
                      "id-ID",
                      {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      }
                    );

                    return (
                      <tr
                        key={row.id}
                        className={`transition-colors ${
                          row.isRepeatFailed
                            ? "bg-amber-50/70 hover:bg-amber-100/70 border-l-4 border-l-amber-500"
                            : row.isDuplicate
                            ? "bg-amber-50/30 hover:bg-amber-100/40 border-l-4 border-l-amber-400"
                            : "hover:bg-slate-50/80"
                        }`}
                      >
                        {/* Target Date */}
                        <td className="py-3.5 px-4 font-mono text-slate-600 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 font-medium">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>{dateFormatted}</span>
                          </div>
                        </td>

                        {/* Customer Name */}
                        <td className="py-3.5 px-4">
                          <button
                            type="button"
                            onClick={() => openCustomerAudit(row.customerName)}
                            className="font-bold text-slate-900 leading-snug text-left hover:text-blue-600 hover:underline transition-colors cursor-pointer"
                            title="Klik untuk membuka audit trail riwayat customer"
                          >
                            {row.customerName}
                          </button>
                        </td>

                        {/* Vehicle Unit */}
                        <td className="py-3.5 px-4 font-semibold text-slate-800">
                          {row.unitName}
                        </td>

                        {/* Sales Advisor */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <p className="font-bold text-slate-800">{row.sales.name}</p>
                          <p className="text-[10px] text-slate-500 font-mono">
                            {row.sales.nip || "SALES-ATUB"}
                          </p>
                        </td>

                        {/* Flags / Markers */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            {row.isRepeatFailed && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-950 border border-amber-300">
                                <AlertTriangle className="w-3 h-3 text-amber-700" />
                                <span>Gagal Berulang</span>
                              </span>
                            )}
                            {row.isDuplicate && !row.isRepeatFailed && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                                Duplikat
                              </span>
                            )}
                            {!row.isDuplicate && !row.isRepeatFailed && (
                              <span className="text-[11px] text-slate-400 font-medium">
                                Normal
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Status Realisasi (Editable by ADMIN & SPV) */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <select
                            value={row.spkStatus}
                            onChange={(e) =>
                              handleStatusChange(
                                row.id,
                                e.target.value as SpkStatus
                              )
                            }
                            className={`h-9 px-2.5 rounded-xl text-xs font-bold border transition-colors outline-none cursor-pointer ${
                              row.spkStatus === "BERHASIL"
                                ? "bg-emerald-50 text-emerald-800 border-emerald-300 focus:ring-2 focus:ring-emerald-200"
                                : row.spkStatus === "BELUM_BERHASIL"
                                ? "bg-rose-50 text-rose-800 border-rose-300 focus:ring-2 focus:ring-rose-200"
                                : "bg-amber-50 text-amber-800 border-amber-300 focus:ring-2 focus:ring-amber-200"
                            }`}
                          >
                            <option value="PENDING">Menunggu Hari H</option>
                            <option value="BERHASIL">SPK Berhasil</option>
                            <option value="BELUM_BERHASIL">Belum Berhasil</option>
                          </select>
                        </td>

                        {/* Catatan Evaluasi (Admin can edit, SPV is read-only) */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-start justify-between gap-2 max-w-xs">
                            <div className="min-w-0">
                              {row.keterangan ? (
                                <p className="text-xs text-slate-700 leading-snug break-words">
                                  {row.keterangan}
                                </p>
                              ) : (
                                <span className="text-[11px] text-slate-400 italic">
                                  Belum ada catatan
                                </span>
                              )}
                            </div>

                            {/* Action Button: Admin can edit, SPV has read-only badge */}
                            {currentUserRole === "ADMIN" ? (
                              <button
                                type="button"
                                onClick={() =>
                                  setKeteranganModal({
                                    isOpen: true,
                                    planId: row.id,
                                    customerName: row.customerName,
                                    unitName: row.unitName,
                                    currentValue: row.keterangan || "",
                                  })
                                }
                                className="p-1 rounded-lg text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-colors shrink-0"
                                title="Edit catatan evaluasi"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <div
                                className="p-1 text-slate-400 shrink-0"
                                title="Catatan hanya dapat diedit oleh Admin"
                              >
                                <Lock className="w-3.5 h-3.5" />
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Audit Trail Action Button */}
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => openCustomerAudit(row.customerName)}
                            className="px-2.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors border border-blue-200 shadow-2xs"
                            title="Buka audit trail riwayat customer"
                          >
                            <History className="w-3.5 h-3.5 text-blue-600" />
                            <span>Riwayat</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={8}
                      className="text-center py-10 text-slate-400 space-y-2"
                    >
                      <Layers className="w-8 h-8 text-slate-300 mx-auto" />
                      <p className="text-xs font-semibold text-slate-600">
                        Tidak ada data rencana SPK yang sesuai dengan filter.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery("");
                          setSelectedSalesId("ALL");
                          setSelectedStatus("ALL");
                          setOnlyFlagged(false);
                        }}
                        className="text-xs text-blue-600 hover:underline font-bold"
                      >
                        Reset Filter
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="p-4 border-t border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <span>
              Menampilkan <strong>{filteredPlans.length}</strong> dari{" "}
              <strong>{plans.length}</strong> total rencana SPK cabang
            </span>

            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Calendar className="w-3.5 h-3.5" />
              <span>Sistem Pelaporan H-1 Otomatis (08:00 WIB)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Modal for Editing Keterangan */}
      {keteranganModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
            onClick={() =>
              setKeteranganModal((prev) => ({ ...prev, isOpen: false }))
            }
          />

          <div className="relative z-10 w-full max-w-md rounded-2xl bg-white border border-slate-200 p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-black text-slate-900 tracking-tight">
                  Catatan Evaluasi Operasional
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {keteranganModal.customerName} • {keteranganModal.unitName}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setKeteranganModal((prev) => ({ ...prev, isOpen: false }))
                }
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveKeterangan} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Catatan Evaluasi / Keterangan (Admin)
                </label>
                <textarea
                  rows={4}
                  value={keteranganModal.currentValue}
                  onChange={(e) =>
                    setKeteranganModal((prev) => ({
                      ...prev,
                      currentValue: e.target.value,
                    }))
                  }
                  placeholder="Contoh: Customer minta diskon tambahan; SPK mundur 3 hari karena berkas leasing belum lengkap..."
                  className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 outline-none transition-all resize-none"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Catatan ini akan tampil di laporan evaluasi manajemen dan dapat dilihat oleh tim sales.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() =>
                    setKeteranganModal((prev) => ({ ...prev, isOpen: false }))
                  }
                  className="px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isPending ? "Menyimpan..." : "Simpan Catatan"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Audit Trail Customer Journey Drawer */}
      <TimelineJourneyDrawer
        isOpen={drawerState.isOpen}
        onClose={() => setDrawerState((prev) => ({ ...prev, isOpen: false }))}
        customerName={drawerState.customerName}
        plans={drawerState.plans}
        isLoading={drawerState.isLoading}
      />
    </AdminDashboardLayout>
  );
}
