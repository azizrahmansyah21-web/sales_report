/**
 * Komponen Klien Tabel Data Rencana SPK H-1
 * Agung Toyota UjungBatu (Cabang 220)
 *
 * Mengakomodasi kebutuhan operasional Admin, ADH, dan SPV:
 * 1. Filter cepat [✓] Input Terbaru Hari Ini (rentang WIB dengan urutan terbaru).
 * 2. Tombol ekspor download berkas Excel (.xlsx) sekali klik dengan format kolom lengkap.
 * 3. Hak pengelolaan status realisasi SPK dan catatan evaluasi operasional (SPV/ADH/Admin).
 * 4. Audit trail customer journey drawer untuk mendeteksi prospek berulang.
 */

"use client";

import React, { useState, useMemo, useTransition, useEffect } from "react";
import * as XLSX from "xlsx";
import AdminDashboardLayout from "@/components/templates/AdminDashboardLayout";
import SearchInput from "@/components/molecules/SearchInput";
import TimelineJourneyDrawer, {
  TimelineDrawerPlanItem,
} from "@/components/organisms/TimelineJourneyDrawer";
import {
  updateKeteranganSpv,
  updateSpkStatusDanAdmin,
  getCustomerHistory,
} from "@/lib/actions/planSpk";
import type { SpkStatus } from "@prisma/client";
import {
  getTodayRangeWIB,
  formatDisplayDateWIB,
  formatWIBDateTime,
  getDateStringWIB,
} from "@/lib/utils/wibDate";
import {
  AlertTriangle,
  Clock,
  FileSpreadsheet,
  Edit3,
  Calendar,
  Layers,
  RotateCcw,
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
  keteranganSpv?: string | null;
  keteranganAdmin?: string | null;
  isUnplanned?: boolean;
  isDuplicate: boolean;
  isRepeatFailed: boolean;
  createdAt: string | Date;
  sales: {
    id: string;
    name: string;
    nip: string | null;
    title: string | null;
    phone: string | null;
  };
}

export interface AdminProspectsClientProps {
  initialPlans: PlanWithSalesUser[];
  salesUsers: Array<{ id: string; name: string; nip: string | null }>;
  currentUserRole: "ADMIN" | "SPV" | "ADH";
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
  const [todayInputOnly, setTodayInputOnly] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<string>("ALL");
  const [selectedDate, setSelectedDate] = useState<string>("");

  const [isPending, startTransition] = useTransition();
  const [isExporting, setIsExporting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);



  // Daftar bulan yang tersedia di dataset untuk dropdown filter
  const availableMonths = useMemo(() => {
    const monthsSet = new Set<string>();
    for (const p of plans) {
      if (typeof p.planDate === "string" && p.planDate.length >= 7) {
        monthsSet.add(p.planDate.slice(0, 7));
      } else {
        const d = new Date(p.planDate);
        if (!isNaN(d.getTime())) {
          monthsSet.add(
            `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
          );
        }
      }
    }
    const now = new Date();
    monthsSet.add(
      `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
    );

    const monthNames = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ];

    return Array.from(monthsSet)
      .sort((a, b) => b.localeCompare(a))
      .map((ym) => {
        const [yearStr, monthStr] = ym.split("-");
        const monthIndex = parseInt(monthStr, 10) - 1;
        const monthName = monthNames[monthIndex] || monthStr;
        return {
          value: ym,
          label: `${monthName} ${yearStr}`,
        };
      });
  }, [plans]);

  const handleMonthChange = (month: string) => {
    setSelectedMonth(month);
    if (selectedDate && month !== "ALL" && !selectedDate.startsWith(month)) {
      setSelectedDate("");
    }
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    if (date) {
      setSelectedMonth(date.slice(0, 7));
    }
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedSalesId("ALL");
    setSelectedStatus("ALL");
    setOnlyFlagged(false);
    setTodayInputOnly(false);
    setSelectedMonth("ALL");
    setSelectedDate("");
  };

  // State modal evaluasi & realisasi terpadu
  const [realizationModal, setRealizationModal] = useState<{
    isOpen: boolean;
    planId: string;
    customerName: string;
    unitName: string;
    salesName: string;
    targetDate: string;
    currentStatus: SpkStatus;
    currentKeteranganSpv: string;
    currentKeteranganAdmin: string;
    currentIsUnplanned: boolean;
  }>({
    isOpen: false,
    planId: "",
    customerName: "",
    unitName: "",
    salesName: "",
    targetDate: "",
    currentStatus: "PENDING",
    currentKeteranganSpv: "",
    currentKeteranganAdmin: "",
    currentIsUnplanned: false,
  });

  // Listener tombol Escape untuk menutup modal secara aksesibel (R-32)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && realizationModal.isOpen) {
        setRealizationModal((prev) => ({ ...prev, isOpen: false }));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [realizationModal.isOpen]);

  // State drawer riwayat perjalanan pelanggan (Audit Trail)
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
          phone: p.sales.phone || null,
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
        keteranganSpv: item.keteranganSpv,
        keteranganAdmin: item.keteranganAdmin,
        isUnplanned: item.isUnplanned,
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

  // Filter rencana berdasarkan filter bar, termasuk toggle Input Hari Ini
  const filteredPlans = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const { startOfDayUTC, endOfDayUTC } = getTodayRangeWIB();

    const filtered = plans.filter((p) => {
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

      // Filter khusus input hari ini (WIB)
      if (todayInputOnly) {
        const createdDate = new Date(p.createdAt);
        if (createdDate < startOfDayUTC || createdDate > endOfDayUTC) {
          return false;
        }
      }

      // Filter tanggal target rencana
      const planDateStr =
        typeof p.planDate === "string" && p.planDate.length >= 10
          ? p.planDate.slice(0, 10)
          : (() => {
              const d = new Date(p.planDate);
              return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
                2,
                "0"
              )}-${String(d.getDate()).padStart(2, "0")}`;
            })();

      if (selectedDate && planDateStr !== selectedDate) {
        return false;
      }

      if (selectedMonth !== "ALL" && !selectedDate) {
        if (!planDateStr.startsWith(selectedMonth)) {
          return false;
        }
      }

      return true;
    });

    // Jika filter input hari ini aktif, urutkan data terbaru di paling atas (createdAt DESC)
    if (todayInputOnly) {
      return [...filtered].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    return filtered;
  }, [
    plans,
    searchQuery,
    selectedSalesId,
    selectedStatus,
    onlyFlagged,
    todayInputOnly,
    selectedDate,
    selectedMonth,
  ]);

  // Hitung jumlah data yang diinput hari ini untuk penanda tombol toggle
  const todayInputsCount = useMemo(() => {
    const { startOfDayUTC, endOfDayUTC } = getTodayRangeWIB();
    return plans.filter((p) => {
      const c = new Date(p.createdAt);
      return c >= startOfDayUTC && c <= endOfDayUTC;
    }).length;
  }, [plans]);

  // Metrik statistik dari dataset terfilter
  const metrics = useMemo(() => {
    let pending = 0;
    let berhasil = 0;
    let belumBerhasil = 0;
    let duplicate = 0;
    let repeatFailed = 0;

    for (const p of filteredPlans) {
      if (p.spkStatus === "PENDING") pending++;
      else if (p.spkStatus === "BERHASIL") berhasil++;
      else if (p.spkStatus === "BELUM_BERHASIL") belumBerhasil++;

      if (p.isDuplicate) duplicate++;
      if (p.isRepeatFailed) repeatFailed++;
    }

    return {
      total: filteredPlans.length,
      pending,
      berhasil,
      belumBerhasil,
      duplicate,
      repeatFailed,
      totalFlagged: duplicate + repeatFailed,
    };
  }, [filteredPlans]);

  // Pembaruan cepat status di baris tabel (Optimistic UI - Khusus Admin & ADH)
  const handleQuickStatusChange = async (
    planId: string,
    newStatus: SpkStatus
  ) => {
    if (currentUserRole === "SPV") {
      setActionError("Akses ditolak: Supervisor (SPV) tidak memiliki wewenang untuk mengubah status SPK.");
      return;
    }

    setActionError(null);

    setPlans((prev) =>
      prev.map((item) =>
        item.id === planId ? { ...item, spkStatus: newStatus } : item
      )
    );

    startTransition(async () => {
      const res = await updateSpkStatusDanAdmin(planId, { spkStatus: newStatus });
      if (!res.success) {
        setActionError(res.error);
        setPlans(initialPlans);
      }
    });
  };

  // Simpan pembaruan status & catatan evaluasi terpisah dari modal terpadu
  const handleSaveRealization = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);

    const {
      planId,
      currentStatus,
      currentKeteranganSpv,
      currentKeteranganAdmin,
      currentIsUnplanned,
    } = realizationModal;

    if (currentUserRole === "SPV") {
      // Supervisor hanya memperbarui Catatan SPV
      setPlans((prev) =>
        prev.map((item) =>
          item.id === planId
            ? {
                ...item,
                keteranganSpv: currentKeteranganSpv.trim() || null,
              }
            : item
        )
      );

      setRealizationModal((prev) => ({ ...prev, isOpen: false }));

      startTransition(async () => {
        const res = await updateKeteranganSpv(planId, {
          keteranganSpv: currentKeteranganSpv.trim() || null,
        });

        if (!res.success) {
          setActionError(res.error);
          setPlans(initialPlans);
        }
      });
    } else {
      // Admin & ADH memperbarui status realisasi, catatan admin, dan status unplanned
      setPlans((prev) =>
        prev.map((item) =>
          item.id === planId
            ? {
                ...item,
                spkStatus: currentStatus,
                keteranganAdmin: currentKeteranganAdmin.trim() || null,
                isUnplanned: currentIsUnplanned,
              }
            : item
        )
      );

      setRealizationModal((prev) => ({ ...prev, isOpen: false }));

      startTransition(async () => {
        const res = await updateSpkStatusDanAdmin(planId, {
          spkStatus: currentStatus,
          keteranganAdmin: currentKeteranganAdmin.trim() || null,
          isUnplanned: currentIsUnplanned,
        });

        if (!res.success) {
          setActionError(res.error);
          setPlans(initialPlans);
        }
      });
    }
  };

  // Ekspor Excel (.xlsx) Sekali Klik menggunakan SheetJS dengan kolom Catatan Terpisah
  const handleExportExcel = () => {
    setIsExporting(true);

    try {
      const rows = filteredPlans.map((p, idx) => {
        let statusLabel = "Menunggu";
        if (p.spkStatus === "BERHASIL") statusLabel = "SPK Berhasil (Closing)";
        if (p.spkStatus === "BELUM_BERHASIL") statusLabel = "Belum Berhasil";

        return {
          No: idx + 1,
          "Tanggal Input": formatWIBDateTime(p.createdAt),
          "Target Rencana SPK": formatDisplayDateWIB(p.planDate),
          "Nama Sales": p.sales.name,
          "No. HP Sales": p.sales.phone || "-",
          "Nama Pelanggan": p.customerName,
          "Model Kendaraan": p.unitName,
          "Status Realisasi": statusLabel,
          "SPK Unplanned": p.isUnplanned ? "Ya" : "Tidak",
          "Catatan SPV": p.keteranganSpv || "-",
          "Catatan Admin": p.keteranganAdmin || p.keterangan || "-",
          Duplikat: p.isDuplicate ? "Ya" : "Tidak",
          "Gagal Berulang": p.isRepeatFailed ? "Ya" : "Tidak",
        };
      });

      const worksheet = XLSX.utils.json_to_sheet(rows);

      // Konfigurasi lebar kolom otomatis untuk keterbacaan optimal
      worksheet["!cols"] = [
        { wch: 6 }, // No
        { wch: 22 }, // Tanggal Input
        { wch: 18 }, // Target Rencana SPK
        { wch: 24 }, // Nama Sales
        { wch: 16 }, // No. HP Sales
        { wch: 26 }, // Nama Pelanggan
        { wch: 20 }, // Model Kendaraan
        { wch: 24 }, // Status Realisasi
        { wch: 14 }, // SPK Unplanned
        { wch: 32 }, // Catatan SPV
        { wch: 32 }, // Catatan Admin
        { wch: 10 }, // Duplikat
        { wch: 14 }, // Gagal Berulang
      ];

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Rencana SPK");

      const todayStr = getDateStringWIB(0);
      const filename = `Data_Rencana_SPK_Cabang220_${todayStr}.xlsx`;

      XLSX.writeFile(workbook, filename);
    } catch (err) {
      console.error("[handleExportExcel] Kendala saat membuat file Excel:", err);
      setActionError("Gagal mengunduh file Excel. Silakan coba kembali.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <AdminDashboardLayout
      title="Data Rencana SPK H-1"
      subtitle={`Verifikasi Realisasi Closing & Evaluasi Operasional Cabang (${plans.length} Rencana Terdaftar)`}
      duplicateCount={metrics.totalFlagged}
      salesCount={salesUsers.length}
    >
      <div className="space-y-6">
        {/* Banner Hak Akses & Status Peran */}
        <div className="rounded-2xl bg-white border border-slate-200 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                currentUserRole === "ADMIN"
                  ? "bg-blue-100 text-blue-700"
                  : currentUserRole === "ADH"
                  ? "bg-indigo-100 text-indigo-700"
                  : "bg-purple-100 text-purple-700"
              }`}
            >
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-slate-800">
                  Hak Akses:{" "}
                  {currentUserRole === "ADMIN"
                    ? "Branch Administrator"
                    : currentUserRole === "ADH"
                    ? "Administration Head (ADH)"
                    : "Supervisor Sales (SPV)"}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  Otoritas Penuh Realisasi & Evaluasi
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Anda berwenang memverifikasi status realisasi closing serta mengisi catatan evaluasi tindak lanjut bagi tenaga sales.
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

        {/* Ringkasan Cepat 6 Kartu Metrik */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Total Rencana
            </span>
            <p className="text-xl font-black text-slate-900 mt-1">
              {metrics.total}
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">Unit terdaftar</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
            <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block">
              Menunggu
            </span>
            <p className="text-xl font-black text-amber-700 mt-1">
              {metrics.pending}
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">Menunggu</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">
              SPK Berhasil
            </span>
            <p className="text-xl font-black text-emerald-700 mt-1">
              {metrics.berhasil}
            </p>
            <p className="text-[10px] text-emerald-600 font-medium mt-0.5">
              Closing Sah
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
            <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider block">
              Belum Berhasil
            </span>
            <p className="text-xl font-black text-rose-700 mt-1">
              {metrics.belumBerhasil}
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">Tertunda closing</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Duplikat
            </span>
            <p className="text-xl font-black text-slate-800 mt-1">
              {metrics.duplicate}
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">Nama sama</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 shadow-2xs ring-1 ring-amber-300/60">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider">
                Gagal Ulang
              </span>
              <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
            </div>
            <p className="text-xl font-black text-amber-950 mt-1">
              {metrics.repeatFailed}
            </p>
            <p className="text-[10px] text-amber-800 font-semibold mt-0.5">
              Prioritas Evaluasi
            </p>
          </div>
        </div>

        {/* Toolbar Pencarian, Filter Cepat, & Unduh Excel */}
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
              {/* Filter Cepat: Input Terbaru Hari Ini */}
              <button
                type="button"
                onClick={() => setTodayInputOnly((prev) => !prev)}
                className={`min-h-[44px] px-3.5 py-2 rounded-xl border flex items-center gap-2 text-xs font-bold transition-all cursor-pointer select-none ${
                  todayInputOnly
                    ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                    : "bg-blue-50/70 border-blue-200 text-blue-800 hover:bg-blue-100/70 shadow-2xs"
                }`}
                title="Tampilkan hanya data yang diinput hari ini pada jam kerja WIB"
              >
                <Clock className="w-3.5 h-3.5 shrink-0" />
                <span>Input Hari Ini ({todayInputsCount})</span>
                {todayInputOnly && (
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                )}
              </button>

              {/* Filter Bulan Dropdown */}
              <div className="relative">
                <select
                  value={selectedMonth}
                  onChange={(e) => handleMonthChange(e.target.value)}
                  className="min-h-[44px] px-3 pr-8 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-700 outline-none focus:border-blue-600 cursor-pointer shadow-2xs"
                  title="Filter berdasarkan bulan rencana SPK"
                >
                  <option value="ALL">Semua Bulan</option>
                  {availableMonths.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter Tanggal Spesifik */}
              <div className="flex items-center gap-1.5 min-h-[44px] px-3 rounded-xl border border-slate-300 bg-white focus-within:border-blue-600 shadow-2xs transition-colors">
                <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-slate-700 outline-none cursor-pointer"
                  title="Filter spesifik hari H rencana SPK"
                />
                {selectedDate && (
                  <button
                    type="button"
                    onClick={() => setSelectedDate("")}
                    className="text-slate-400 hover:text-slate-600 p-0.5 rounded transition-colors"
                    title="Hapus filter tanggal spesifik"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Filter Personel Sales */}
              <select
                value={selectedSalesId}
                onChange={(e) => setSelectedSalesId(e.target.value)}
                className="min-h-[44px] px-3 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-700 outline-none focus:border-blue-600 shadow-2xs"
              >
                <option value="ALL">
                  Semua Sales ({salesUsers.length} Personel)
                </option>
                {salesUsers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} {s.nip ? `(${s.nip})` : ""}
                  </option>
                ))}
              </select>

              {/* Filter Status Realisasi */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="min-h-[44px] px-3 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-700 outline-none focus:border-blue-600 shadow-2xs"
              >
                <option value="ALL">Semua Status SPK</option>
                <option value="PENDING">Menunggu</option>
                <option value="BERHASIL">SPK Berhasil</option>
                <option value="BELUM_BERHASIL">Belum Berhasil</option>
              </select>

              {/* Filter Penanda Duplikat */}
              <label
                className={`min-h-[44px] px-3 rounded-xl border flex items-center gap-2 cursor-pointer text-xs font-bold transition-all select-none ${
                  onlyFlagged
                    ? "bg-amber-100 border-amber-400 text-amber-950 shadow-2xs"
                    : "bg-amber-50/60 border-amber-200 text-amber-800 hover:bg-amber-100/60 shadow-2xs"
                }`}
              >
                <input
                  type="checkbox"
                  checked={onlyFlagged}
                  onChange={(e) => setOnlyFlagged(e.target.checked)}
                  className="rounded border-amber-400 text-amber-600 focus:ring-amber-500"
                />
                <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                <span>Duplikat ({metrics.totalFlagged})</span>
              </label>

              {/* Reset Filter Button */}
              {(searchQuery ||
                selectedSalesId !== "ALL" ||
                selectedStatus !== "ALL" ||
                onlyFlagged ||
                todayInputOnly ||
                selectedMonth !== "ALL" ||
                selectedDate) && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="min-h-[44px] px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                  title="Reset semua filter ke default"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              )}

              {/* Tombol Download Excel Sekali Klik */}
              <button
                type="button"
                onClick={handleExportExcel}
                disabled={isExporting || filteredPlans.length === 0}
                className="min-h-[44px] px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
                title="Unduh seluruh data terfilter ke file Excel (.xlsx)"
              >
                <FileSpreadsheet className="w-4 h-4 shrink-0" />
                <span>
                  {isExporting ? "Membuat Excel..." : "Download Excel (.xlsx)"}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Tabel Data Rencana SPK */}
        <div className="rounded-2xl bg-white border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Target Hari H</th>
                  <th className="py-3.5 px-4">Nama Pelanggan</th>
                  <th className="py-3.5 px-4">Model Unit Toyota</th>
                  <th className="py-3.5 px-4">Sales</th>
                  <th className="py-3.5 px-4">Penanda Sistem</th>
                  <th className="py-3.5 px-4 min-w-[160px]">Status Realisasi SPK</th>
                  <th className="py-3.5 px-4 min-w-[200px]">Catatan (SPV)</th>
                  <th className="py-3.5 px-4 min-w-[200px]">Catatan (Admin)</th>
                  <th className="py-3.5 px-4 text-center">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPlans.length > 0 ? (
                  filteredPlans.map((row) => {
                    const dateFormatted = formatDisplayDateWIB(row.planDate);

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

                        {/* Sales Staff */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <p className="font-bold text-slate-800">{row.sales.name}</p>
                          <p className="text-[10px] text-slate-500 font-mono">
                            {row.sales.nip || "SALES-ATUB"}
                          </p>
                        </td>

                        {/* Flags / Markers */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            {row.isUnplanned && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-900 border border-purple-300">
                                Unplanned
                              </span>
                            )}
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
                            {!row.isDuplicate && !row.isRepeatFailed && !row.isUnplanned && (
                              <span className="text-[11px] text-slate-400 font-medium">
                                Normal
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Status Realisasi: Read-only untuk SPV, Dropdown untuk Admin/ADH */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {currentUserRole === "SPV" ? (
                            row.spkStatus === "BERHASIL" ? (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
                                SPK Berhasil
                              </span>
                            ) : row.spkStatus === "BELUM_BERHASIL" ? (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-bold bg-rose-50 text-rose-800 border border-rose-300">
                                Belum Berhasil
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300">
                                Menunggu
                              </span>
                            )
                          ) : (
                            <select
                              value={row.spkStatus}
                              onChange={(e) =>
                                handleQuickStatusChange(
                                  row.id,
                                  e.target.value as SpkStatus
                                )
                              }
                              className={`min-h-[36px] px-2.5 rounded-xl text-xs font-bold border transition-colors outline-none cursor-pointer ${
                                row.spkStatus === "BERHASIL"
                                  ? "bg-emerald-50 text-emerald-800 border-emerald-300 focus:ring-2 focus:ring-emerald-200"
                                  : row.spkStatus === "BELUM_BERHASIL"
                                  ? "bg-rose-50 text-rose-800 border-rose-300 focus:ring-2 focus:ring-rose-200"
                                  : "bg-amber-50 text-amber-800 border-amber-300 focus:ring-2 focus:ring-amber-200"
                              }`}
                            >
                              <option value="PENDING">Menunggu</option>
                              <option value="BERHASIL">SPK Berhasil</option>
                              <option value="BELUM_BERHASIL">Belum Berhasil</option>
                            </select>
                          )}
                        </td>

                        {/* Catatan SPV */}
                        <td className="py-3.5 px-4">
                          <div className="max-w-[200px]">
                            {row.keteranganSpv ? (
                              <p className="text-xs text-purple-950 font-medium leading-snug break-words">
                                {row.keteranganSpv}
                              </p>
                            ) : (
                              <span className="text-[11px] text-slate-400 italic">
                                Belum ada catatan
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Catatan Admin */}
                        <td className="py-3.5 px-4">
                          <div className="max-w-[200px]">
                            {row.keteranganAdmin ? (
                              <p className="text-xs text-slate-800 font-medium leading-snug break-words">
                                {row.keteranganAdmin}
                              </p>
                            ) : row.keterangan ? (
                              <p className="text-xs text-slate-500 italic leading-snug break-words">
                                {row.keterangan}
                              </p>
                            ) : (
                              <span className="text-[11px] text-slate-400 italic">
                                Belum ada catatan
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Kolom Tombol Tindakan */}
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() =>
                                setRealizationModal({
                                  isOpen: true,
                                  planId: row.id,
                                  customerName: row.customerName,
                                  unitName: row.unitName,
                                  salesName: row.sales.name,
                                  targetDate: dateFormatted,
                                  currentStatus: row.spkStatus,
                                  currentKeteranganSpv: row.keteranganSpv || "",
                                  currentKeteranganAdmin:
                                    row.keteranganAdmin || row.keterangan || "",
                                  currentIsUnplanned: !!row.isUnplanned,
                                })
                              }
                              className="px-2.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold inline-flex items-center gap-1 transition-colors shadow-2xs cursor-pointer"
                              title={
                                currentUserRole === "SPV"
                                  ? "Isi Catatan Supervisi SPV"
                                  : "Verifikasi Status Realisasi & Catatan Admin"
                              }
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>{currentUserRole === "SPV" ? "Catatan SPV" : "Evaluasi"}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => openCustomerAudit(row.customerName)}
                              className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold inline-flex items-center gap-1 transition-colors border border-slate-300 shadow-2xs cursor-pointer"
                              title="Buka audit trail rekam jejak prospek"
                            >
                              <History className="w-3 h-3 text-slate-600" />
                              <span>Riwayat</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={9}
                      className="text-center py-12 text-slate-400 space-y-2"
                    >
                      <Layers className="w-8 h-8 text-slate-300 mx-auto" />
                      <p className="text-xs font-semibold text-slate-600">
                        Tidak ada data rencana SPK yang sesuai dengan filter pencarian.
                      </p>
                      <button
                        type="button"
                        onClick={handleResetFilters}
                        className="text-xs text-blue-600 hover:underline font-bold cursor-pointer"
                      >
                        Reset Filter
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer Tabel */}
          <div className="p-4 border-t border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <span>
              Menampilkan <strong>{filteredPlans.length}</strong> dari{" "}
              <strong>{plans.length}</strong> total rencana SPK cabang
            </span>

            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Calendar className="w-3.5 h-3.5" />
              <span>Sistem Pelaporan H-1 Otomatis Cabang 220</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Evaluasi & Pembaruan Realisasi Terpadu (SPV / ADH / Admin) */}
      {realizationModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
            onClick={() =>
              setRealizationModal((prev) => ({ ...prev, isOpen: false }))
            }
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            className="relative z-10 w-full max-w-lg rounded-2xl bg-white border border-slate-200 p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3
                  id="modal-title"
                  className="text-sm font-black text-slate-900 tracking-tight"
                >
                  Evaluasi Realisasi SPK Cabang
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {realizationModal.customerName} ({realizationModal.unitName}) • Sales:{" "}
                  {realizationModal.salesName}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setRealizationModal((prev) => ({ ...prev, isOpen: false }))
                }
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Tutup dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveRealization} className="space-y-4">
              {/* Pilihan Status Realisasi SPK */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Status Realisasi SPK
                  </label>
                  {currentUserRole === "SPV" && (
                    <span className="text-[10px] text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      Terkunci: Wewenang Admin / ADH
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    disabled={currentUserRole === "SPV"}
                    onClick={() =>
                      setRealizationModal((prev) => ({
                        ...prev,
                        currentStatus: "PENDING",
                      }))
                    }
                    className={`min-h-[44px] py-2 px-2.5 rounded-xl text-xs font-bold border transition-all flex flex-col items-center justify-center ${
                      realizationModal.currentStatus === "PENDING"
                        ? "bg-amber-100 border-amber-400 text-amber-900 shadow-xs ring-1 ring-amber-400"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    } ${
                      currentUserRole === "SPV"
                        ? "opacity-60 cursor-not-allowed"
                        : "cursor-pointer"
                    }`}
                  >
                    <span>Menunggu</span>
                  </button>

                  <button
                    type="button"
                    disabled={currentUserRole === "SPV"}
                    onClick={() =>
                      setRealizationModal((prev) => ({
                        ...prev,
                        currentStatus: "BERHASIL",
                      }))
                    }
                    className={`min-h-[44px] py-2 px-2.5 rounded-xl text-xs font-bold border transition-all flex flex-col items-center justify-center ${
                      realizationModal.currentStatus === "BERHASIL"
                        ? "bg-emerald-100 border-emerald-400 text-emerald-900 shadow-xs ring-1 ring-emerald-400"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    } ${
                      currentUserRole === "SPV"
                        ? "opacity-60 cursor-not-allowed"
                        : "cursor-pointer"
                    }`}
                  >
                    <span>SPK Berhasil</span>
                    <span className="text-[10px] font-normal text-emerald-700">Closing Sah</span>
                  </button>

                  <button
                    type="button"
                    disabled={currentUserRole === "SPV"}
                    onClick={() =>
                      setRealizationModal((prev) => ({
                        ...prev,
                        currentStatus: "BELUM_BERHASIL",
                      }))
                    }
                    className={`min-h-[44px] py-2 px-2.5 rounded-xl text-xs font-bold border transition-all flex flex-col items-center justify-center ${
                      realizationModal.currentStatus === "BELUM_BERHASIL"
                        ? "bg-rose-100 border-rose-400 text-rose-900 shadow-xs ring-1 ring-rose-400"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    } ${
                      currentUserRole === "SPV"
                        ? "opacity-60 cursor-not-allowed"
                        : "cursor-pointer"
                    }`}
                  >
                    <span>Belum Berhasil</span>
                    <span className="text-[10px] font-normal text-rose-700">Tertunda</span>
                  </button>
                </div>

                {/* Checkbox SPK Unplanned (Khusus Admin / ADH) */}
                {currentUserRole !== "SPV" && (
                  <label className="mt-2.5 flex items-center gap-2 p-2 rounded-xl bg-purple-50/60 border border-purple-200/80 cursor-pointer text-xs font-semibold text-purple-900">
                    <input
                      type="checkbox"
                      checked={realizationModal.currentIsUnplanned}
                      onChange={(e) =>
                        setRealizationModal((prev) => ({
                          ...prev,
                          currentIsUnplanned: e.target.checked,
                        }))
                      }
                      className="rounded border-purple-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span>Tandai sebagai SPK Unplanned (Closing tanpa input rencana H-1)</span>
                  </label>
                )}
              </div>

              {/* Bagian Catatan SPV (Supervisor) */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Catatan Supervisi SPV {currentUserRole === "SPV" && <span className="text-purple-600">(Aktif)</span>}
                </label>
                {currentUserRole === "SPV" ? (
                  <textarea
                    rows={3}
                    value={realizationModal.currentKeteranganSpv}
                    onChange={(e) =>
                      setRealizationModal((prev) => ({
                        ...prev,
                        currentKeteranganSpv: e.target.value,
                      }))
                    }
                    placeholder="Contoh: Prospek butuh follow-up diskon fleet, jadwalkan test drive ulang jam 10..."
                    className="w-full p-3 rounded-xl border border-purple-300 bg-white text-xs focus:ring-2 focus:ring-purple-500/20 outline-none transition-all resize-none font-medium"
                  />
                ) : (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
                    {realizationModal.currentKeteranganSpv ? (
                      <p className="italic text-purple-950">&quot;{realizationModal.currentKeteranganSpv}&quot;</p>
                    ) : (
                      <span className="text-slate-400 italic">Belum ada catatan dari Supervisor.</span>
                    )}
                  </div>
                )}
              </div>

              {/* Bagian Catatan Admin (Verifikasi Dokumen & Closing) */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Catatan Administrasi & Closing (Admin/ADH) {currentUserRole !== "SPV" && <span className="text-blue-600">(Aktif)</span>}
                </label>
                {currentUserRole !== "SPV" ? (
                  <textarea
                    rows={3}
                    value={realizationModal.currentKeteranganAdmin}
                    onChange={(e) =>
                      setRealizationModal((prev) => ({
                        ...prev,
                        currentKeteranganAdmin: e.target.value,
                      }))
                    }
                    placeholder="Contoh: Berkas leasing ACC disetujui, tanda jadi Rp 5jt terverifikasi kasir..."
                    className="w-full p-3 rounded-xl border border-blue-300 bg-white text-xs focus:ring-2 focus:ring-blue-500/20 outline-none transition-all resize-none font-medium"
                  />
                ) : (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
                    {realizationModal.currentKeteranganAdmin ? (
                      <p className="italic text-slate-800">&quot;{realizationModal.currentKeteranganAdmin}&quot;</p>
                    ) : (
                      <span className="text-slate-400 italic">Belum ada catatan verifikasi admin.</span>
                    )}
                  </div>
                )}
              </div>

              {/* Tombol Aksi */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() =>
                    setRealizationModal((prev) => ({ ...prev, isOpen: false }))
                  }
                  className="min-h-[44px] px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="min-h-[44px] px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>
                    {isPending
                      ? "Menyimpan..."
                      : currentUserRole === "SPV"
                      ? "Simpan Catatan SPV"
                      : "Simpan Verifikasi Realisasi"}
                  </span>
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
