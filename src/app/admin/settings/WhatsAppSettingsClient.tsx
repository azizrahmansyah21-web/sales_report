"use client";

import React, { useState, useEffect, useTransition, useCallback } from "react";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import FormField from "@/components/molecules/FormField";
import Select from "@/components/atoms/Select";
import {
  WhatsAppOverviewData,
  WhatsAppMessageItem,
  getWhatsAppOverviewAction,
  updateWhatsAppSettingsAction,
  sendManualWhatsAppMessageAction,
  sendManualExcelReportAction,
  getWhatsAppHistoryAction,
} from "@/lib/actions/whatsappAdmin";
import {
  Radio,
  Send,
  FileSpreadsheet,
  Clock,
  History,
  CheckCircle2,
  AlertTriangle,
  X,
  RotateCw,
  Search,
  ChevronLeft,
  ChevronRight,
  FileText,
  UserCheck,
} from "lucide-react";

type SubTabId = "MANUAL" | "SCHEDULE" | "EXCEL" | "HISTORY";

export default function WhatsAppSettingsClient() {
  const [activeSubTab, setActiveSubTab] = useState<SubTabId>("MANUAL");
  const [overview, setOverview] = useState<WhatsAppOverviewData | null>(null);
  const [historyList, setHistoryList] = useState<WhatsAppMessageItem[]>([]);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotalPages, setHistoryTotalPages] = useState(1);
  const historyPageSize = 10;

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Feedback Banner
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Form: Manual Message
  const [manualForm, setManualForm] = useState({
    targetType: "GROUP" as "GROUP" | "BM" | "ADH" | "CUSTOM",
    customRecipient: "",
    content: "",
  });

  // Form: Schedule Settings
  const [scheduleForm, setScheduleForm] = useState({
    targetGroupId: "",
    targetGroupName: "",
    isMorningBlastActive: true,
    morningBlastTime: "08:00",
    isEveningBlastActive: true,
    eveningBlastTime: "17:15",
    sendReportToBm: false,
    sendReportToAdh: false,
  });

  // Form: Excel Report
  const todayDateStr = new Date().toISOString().split("T")[0];
  const [excelForm, setExcelForm] = useState({
    targetDate: todayDateStr,
    targetType: "GROUP" as "GROUP" | "BM" | "ADH",
  });

  // History Filter
  const [historySearch, setHistorySearch] = useState("");
  const [historyStatusFilter, setHistoryStatusFilter] = useState("ALL");
  const [historyTypeFilter, setHistoryTypeFilter] = useState("ALL");

  // Load Overview Data
  const loadOverview = useCallback(async () => {
    const res = await getWhatsAppOverviewAction();
    if (res.success) {
      if (res.data) {
        setOverview(res.data);
        setScheduleForm({
          targetGroupId: res.data.settings.targetGroupId,
          targetGroupName: res.data.settings.targetGroupName,
          isMorningBlastActive: res.data.settings.isMorningBlastActive,
          morningBlastTime: res.data.settings.morningBlastTime,
          isEveningBlastActive: res.data.settings.isEveningBlastActive,
          eveningBlastTime: res.data.settings.eveningBlastTime,
          sendReportToBm: res.data.settings.sendReportToBm,
          sendReportToAdh: res.data.settings.sendReportToAdh,
        });
      }
    } else {
      setFeedback({ type: "error", message: res.error || "Gagal memuat telemetri WhatsApp." });
    }
    setIsLoading(false);
  }, []);

  // Load History
  const loadHistory = useCallback(
    async (page: number, search: string, status: string, type: string) => {
      const res = await getWhatsAppHistoryAction({
        page,
        pageSize: historyPageSize,
        search,
        statusFilter: status,
        typeFilter: type,
      });
      if (res.success && res.data) {
        setHistoryList(res.data.messages);
        setHistoryTotal(res.data.total);
        setHistoryTotalPages(res.data.totalPages);
      }
      setIsLoadingHistory(false);
    },
    [historyPageSize]
  );

  useEffect(() => {
    let ignore = false;
    getWhatsAppOverviewAction().then((res) => {
      if (ignore) return;
      if (res.success && res.data) {
        setOverview(res.data);
        setScheduleForm({
          targetGroupId: res.data.settings.targetGroupId,
          targetGroupName: res.data.settings.targetGroupName,
          isMorningBlastActive: res.data.settings.isMorningBlastActive,
          morningBlastTime: res.data.settings.morningBlastTime,
          isEveningBlastActive: res.data.settings.isEveningBlastActive,
          eveningBlastTime: res.data.settings.eveningBlastTime,
          sendReportToBm: res.data.settings.sendReportToBm,
          sendReportToAdh: res.data.settings.sendReportToAdh,
        });
      }
      setIsLoading(false);
    });
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;
    if (activeSubTab === "HISTORY") {
      getWhatsAppHistoryAction({
        page: historyPage,
        pageSize: historyPageSize,
        search: historySearch,
        statusFilter: historyStatusFilter,
        typeFilter: historyTypeFilter,
      }).then((res) => {
        if (ignore) return;
        if (res.success && res.data) {
          setHistoryList(res.data.messages);
          setHistoryTotal(res.data.total);
          setHistoryTotalPages(res.data.totalPages);
        }
        setIsLoadingHistory(false);
      });
    }
    return () => {
      ignore = true;
    };
  }, [activeSubTab, historyPage, historySearch, historyStatusFilter, historyTypeFilter, historyPageSize]);

  // Action: Submit Manual Message
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await sendManualWhatsAppMessageAction(manualForm);
      if (res.success) {
        setFeedback({ type: "success", message: res.message });
        setManualForm((prev) => ({ ...prev, content: "" }));
        loadOverview();
      } else {
        setFeedback({ type: "error", message: res.error });
      }
    });
  };

  // Action: Submit Schedule Form
  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await updateWhatsAppSettingsAction(scheduleForm);
      if (res.success) {
        setFeedback({ type: "success", message: res.message });
        loadOverview();
      } else {
        setFeedback({ type: "error", message: res.error });
      }
    });
  };

  // Action: Submit Excel Report
  const handleExcelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await sendManualExcelReportAction(excelForm);
      if (res.success) {
        setFeedback({ type: "success", message: res.message });
        loadOverview();
      } else {
        setFeedback({ type: "error", message: res.error });
      }
    });
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
            <p className="text-xs font-semibold leading-relaxed">
              {feedback.message}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-slate-700 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Telemetry Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Status Gateway
            </span>
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                overview?.telemetry.socketStatus === "ONLINE"
                  ? "bg-emerald-500 animate-pulse"
                  : "bg-amber-500"
              }`}
            />
          </div>
          <p className="text-xl font-black text-slate-900 mt-1 font-mono">
            {overview?.telemetry.socketStatus || "STANDBY"}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">
            Baileys Multi-Device Socket
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Terkirim Hari Ini
          </span>
          <p className="text-xl font-black text-emerald-600 mt-1 font-mono">
            {overview?.telemetry.totalSentToday ?? 0}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">
            Berhasil masuk ke grup/target
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Antrean Menunggu
          </span>
          <p className="text-xl font-black text-blue-600 mt-1 font-mono">
            {overview?.telemetry.pendingCount ?? 0}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">
            Proses pengiriman daemon
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Gagal Transmisi
          </span>
          <p
            className={`text-xl font-black mt-1 font-mono ${
              (overview?.telemetry.failedCount || 0) > 0
                ? "text-rose-600"
                : "text-slate-900"
            }`}
          >
            {overview?.telemetry.failedCount ?? 0}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">
            {overview?.telemetry.failedCount ? "Perlu pengecekan" : "Bersih (0 kendala)"}
          </p>
        </div>
      </div>

      {/* Target Group Info Banner */}
      <div className="p-4 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Target Grup Aktif:
            </span>
            <span className="text-xs font-black text-emerald-300">
              {overview?.settings.targetGroupName || "SALES AGUNG TOYOTA UBT"}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-mono">
            JID: {overview?.settings.targetGroupId || "Belum dikonfigurasi"}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-xl bg-slate-800 text-slate-300 border border-slate-700 font-medium">
            Jeda Proteksi Anti-Ban: 10s
          </span>
          <button
            type="button"
            onClick={() => {
              setIsLoading(true);
              loadOverview();
            }}
            disabled={isLoading}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            title="Refresh status gateway"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Module 3 Internal Sub-Tabs Navigation */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2 overflow-x-auto no-scrollbar">
        {[
          { id: "MANUAL", label: "1. Kirim Pesan Pengumuman", icon: <Send className="w-3.5 h-3.5" /> },
          { id: "SCHEDULE", label: "2. Jadwal Rutin & Laporan Pimpinan", icon: <Clock className="w-3.5 h-3.5" /> },
          { id: "EXCEL", label: "3. Rekap & Kirim Dokumen Excel", icon: <FileSpreadsheet className="w-3.5 h-3.5" /> },
          { id: "HISTORY", label: "4. Histori Pesan Terkirim", icon: <History className="w-3.5 h-3.5" /> },
        ].map((tab) => {
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveSubTab(tab.id as SubTabId);
                if (tab.id === "HISTORY") {
                  setIsLoadingHistory(true);
                  loadHistory(historyPage, historySearch, historyStatusFilter, historyTypeFilter);
                }
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer select-none whitespace-nowrap ${
                isActive
                  ? "bg-blue-600 text-white shadow-2xs"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ─── TAB 1: KIRIM PESAN MANUAL / PENGUMUMAN ──────────────────────── */}
      {activeSubTab === "MANUAL" && (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Send className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Kirim Pengumuman / Pesan Darurat ke WhatsApp
              </h3>
              <p className="text-xs text-slate-500">
                Gunakan fitur ini untuk menyiarkan informasi pemeliharaan server (maintenance), kendala sistem, atau kontak sysadmin/developer.
              </p>
            </div>
          </div>

          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Pilih Sasaran Pengiriman (Target)" required>
                <Select
                  value={manualForm.targetType}
                  onChange={(e) =>
                    setManualForm({
                      ...manualForm,
                      targetType: e.target.value as "GROUP" | "BM" | "ADH" | "CUSTOM",
                    })
                  }
                  options={[
                    { value: "GROUP", label: `Grup Sales Cabang (${overview?.settings.targetGroupName || "Cabang 220"})` },
                    { value: "BM", label: `Pribadi Branch Manager (${overview?.leadership.bm?.name || "BM Cabang"})` },
                    { value: "ADH", label: `Pribadi Administration Head (${overview?.leadership.adh?.name || "ADH Cabang"})` },
                    { value: "CUSTOM", label: "Nomor WhatsApp Khusus (Kustom)" },
                  ]}
                />
              </FormField>

              {manualForm.targetType === "CUSTOM" && (
                <FormField label="Nomor WhatsApp Tujuan" required>
                  <Input
                    value={manualForm.customRecipient}
                    onChange={(e) =>
                      setManualForm({ ...manualForm, customRecipient: e.target.value })
                    }
                    placeholder="Contoh: 081268000999"
                    required
                  />
                </FormField>
              )}
            </div>

            {/* Quick Template Buttons */}
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                Template Cepat Superadmin:
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setManualForm((prev) => ({
                      ...prev,
                      content:
                        "⚠️ *PEMBERITAHUAN PEMELIHARAAN SERVER (MAINTENANCE)* ⚠️\n\n" +
                        "Diberitahukan kepada seluruh rekan Sales & Supervisor, sistem aplikasi sedang menjalani pemeliharaan berkala selama 15 menit.\n\n" +
                        "Mohon tunda penginputan rencana SPK sementara waktu hingga proses sinkronisasi selesai.\n\n" +
                        "Terima kasih atas kerja samanya.\n_Lead Architect & Admin Operasional Cabang 220_",
                    }))
                  }
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium cursor-pointer"
                >
                  Pemberitahuan Maintenance
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setManualForm((prev) => ({
                      ...prev,
                      content:
                        "📞 *KONTAK BANTUAN TEKNIS SYSADMIN / DEVELOPER*\n\n" +
                        "Bagi rekan sales yang mengalami kendala teknis saat login atau input data rencana SPK, silakan laporkan ke kontak pusat kendali:\n\n" +
                        "👤 Sysadmin: *Aziz Rahmansyah*\n" +
                        "📱 WhatsApp: *0812-6800-0999*\n\n" +
                        "Harap sertakan screenshot kendala dan NIP karyawan Anda. Terima kasih.",
                    }))
                  }
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium cursor-pointer"
                >
                  Kontak Bantuan Sysadmin
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setManualForm((prev) => ({
                      ...prev,
                      content:
                        "⏰ *PENGINGAT BATAS CUTOFF INPUT SPK (17:00 WIB)*\n\n" +
                        "Mengingatkan seluruh rekan Sales Cabang 220, batas akhir penginputan rencana SPK hari ini adalah pukul *17:00 WIB*.\n\n" +
                        "Setelah pukul 17:00 WIB, formulir akan otomatis terkunci ke target esok hari (H-1).\nSegera selesaikan inputan Anda.",
                    }))
                  }
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium cursor-pointer"
                >
                  Pengingat Cutoff 17:00 WIB
                </button>
              </div>
            </div>

            <FormField label="Isi Pesan WhatsApp" required>
              <textarea
                value={manualForm.content}
                onChange={(e) => setManualForm({ ...manualForm, content: e.target.value })}
                rows={6}
                placeholder="Tulis pesan pengumuman di sini... Gunakan *tebal*, _miring_, atau ~coret~ untuk memformat teks WhatsApp."
                className="w-full p-3 rounded-2xl bg-white border border-slate-200 text-xs font-mono text-slate-800 focus:border-blue-600 outline-none resize-y"
                required
              />
            </FormField>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-400">
                Pesan akan dimasukkan ke antrean daemon Baileys dan disiarkan secara aman.
              </span>
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isPending}
                leftIcon={<Send className="w-4 h-4" />}
              >
                Kirim Pesan Sekarang
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* ─── TAB 2: JADWAL RUTIN & LAPORAN PIMPINAN ─────────────────────── */}
      {activeSubTab === "SCHEDULE" && (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Clock className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Penjadwalan Blast Rutin & Evaluasi Pimpinan
              </h3>
              <p className="text-xs text-slate-500">
                Atur jadwal siaran rekap harian ke grup sales dan aktivasi laporan ringkasan otomatis ke WhatsApp pimpinan.
              </p>
            </div>
          </div>

          <form onSubmit={handleScheduleSubmit} className="space-y-6">
            {/* Bagian 1: Blast Rutin ke Grup Cabang */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                A. Siaran Otomatis ke Grup Sales Cabang
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Morning Briefing */}
                <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">
                      1. Morning Briefing Rencana Harian
                    </span>
                    <input
                      type="checkbox"
                      checked={scheduleForm.isMorningBlastActive}
                      onChange={(e) =>
                        setScheduleForm({
                          ...scheduleForm,
                          isMorningBlastActive: e.target.checked,
                        })
                      }
                      className="w-4 h-4 rounded text-blue-600 cursor-pointer"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Menyiarkan rekap seluruh rencana SPK yang ditargetkan closing pada hari ini kepada seluruh sales.
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-xs text-slate-600 font-medium">Jam Kirim:</span>
                    <input
                      type="time"
                      value={scheduleForm.morningBlastTime}
                      onChange={(e) =>
                        setScheduleForm({ ...scheduleForm, morningBlastTime: e.target.value })
                      }
                      className="px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-mono font-bold"
                    />
                    <span className="text-xs text-slate-400">WIB</span>
                  </div>
                </div>

                {/* Evening Recap */}
                <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">
                      2. Evening Recap Pasca Cutoff
                    </span>
                    <input
                      type="checkbox"
                      checked={scheduleForm.isEveningBlastActive}
                      onChange={(e) =>
                        setScheduleForm({
                          ...scheduleForm,
                          isEveningBlastActive: e.target.checked,
                        })
                      }
                      className="w-4 h-4 rounded text-blue-600 cursor-pointer"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Menyiarkan rekap inputan sales untuk target besok (H-1) segera setelah jam batas cutoff 17:00 WIB.
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-xs text-slate-600 font-medium">Jam Kirim:</span>
                    <input
                      type="time"
                      value={scheduleForm.eveningBlastTime}
                      onChange={(e) =>
                        setScheduleForm({ ...scheduleForm, eveningBlastTime: e.target.value })
                      }
                      className="px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-mono font-bold"
                    />
                    <span className="text-xs text-slate-400">WIB</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bagian 2: Laporan Evaluasi ke Pimpinan (Staging Ready) */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                  B. Laporan Ringkasan Evaluasi Pimpinan (Japri WhatsApp)
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                  Fase Staging (Siap Diaktifkan)
                </span>
              </div>

              <p className="text-xs text-slate-500">
                Fitur ini disiapkan di database dan engine untuk mengirimkan rekap performa (rasio sales yang disiplin input vs yang belum) langsung ke nomor pribadi WhatsApp atasan.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Branch Manager Toggle */}
                <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-purple-600" />
                      <span className="text-xs font-bold text-slate-800">
                        Kirim ke Branch Manager (BM)
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={scheduleForm.sendReportToBm}
                      onChange={(e) =>
                        setScheduleForm({
                          ...scheduleForm,
                          sendReportToBm: e.target.checked,
                        })
                      }
                      className="w-4 h-4 rounded text-blue-600 cursor-pointer"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Tujuan: {overview?.leadership.bm?.name || "BRANCH MANAGER"} ({overview?.leadership.bm?.phone || "Belum ada nomor WA"})
                  </p>
                </div>

                {/* ADH Toggle */}
                <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-bold text-slate-800">
                        Kirim ke Administration Head (ADH)
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={scheduleForm.sendReportToAdh}
                      onChange={(e) =>
                        setScheduleForm({
                          ...scheduleForm,
                          sendReportToAdh: e.target.checked,
                        })
                      }
                      className="w-4 h-4 rounded text-blue-600 cursor-pointer"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Tujuan: {overview?.leadership.adh?.name || "IDHAM KHOLID"} ({overview?.leadership.adh?.phone || "Belum ada nomor WA"})
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end">
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isPending}
                leftIcon={<Clock className="w-4 h-4" />}
              >
                Simpan Pengaturan Jadwal
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* ─── TAB 3: REKAP & KIRIM DOKUMEN EXCEL ───────────────────────────── */}
      {activeSubTab === "EXCEL" && (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Rekap Dokumen Excel Manual & Kirim ke WhatsApp
              </h3>
              <p className="text-xs text-slate-500">
                Pilih tanggal data rencana SPK yang ingin direkap. Dokumen akan digenerate ke format resmi (.xlsx) dan dikirimkan langsung sebagai lampiran file via WhatsApp.
              </p>
            </div>
          </div>

          <form onSubmit={handleExcelSubmit} className="space-y-4 max-w-xl">
            <FormField label="Pilih Tanggal Rencana SPK" required>
              <Input
                type="date"
                value={excelForm.targetDate}
                onChange={(e) => setExcelForm({ ...excelForm, targetDate: e.target.value })}
                required
              />
            </FormField>

            <FormField label="Kirim Dokumen Ke" required>
              <Select
                value={excelForm.targetType}
                onChange={(e) =>
                  setExcelForm({
                    ...excelForm,
                    targetType: e.target.value as "GROUP" | "BM" | "ADH",
                  })
                }
                options={[
                  { value: "GROUP", label: `Grup Utama Sales Cabang (${overview?.settings.targetGroupName || "Cabang 220"})` },
                  { value: "BM", label: `WhatsApp Pribadi Branch Manager (${overview?.leadership.bm?.name || "BM Cabang"})` },
                  { value: "ADH", label: `WhatsApp Pribadi Administration Head (${overview?.leadership.adh?.name || "ADH Cabang"})` },
                ]}
              />
            </FormField>

            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs space-y-1">
              <strong>Struktur Kolom Rekap Excel:</strong>
              <p className="text-[11px] leading-relaxed">
                No, Tanggal Rencana, Nama Sales, NIP, Nama Pelanggan, Model Unit Toyota, Status Closing, Duplikat, Keterangan Admin, dan Waktu Input.
              </p>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isPending}
                leftIcon={<FileSpreadsheet className="w-4 h-4" />}
              >
                Generate & Kirim File Excel ke WA
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* ─── TAB 4: HISTORI PESAN TERKIRIM (5b) ──────────────────────────── */}
      {activeSubTab === "HISTORY" && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
          {/* Toolbar Header */}
          <div className="p-4 md:p-5 border-b border-slate-200 bg-slate-50/70 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Log Histori Transmisi Pesan WhatsApp
                </h3>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsLoadingHistory(true);
                  loadHistory(historyPage, historySearch, historyStatusFilter, historyTypeFilter);
                }}
                disabled={isLoadingHistory}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer self-end sm:self-auto"
              >
                <RotateCw className={`w-3.5 h-3.5 ${isLoadingHistory ? "animate-spin" : ""}`} />
                <span>Refresh Log</span>
              </button>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
              <div className="relative flex-1 w-full sm:max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  placeholder="Cari isi pesan, nama target, file excel..."
                  className="w-full h-9 pl-9 pr-3 rounded-xl bg-white border border-slate-200 text-xs focus:border-blue-600 outline-none font-medium"
                />
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <select
                  value={historyStatusFilter}
                  onChange={(e) => setHistoryStatusFilter(e.target.value)}
                  className="h-9 px-3 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 outline-none"
                >
                  <option value="ALL">Semua Status</option>
                  <option value="SENT">TERKIRIM</option>
                  <option value="PENDING">MENUNGGU (PENDING)</option>
                  <option value="FAILED">GAGAL</option>
                </select>

                <select
                  value={historyTypeFilter}
                  onChange={(e) => setHistoryTypeFilter(e.target.value)}
                  className="h-9 px-3 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 outline-none"
                >
                  <option value="ALL">Semua Tipe</option>
                  <option value="MANUAL">Manual / Pengumuman</option>
                  <option value="EXCEL_DOCUMENT">Dokumen Excel</option>
                  <option value="MORNING_BRIEFING">Morning Briefing</option>
                  <option value="EVENING_RECAP">Evening Recap</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table Grid */}
          <div className="overflow-x-auto min-h-[300px]">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100/90 text-slate-700 font-bold border-b border-slate-200 select-none">
                <tr>
                  <th className="p-3 w-10 text-center font-mono text-[11px] text-slate-500">#</th>
                  <th className="p-3">Waktu Transmisi</th>
                  <th className="p-3">Tipe Pesan</th>
                  <th className="p-3">Target Penerima</th>
                  <th className="p-3">Ringkasan Isi Pesan</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3">Pengirim</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {isLoadingHistory ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-slate-400">
                      <RotateCw className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
                      <p className="text-xs font-medium">Memuat log pesan...</p>
                    </td>
                  </tr>
                ) : historyList.length > 0 ? (
                  historyList.map((m, index) => {
                    const statusBadge =
                      m.status === "SENT"
                        ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                        : m.status === "PENDING"
                        ? "bg-blue-100 text-blue-800 border-blue-200"
                        : "bg-rose-100 text-rose-800 border-rose-200";

                    return (
                      <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 text-center font-mono text-slate-400 text-[10px]">
                          {(historyPage - 1) * historyPageSize + index + 1}
                        </td>

                        <td className="p-3 font-mono text-slate-700">
                          {m.sentAt || m.createdAt}
                        </td>

                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200 inline-flex items-center gap-1">
                            {m.hasDocument && <FileText className="w-3 h-3 text-emerald-600" />}
                            <span>{m.messageType}</span>
                          </span>
                        </td>

                        <td className="p-3 font-medium text-slate-900">
                          <span>{m.targetName || m.targetJid}</span>
                          <span className="text-[10px] text-slate-400 block font-mono">
                            {m.targetJid}
                          </span>
                        </td>

                        <td className="p-3 text-slate-700 max-w-xs">
                          {m.hasDocument && m.documentName && (
                            <span className="font-mono text-[10px] font-bold text-emerald-700 block mb-0.5">
                              📄 {m.documentName}
                            </span>
                          )}
                          <p className="line-clamp-2 text-slate-600 whitespace-pre-line">
                            {m.content}
                          </p>
                        </td>

                        <td className="p-3 text-center">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusBadge}`}>
                            {m.status}
                          </span>
                          {m.errorMessage && (
                            <span className="text-[9px] text-rose-600 block mt-0.5 truncate max-w-[120px]" title={m.errorMessage}>
                              {m.errorMessage}
                            </span>
                          )}
                        </td>

                        <td className="p-3 text-slate-600 font-medium">
                          {m.createdBy || "DAEMON"}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-slate-400">
                      <p className="text-xs font-semibold text-slate-600">
                        Belum ada riwayat pesan yang tercatat.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-4 border-t border-slate-200 bg-slate-50/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div>
              Menampilkan total <span className="font-bold text-slate-800">{historyTotal}</span> pesan
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={historyPage <= 1 || isLoadingHistory}
                onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 font-semibold"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Sebelumnya</span>
              </button>

              <span className="px-2 py-1 font-mono font-bold text-slate-700">
                Halaman {historyPage} dari {historyTotalPages || 1}
              </span>

              <button
                type="button"
                disabled={historyPage >= historyTotalPages || isLoadingHistory}
                onClick={() => setHistoryPage((p) => p + 1)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 font-semibold"
              >
                <span>Selanjutnya</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
