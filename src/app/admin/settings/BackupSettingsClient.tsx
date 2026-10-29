"use client";

import React, { useState, useEffect, useTransition, useCallback } from "react";
import Button from "@/components/atoms/Button";
import {
  BackupOverviewData,
  BackupScope,
  getBackupOverviewAction,
  generateDatabaseBackupAction,
} from "@/lib/actions/backupAdmin";
import {
  HardDriveDownload,
  RotateCw,
  CheckCircle2,
  AlertTriangle,
  X,
  FileArchive,
  Database,
  Layers,
  Clock,
  Download,
} from "lucide-react";

export default function BackupSettingsClient() {
  const [overview, setOverview] = useState<BackupOverviewData | null>(null);
  const [scope, setScope] = useState<BackupScope>("FULL");
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const loadOverview = useCallback(async () => {
    const res = await getBackupOverviewAction();
    if (res.success && res.data) {
      setOverview(res.data);
    } else if (!res.success) {
      setFeedback({ type: "error", message: res.error || "Gagal memuat status backup." });
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    let ignore = false;
    getBackupOverviewAction().then((res) => {
      if (ignore) return;
      if (res.success && res.data) {
        setOverview(res.data);
      } else if (!res.success) {
        setFeedback({ type: "error", message: res.error || "Gagal memuat status backup." });
      }
      setIsLoading(false);
    });
    return () => {
      ignore = true;
    };
  }, []);

  const handleCreateBackup = () => {
    startTransition(async () => {
      const res = await generateDatabaseBackupAction({ scope });
      if (res.success && res.data) {
        setFeedback({
          type: "success",
          message: `Snapshot "${res.data.fileName}" (${res.data.formattedSize}) berhasil dibuat dan diunduh.`,
        });

        // Trigger browser download via Blob
        try {
          const byteCharacters = atob(res.data.base64Content);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: "application/gzip" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = res.data.fileName;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        } catch (downloadErr) {
          console.error("Gagal memicu unduhan browser:", downloadErr);
        }

        loadOverview();
      } else if (!res.success) {
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
            className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Total Baris Data
            </span>
            <Database className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-xl font-black text-slate-900 mt-1 font-mono">
            {overview?.stats.totalRecords ?? 0}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">
            {overview?.stats.totalProspects ?? 0} prospek + {overview?.stats.totalUsers ?? 0} users
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Estimasi Dump .sql.gz
            </span>
            <FileArchive className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-xl font-black text-blue-600 mt-1 font-mono">
            ~{overview?.stats.estimatedDumpSize || "140 KB"}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">
            Kompresi Gzip Maksimal (Level 9)
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Total Snapshot Dibuat
            </span>
            <Layers className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-xl font-black text-purple-600 mt-1 font-mono">
            {overview?.stats.totalBackupsCreated ?? 0}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">
            Arsip pencadangan tersimpan
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Snapshot Terakhir
            </span>
            <Clock className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-xs font-bold text-slate-800 mt-2 truncate">
            {overview?.stats.lastBackupAt ? overview.stats.lastBackupAt.split(" ")[1] + " WIB" : "Belum Ada"}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">
            {overview?.stats.lastBackupAt ? overview.stats.lastBackupAt.split(" ")[0] : "Siap dicadangkan"}
          </p>
        </div>
      </div>

      {/* Main Download & Scope Container */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <HardDriveDownload className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Pencadangan Database Instan (Streaming Download)
              </h3>
              <p className="text-xs text-slate-500">
                Menghasilkan dump SQL terstruktur dan langsung mengompresinya ke format <code>.sql.gz</code> ke laptop Anda tanpa membebani disk server.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setIsLoading(true);
              loadOverview();
            }}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer self-end sm:self-auto"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Refresh Status</span>
          </button>
        </div>

        {/* Scope Selector */}
        <div className="space-y-3">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
            Pilih Cakupan Data Snapshot:
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                scope === "FULL"
                  ? "bg-blue-50/70 border-blue-400 shadow-2xs"
                  : "bg-white border-slate-200 hover:bg-slate-50"
              }`}
            >
              <input
                type="radio"
                name="backup_scope"
                value="FULL"
                checked={scope === "FULL"}
                onChange={() => setScope("FULL")}
                className="mt-0.5 text-blue-600 cursor-pointer"
              />
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-900 block">
                  1. Seluruh Database (Full Snapshot)
                </span>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Mencakup seluruh tabel: Master Personel (<code>users</code>), Rencana SPK (<code>plan_spk</code>), Konfigurasi WA, dan Histori Pesan.
                </p>
                <span className="inline-block text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md mt-1">
                  Direkomendasikan untuk Disaster Recovery
                </span>
              </div>
            </label>

            <label
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                scope === "TRANSACTIONS_ONLY"
                  ? "bg-blue-50/70 border-blue-400 shadow-2xs"
                  : "bg-white border-slate-200 hover:bg-slate-50"
              }`}
            >
              <input
                type="radio"
                name="backup_scope"
                value="TRANSACTIONS_ONLY"
                checked={scope === "TRANSACTIONS_ONLY"}
                onChange={() => setScope("TRANSACTIONS_ONLY")}
                className="mt-0.5 text-blue-600 cursor-pointer"
              />
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-900 block">
                  2. Transaksi Prospek Saja (plan_spk)
                </span>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Hanya mencadangkan seluruh data transaksi prospek sales cabang tanpa menyertakan password hash akun personel.
                </p>
                <span className="inline-block text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md mt-1">
                  Ukuran Lebih Ringan
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Action Trigger */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-600 space-y-0.5 text-center sm:text-left">
            <span className="font-bold text-slate-900 block">
              Format Hasil: SQL Script Terkompresi (.sql.gz)
            </span>
            <p className="text-[11px] text-slate-500">
              Dapat langsung di-restore menggunakan <code>gunzip -c file.sql.gz | psql</code> pada database manapun.
            </p>
          </div>

          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={handleCreateBackup}
            isLoading={isPending}
            leftIcon={<Download className="w-4 h-4" />}
          >
            Buat & Unduh Snapshot Sekarang (.sql.gz)
          </Button>
        </div>
      </div>

      {/* Snapshot History Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/70">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Riwayat Snapshot Pencadangan Database
          </h4>
        </div>

        <div className="overflow-x-auto min-h-[160px]">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100/90 text-slate-700 font-bold border-b border-slate-200 select-none">
              <tr>
                <th className="p-3 w-10 text-center font-mono text-[11px] text-slate-500">#</th>
                <th className="p-3">Nama File Snapshot</th>
                <th className="p-3">Cakupan Data</th>
                <th className="p-3">Total Baris</th>
                <th className="p-3">Ukuran File</th>
                <th className="p-3">Waktu Pencadangan</th>
                <th className="p-3">Operator</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    <RotateCw className="w-5 h-5 animate-spin mx-auto text-blue-600 mb-1.5" />
                    <p className="text-xs font-medium">Memuat riwayat backup...</p>
                  </td>
                </tr>
              ) : overview && overview.recentLogs.length > 0 ? (
                overview.recentLogs.map((log, index) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 text-center font-mono text-slate-400 text-[10px]">
                      {index + 1}
                    </td>
                    <td className="p-3 font-mono font-bold text-slate-900">
                      {log.fileName}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                        {log.scope}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-slate-700">
                      {log.recordsCount} baris
                    </td>
                    <td className="p-3 font-mono font-bold text-emerald-600">
                      {log.formattedSize}
                    </td>
                    <td className="p-3 font-mono text-slate-600">
                      {log.createdAt}
                    </td>
                    <td className="p-3 text-slate-600">
                      {log.createdBy || "SUPERADMIN"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    <p className="text-xs font-semibold text-slate-600">
                      Belum ada riwayat snapshot backup yang dicatat. Klik tombol di atas untuk membuat snapshot pertama.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

