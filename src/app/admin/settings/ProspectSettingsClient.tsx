"use client";

import React, { useState, useEffect, useTransition, useCallback, useMemo } from "react";
import Button from "@/components/atoms/Button";
import {
  ProspectEngineSettingsData,
  ProspectStatsData,
  PlanSpkAuditItem,
  BatchRescanResult,
  getProspectEngineOverviewAction,
  saveProspectEngineSettingsAction,
  batchRescanDuplicatesAction,
} from "@/lib/actions/prospectEngineAdmin";
import {
  Sliders,
  Clock,
  RotateCw,
  AlertTriangle,
  CheckCircle2,
  Search,
  History,
  FileText,
  X,
  AlertCircle,
  Save,
  Layers,
  CopyCheck,
  Repeat,
  Sparkles,
} from "lucide-react";

type SubTabId = "SETTINGS" | "AUDIT_TRAIL";

export default function ProspectSettingsClient() {
  const [activeSubTab, setActiveSubTab] = useState<SubTabId>("SETTINGS");
  const [settings, setSettings] = useState<ProspectEngineSettingsData | null>(null);
  const [stats, setStats] = useState<ProspectStatsData | null>(null);
  const [audits, setAudits] = useState<PlanSpkAuditItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Form states for settings
  const [cutoffHour, setCutoffHour] = useState(17);
  const [cutoffMinute, setCutoffMinute] = useState(0);
  const [enableInterSales, setEnableInterSales] = useState(true);
  const [enableReInput, setEnableReInput] = useState(true);
  const [enableNormalize, setEnableNormalize] = useState(true);
  const [allowUnplanned, setAllowUnplanned] = useState(false);

  // Feedback banner
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Re-scan state & confirmation modal
  const [isRescanModalOpen, setIsRescanModalOpen] = useState(false);
  const [rescanResult, setRescanResult] = useState<BatchRescanResult | null>(null);

  // Audit trail search & filter
  const [auditSearchQuery, setAuditSearchQuery] = useState("");
  const [selectedActionType, setSelectedActionType] = useState<string>("ALL");

  const loadOverview = useCallback(async () => {
    const res = await getProspectEngineOverviewAction();
    if (res.success && res.data) {
      setSettings(res.data.settings);
      setStats(res.data.stats);
      setAudits(res.data.recentAudits);

      // Sinkronkan form inputs
      setCutoffHour(res.data.settings.cutoffHourWib);
      setCutoffMinute(res.data.settings.cutoffMinuteWib);
      setEnableInterSales(res.data.settings.enableInterSalesCheck);
      setEnableReInput(res.data.settings.enableReInputTracking);
      setEnableNormalize(res.data.settings.enableNameNormalization);
      setAllowUnplanned(res.data.settings.allowSalesUnplanned);
    } else if (!res.success) {
      setFeedback({ type: "error", message: res.error || "Gagal memuat konfigurasi prospek." });
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadOverview();
  }, [loadOverview]);

  // Handle Save Settings
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await saveProspectEngineSettingsAction({
        cutoffHourWib: cutoffHour,
        cutoffMinuteWib: cutoffMinute,
        enableInterSalesCheck: enableInterSales,
        enableReInputTracking: enableReInput,
        enableNameNormalization: enableNormalize,
        allowSalesUnplanned: allowUnplanned,
      });

      if (res.success && res.data) {
        setSettings(res.data);
        setFeedback({
          type: "success",
          message: "Pengaturan batas cutoff dan mesin duplikat berhasil diperbarui.",
        });
      } else if (!res.success) {
        setFeedback({ type: "error", message: res.error });
      }
    });
  };

  // Handle Batch Re-scan
  const handleExecuteRescan = () => {
    setIsRescanModalOpen(false);
    startTransition(async () => {
      const res = await batchRescanDuplicatesAction();
      if (res.success && res.data) {
        setRescanResult(res.data);
        setFeedback({
          type: "success",
          message: res.message,
        });
        loadOverview();
      } else if (!res.success) {
        setFeedback({ type: "error", message: res.error });
      }
    });
  };

  // Filtered Audit Trail
  const filteredAudits = useMemo(() => {
    return audits.filter((item) => {
      const q = auditSearchQuery.trim().toLowerCase();
      const matchesSearch =
        q === "" ||
        item.customerName.toLowerCase().includes(q) ||
        item.unitName.toLowerCase().includes(q) ||
        item.salesName.toLowerCase().includes(q) ||
        item.actorName.toLowerCase().includes(q) ||
        (item.details && item.details.toLowerCase().includes(q));

      const matchesType =
        selectedActionType === "ALL" || item.actionType === selectedActionType;

      return matchesSearch && matchesType;
    });
  }, [audits, auditSearchQuery, selectedActionType]);

  const getActionBadge = (type: string) => {
    switch (type) {
      case "CREATE":
        return { label: "Input Baru", bg: "bg-blue-50 text-blue-700 border-blue-200" };
      case "STATUS_CHANGE":
        return { label: "Ubah Status", bg: "bg-emerald-50 text-emerald-700 border-emerald-200" };
      case "SPV_NOTE":
        return { label: "Catatan SPV", bg: "bg-purple-50 text-purple-700 border-purple-200" };
      case "ADMIN_NOTE":
        return { label: "Catatan Admin", bg: "bg-amber-50 text-amber-700 border-amber-200" };
      case "UNPLANNED":
        return { label: "SPK Unplanned", bg: "bg-rose-50 text-rose-700 border-rose-200" };
      default:
        return { label: type, bg: "bg-slate-100 text-slate-700 border-slate-200" };
    }
  };

  const formatWibTimestamp = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString("id-ID", {
        timeZone: "Asia/Jakarta",
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="space-y-6">
      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl border flex items-start justify-between shadow-2xs animate-in fade-in ${
            feedback.type === "success"
              ? "bg-emerald-50 border-emerald-300 text-emerald-950"
              : "bg-rose-50 border-rose-300 text-rose-950"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <p className="text-xs font-semibold leading-relaxed">{feedback.message}</p>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Telemetry Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Total Prospek</span>
            <Layers className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-xl font-black text-slate-900 tabular-nums">
            {isLoading ? "..." : (stats?.totalPlans ?? 0)}
          </p>
          <p className="text-[10px] text-slate-400">Total rencana SPK cabang 220</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Duplikat Terdeteksi</span>
            <CopyCheck className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-xl font-black text-amber-600 tabular-nums">
            {isLoading ? "..." : (stats?.duplicateCount ?? 0)}
          </p>
          <p className="text-[10px] text-slate-400">Baris dengan flag isDuplicate true</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Input Berulang (≥2x)</span>
            <Repeat className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-xl font-black text-indigo-600 tabular-nums">
            {isLoading ? "..." : (stats?.reInputCount ?? 0)}
          </p>
          <p className="text-[10px] text-slate-400">Nama pelanggan diinput berulang</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Audit Trail Log</span>
            <History className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xl font-black text-emerald-600 tabular-nums">
            {isLoading ? "..." : (stats?.totalAuditLogs ?? audits.length)}
          </p>
          <p className="text-[10px] text-slate-400">Histori perubahan tercatat</p>
        </div>
      </div>

      {/* Sub-Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveSubTab("SETTINGS")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === "SETTINGS"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Sliders className="w-4 h-4" />
          1. Parameter Cutoff & Mesin Duplikat
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("AUDIT_TRAIL")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === "AUDIT_TRAIL"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <History className="w-4 h-4" />
          2. Historis Perubahan Plan SPK ({audits.length})
        </button>
      </div>

      {/* SUB-TAB 1: SETTINGS & BATCH RE-SCAN */}
      {activeSubTab === "SETTINGS" && (
        <div className="space-y-6">
          <form onSubmit={handleSaveSettings} className="space-y-6">
            {/* Bagian A: Batas Waktu Cutoff & Unplanned */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    Batas Jam Cutoff Operasional Cabang 220
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Mengontrol penguncian otomatis opsi Hari Ini pada form input sales mobile setelah jam batas tercapai.
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-[11px] font-bold">
                  {String(cutoffHour).padStart(2, "0")}:{String(cutoffMinute).padStart(2, "0")} WIB
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Jam Batas Cutoff (WIB)
                  </label>
                  <select
                    value={cutoffHour}
                    onChange={(e) => setCutoffHour(Number(e.target.value))}
                    className="w-full text-xs font-medium border border-slate-300 rounded-xl px-3 py-2.5 bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    {[14, 15, 16, 17, 18, 19, 20, 21].map((h) => (
                      <option key={h} value={h}>
                        Pukul {String(h).padStart(2, "0")}:00 WIB {h === 17 ? "(Standar Cabang 220)" : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Menit Batas Cutoff
                  </label>
                  <select
                    value={cutoffMinute}
                    onChange={(e) => setCutoffMinute(Number(e.target.value))}
                    className="w-full text-xs font-medium border border-slate-300 rounded-xl px-3 py-2.5 bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    {[0, 15, 30, 45].map((m) => (
                      <option key={m} value={m}>
                        Menit ke-{String(m).padStart(2, "0")}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Kebijakan SPK Unplanned */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-900">
                    Izinkan Sales Menginput SPK Unplanned Hari-H Secara Mandiri
                  </p>
                  <p className="text-[11px] text-slate-500 max-w-lg mt-0.5">
                    Jika nonaktif, hanya Admin dan ADH yang dapat mendaftarkan SPK dadakan melalui dashboard operasional.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setAllowUnplanned(!allowUnplanned)}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                    allowUnplanned ? "bg-blue-600 justify-end" : "bg-slate-300 justify-start"
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-white shadow-xs" />
                </button>
              </div>
            </div>

            {/* Bagian B: Aturan Mesin Deteksi Duplikat */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-5">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <CopyCheck className="w-4 h-4 text-amber-600" />
                  Aturan Mesin Deteksi Duplikat & Frekuensi Input
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Konfigurasi algoritma pencocokan nama dan pelacak frekuensi pengulangan prospek di Cabang 220.
                </p>
              </div>

              <div className="space-y-4 pt-2">
                {/* Rule 1: Antar Sales Cabang 220 */}
                <div className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-slate-900">
                      Deteksi Duplikat Antar-Sales (Cabang 220)
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Menandai baris kuning jika pelanggan yang sama pernah diajukan oleh sales lain di Cabang 220.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEnableInterSales(!enableInterSales)}
                    className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                      enableInterSales ? "bg-amber-600 justify-end" : "bg-slate-300 justify-start"
                    }`}
                  >
                    <span className="w-4 h-4 rounded-full bg-white shadow-xs" />
                  </button>
                </div>

                {/* Rule 2: Re-input Tracking */}
                <div className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-slate-900">
                      Lacak Frekuensi Input Ulang (Re-input Counter)
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Menghitung akumulasi frekuensi berapa kali suatu prospek telah diinput berulang oleh sales.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEnableReInput(!enableReInput)}
                    className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                      enableReInput ? "bg-indigo-600 justify-end" : "bg-slate-300 justify-start"
                    }`}
                  >
                    <span className="w-4 h-4 rounded-full bg-white shadow-xs" />
                  </button>
                </div>

                {/* Rule 3: Normalisasi Gelar & Sapaan */}
                <div className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-slate-900">
                      Normalisasi Nama (Bersihkan Sapaan Pak, Ibu, Haji, dr.)
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Mengabaikan variasi sapaan dan tanda baca agar &quot;Pak Budi&quot; dan &quot;Budi&quot; otomatis terdeteksi identik.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEnableNormalize(!enableNormalize)}
                    className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                      enableNormalize ? "bg-emerald-600 justify-end" : "bg-slate-300 justify-start"
                    }`}
                  >
                    <span className="w-4 h-4 rounded-full bg-white shadow-xs" />
                  </button>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isPending}
                  className="px-5 py-2.5 text-xs font-bold flex items-center gap-2"
                >
                  {isPending ? (
                    <RotateCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Simpan Konfigurasi Operasional
                </Button>
              </div>
            </div>
          </form>

          {/* Bagian C: Mesin Pindai Ulang Duplikat Massal */}
          <div className="p-6 rounded-3xl bg-slate-900 text-white shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold flex items-center gap-2 text-white">
                  <RotateCw className="w-4 h-4 text-amber-400" />
                  Mesin Pindai Ulang Duplikat Massal (Batch Re-scan Engine)
                </h3>
                <p className="text-xs text-slate-300 mt-1 max-w-xl">
                  Memeriksa ulang seluruh baris <code>plan_spk</code> di database secara kronologis untuk menyinkronkan indikator duplikat dan histori pengulangan nama pelanggan.
                </p>
              </div>

              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={() => setIsRescanModalOpen(true)}
                disabled={isPending}
                className="bg-amber-600 hover:bg-amber-700 text-white shrink-0 text-xs font-bold px-4 py-2.5"
              >
                {isPending ? (
                  <RotateCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                Jalankan Pindai Ulang Database
              </Button>
            </div>

            {/* Hasil Pindai Ulang Terakhir */}
            {rescanResult && (
              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 text-xs space-y-2 animate-in fade-in">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Hasil Pindai Ulang Terakhir
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Selesai dalam {rescanResult.executionTimeMs}ms ({formatWibTimestamp(rescanResult.timestamp)})
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                  <div className="p-2 rounded-xl bg-slate-900/60">
                    <p className="text-[10px] text-slate-400">Total Dipindai</p>
                    <p className="text-sm font-bold text-white">{rescanResult.totalProcessed} baris</p>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900/60">
                    <p className="text-[10px] text-slate-400">Duplikat Terdeteksi</p>
                    <p className="text-sm font-bold text-amber-400">{rescanResult.duplicatesFound} baris</p>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900/60">
                    <p className="text-[10px] text-slate-400">Flag Disinkronkan</p>
                    <p className="text-sm font-bold text-emerald-400">{rescanResult.flagsUpdated} baris</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: AUDIT TRAIL HISTORIS PERUBAHAN PLAN SPK */}
      {activeSubTab === "AUDIT_TRAIL" && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari nama pelanggan, unit, aktor atau sales..."
                  value={auditSearchQuery}
                  onChange={(e) => setAuditSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-xl bg-white text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              {/* Action Filter */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {[
                  { id: "ALL", label: "Semua Aksi" },
                  { id: "CREATE", label: "Input" },
                  { id: "STATUS_CHANGE", label: "Status" },
                  { id: "SPV_NOTE", label: "Catatan SPV" },
                  { id: "ADMIN_NOTE", label: "Catatan Admin" },
                  { id: "UNPLANNED", label: "Unplanned" },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setSelectedActionType(f.id)}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-bold shrink-0 transition-all cursor-pointer ${
                      selectedActionType === f.id
                        ? "bg-slate-900 text-white shadow-2xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Table / Timeline List */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
            {filteredAudits.length === 0 ? (
              <div className="p-12 text-center space-y-2">
                <History className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-700">Belum Ada Riwayat Perubahan</p>
                <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                  Setiap aksi input baru, perubahan status realisasi, serta pengisian catatan evaluasi akan tercatat otomatis di sini.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-4">Waktu (WIB)</th>
                      <th className="py-3 px-4">Pelanggan & Unit</th>
                      <th className="py-3 px-4">Aktor Pengubah</th>
                      <th className="py-3 px-4">Jenis Aksi</th>
                      <th className="py-3 px-4">Rincian Perubahan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredAudits.map((item) => {
                      const badge = getActionBadge(item.actionType);
                      return (
                        <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                            {formatWibTimestamp(item.createdAt)}
                          </td>
                          <td className="py-3 px-4">
                            <p className="font-bold text-slate-900">{item.customerName}</p>
                            <p className="text-[11px] text-slate-500">
                              {item.unitName} • Sales: {item.salesName}
                            </p>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-slate-800">{item.actorName}</span>
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">
                                {item.actorRole}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${badge.bg}`}
                            >
                              {badge.label}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-[11px] text-slate-600 max-w-xs truncate">
                            {item.details || (item.newValue ? `Nilai: ${item.newValue}` : "-")}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI BATCH RE-SCAN */}
      {isRescanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center gap-3 text-amber-600">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Konfirmasi Pindai Ulang Database
                </h4>
                <p className="text-xs text-slate-500">
                  Evaluasi massal seluruh baris data prospek
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Mesin akan memindai seluruh data pada tabel <code>plan_spk</code> dan memperbarui status <code>isDuplicate</code> sesuai parameter aktif saat ini.
            </p>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600 space-y-1">
              <p>• Deteksi Antar-Sales: <b>{enableInterSales ? "Aktif" : "Nonaktif"}</b></p>
              <p>• Normalisasi Nama: <b>{enableNormalize ? "Aktif" : "Nonaktif"}</b></p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsRescanModalOpen(false)}
                className="text-xs font-semibold"
              >
                Batal
              </Button>
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={handleExecuteRescan}
                disabled={isPending}
                className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-4"
              >
                {isPending ? (
                  <RotateCw className="w-4 h-4 animate-spin" />
                ) : (
                  "Ya, Jalankan Pindai Ulang"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

