/**
 * Komponen Klien Form Input Rencana SPK H-1
 * Agung Toyota UjungBatu (Cabang 220)
 *
 * Komponen interaktif mobile-first bagi Sales untuk mendaftarkan rencana closing.
 * Menggunakan nilai tanggal awal dari server untuk mencegah React Hydration Mismatch,
 * serta menampilkan riwayat closing berhasil sebagai motivasi kerja sales.
 */

"use client";

import React, {
  useState,
  useEffect,
  useSyncExternalStore,
  useTransition,
  useCallback,
} from "react";
import MobilePwaLayout from "@/components/templates/MobilePwaLayout";
import FormField from "@/components/molecules/FormField";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import Button from "@/components/atoms/Button";
import ToastAlert from "@/components/molecules/ToastAlert";
import { TOYOTA_MODELS } from "@/lib/mockData";
import { createPlanSpk } from "@/lib/actions/planSpk";
import type { SalesDealRecord } from "@/lib/actions/planSpk";
import type { PlanSPK } from "@prisma/client";
import type { SmartDateOptionsWIB } from "@/lib/utils/wibDate";
import { formatDisplayDateWIB } from "@/lib/utils/wibDate";
import {
  saveOfflinePlan,
  getPendingCount,
  syncOfflinePlans,
} from "@/lib/pwa/offlineQueue";
import { cn } from "@/lib/utils";
import {
  User,
  Car,
  Send,
  AlertTriangle,
  CheckCircle2,
  Clock,
  WifiOff,
  RefreshCw,
} from "lucide-react";

// ─── KOMPONEN PILIHAN TANGGAL PINTAR (SMART DATE) ───────────────────────────

interface DateToggleProps {
  /** Pilihan tanggal ISO YYYY-MM-DD saat ini */
  selected: string;
  /** Callback saat pengguna memilih tanggal */
  onSelect: (date: string) => void;
  /** Status disabled saat form sedang pending */
  disabled?: boolean;
  /** Konfigurasi tanggal pintar dari server */
  smartDate: SmartDateOptionsWIB;
}

function DateToggle({ selected, onSelect, disabled, smartDate }: DateToggleProps) {
  const options = [
    ...(!smartDate.isTodayDisabled
      ? [
          {
            label: smartDate.today.label,
            date: smartDate.today.dateStr,
            display: smartDate.today.displayDate,
            badge: "Hari Ini",
          },
        ]
      : []),
    {
      label: smartDate.tomorrow.label,
      date: smartDate.tomorrow.dateStr,
      display: smartDate.tomorrow.displayDate,
      badge: "Target H-1",
    },
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        {options.map((opt) => {
          const isSelected = selected === opt.date;
          return (
            <button
              key={opt.date}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(opt.date)}
              className={`flex-1 min-h-[44px] px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 select-none ${
                isSelected
                  ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                  : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 disabled:opacity-50"
              }`}
            >
              <span className="leading-tight">{opt.label}</span>
              <span
                className={`text-[10px] font-medium leading-none ${
                  isSelected ? "text-blue-100" : "text-slate-400"
                }`}
              >
                {opt.display}
              </span>
            </button>
          );
        })}
      </div>

      {smartDate.isTodayDisabled && (
        <p className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-2 flex items-center gap-1.5 leading-snug">
          <Clock className="w-3.5 h-3.5 shrink-0 text-amber-700" />
          <span>
            Waktu operasional sudah melewati pukul 16:00 WIB. Pendaftaran SPK
            otomatis dialihkan untuk rencana hari esok.
          </span>
        </p>
      )}
    </div>
  );
}

// ─── RIWAYAT CLOSING SALES (DEAL HISTORY) ───────────────────────────────────

interface DealHistoryProps {
  deals: SalesDealRecord[];
}

function DealHistorySection({ deals }: DealHistoryProps) {
  if (deals.length === 0) return null;

  return (
    <section
      aria-label="Riwayat Closing Berhasil"
      className="space-y-2.5 pt-1"
    >
      <div className="flex items-center gap-2">
        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
          Riwayat Closing Sah Anda ({deals.length} Terakhir)
        </h3>
      </div>

      <div className="space-y-2">
        {deals.map((deal) => {
          const dateFormatted = formatDisplayDateWIB(deal.planDate);
          return (
            <div
              key={deal.id}
              className="flex items-center justify-between bg-emerald-50/70 border border-emerald-200 rounded-xl px-3.5 py-2.5 gap-2"
            >
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">
                  {deal.customerName}
                </p>
                <p className="text-[11px] text-slate-600 truncate mt-0.5">
                  {deal.unitName}
                </p>
              </div>
              <div className="text-right shrink-0">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  DEAL
                </span>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                  {dateFormatted}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ─── SUBSCRIBER KONEKSI JARINGAN (REACT 18/19 HYDRATION SAFE) ───────────────

function subscribeNetwork(callback: () => void) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

function getNetworkSnapshot() {
  return navigator.onLine;
}

function getServerNetworkSnapshot() {
  return true;
}

// ─── MAIN CLIENT FORM COMPONENT ─────────────────────────────────────────────

export interface InputFormClientProps {
  /** ID pengguna sales yang sedang login (opsional) */
  userId?: string;
  /** Nama lengkap sales untuk salam antarmuka */
  salesName: string;
  /** Daftar riwayat SPK berstatus DEAL milik sales */
  dealHistory: SalesDealRecord[];
  /** Opsi tanggal cerdas yang dihitung dari sisi server */
  initialSmartDate: SmartDateOptionsWIB;
}

export default function InputFormClient({
  salesName,
  dealHistory,
  initialSmartDate,
}: InputFormClientProps) {
  const [customerName, setCustomerName] = useState("");
  const [unitName, setUnitName] = useState("");
  const [planDate, setPlanDate] = useState(initialSmartDate.defaultPlanDate);

  const [isPending, startTransition] = useTransition();
  const [submittedPlan, setSubmittedPlan] = useState<PlanSPK | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // ─── STATE PWA OFFLINE QUEUE (INDEXEDDB) ───────────────────────────────────
  const isOnline = useSyncExternalStore(
    subscribeNetwork,
    getNetworkSnapshot,
    getServerNetworkSnapshot
  );
  const [offlineCount, setOfflineCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [offlineSavedNotice, setOfflineSavedNotice] = useState(false);
  const [syncNotice, setSyncNotice] = useState<{
    synced: number;
    failed: number;
  } | null>(null);

  const triggerAutoSync = useCallback(async () => {
    if (typeof navigator !== "undefined" && !navigator.onLine) return;
    const count = await getPendingCount();
    if (count === 0) return;

    setIsSyncing(true);
    try {
      const { syncedCount, failedCount } = await syncOfflinePlans();
      const remaining = await getPendingCount();
      setOfflineCount(remaining);

      if (syncedCount > 0 || failedCount > 0) {
        setSyncNotice({ synced: syncedCount, failed: failedCount });
      }
    } finally {
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      getPendingCount().then((count) => setOfflineCount(count));
    });

    const handleOnline = () => {
      triggerAutoSync();
    };

    window.addEventListener("online", handleOnline);
    return () => {
      window.removeEventListener("online", handleOnline);
    };
  }, [triggerAutoSync]);

  const handleResetForNextInput = useCallback(() => {
    setSubmittedPlan(null);
    setErrorMessage(null);
    setOfflineSavedNotice(false);
    setCustomerName("");
    setUnitName("");
    setPlanDate(initialSmartDate.defaultPlanDate);
  }, [initialSmartDate.defaultPlanDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setOfflineSavedNotice(false);
    setSyncNotice(null);

    if (!customerName.trim()) {
      setErrorMessage("Nama pelanggan wajib diisi.");
      return;
    }

    if (!unitName.trim()) {
      setErrorMessage("Pilih model unit Toyota terlebih dahulu.");
      return;
    }

    startTransition(async () => {
      // 1. Tangani jika koneksi browser terdeteksi offline
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        try {
          await saveOfflinePlan({
            customerName: customerName.trim(),
            unitName: unitName.trim(),
            planDate,
          });
          const count = await getPendingCount();
          setOfflineCount(count);
          setOfflineSavedNotice(true);
          setCustomerName("");
          setUnitName("");
        } catch {
          setErrorMessage("Gagal menyimpan ke memori lokal perangkat.");
        }
        return;
      }

      // 2. Jika online, coba kirim ke server Action dengan fallback ke antrean offline
      try {
        const result = await createPlanSpk({
          customerName: customerName.trim(),
          unitName: unitName.trim(),
          planDate,
        });

        if (!result.success) {
          setErrorMessage(result.error);
          return;
        }

        setSubmittedPlan(result.data);
        setCustomerName("");
        setUnitName("");
      } catch {
        // Terjadi kegagalan jaringan saat pengiriman berlangsung (blank spot mendadak)
        try {
          await saveOfflinePlan({
            customerName: customerName.trim(),
            unitName: unitName.trim(),
            planDate,
          });
          const count = await getPendingCount();
          setOfflineCount(count);
          setOfflineSavedNotice(true);
          setCustomerName("");
          setUnitName("");
        } catch {
          setErrorMessage(
            "Koneksi jaringan terputus dan gagal menyimpan antrean lokal."
          );
        }
      }
    });
  };

  return (
    <MobilePwaLayout salesName={salesName}>
      <div className="space-y-4">
        {/* Banner Identitas & Intisari Input */}
        <div className="rounded-2xl bg-white border border-slate-200/90 p-4 shadow-2xs">
          <h2 className="text-base font-black text-slate-900 tracking-tight">
            Input Rencana SPK H-1
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftarkan rencana prospek SPK esok hari untuk evaluasi target operasional cabang.
          </p>
        </div>

        {/* Indikator Status Offline Perangkat */}
        {!isOnline && (
          <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-900 text-white text-xs font-semibold shadow-xs animate-in fade-in duration-200">
            <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Koneksi internet terputus. Formulir dialihkan ke antrean offline HP.</span>
          </div>
        )}

        {/* Banner Antrean Offline di HP */}
        {offlineCount > 0 && (
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 flex items-center justify-between gap-3 shadow-2xs animate-in fade-in duration-200">
            <div className="flex items-center gap-2.5 min-w-0">
              <Clock className="w-4 h-4 text-amber-700 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-bold leading-tight">
                  {offlineCount} Rencana Menunggu Sinkronisasi
                </p>
                <p className="text-[11px] text-amber-800/90 leading-tight mt-0.5 truncate">
                  Tersimpan di memori HP dan siap dikirim ke server.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={triggerAutoSync}
              disabled={isSyncing || !isOnline}
              className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white text-xs font-bold shrink-0 transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-xs"
            >
              <RefreshCw className={cn("w-3.5 h-3.5", isSyncing && "animate-spin")} />
              <span>{isSyncing ? "Mengirim..." : "Kirim"}</span>
            </button>
          </div>
        )}

        {/* Notifikasi Penyimpanan Offline Berhasil */}
        {offlineSavedNotice && (
          <ToastAlert
            type="warning"
            title="Tersimpan di Antrean Offline HP"
            message="Rencana SPK telah aman tersimpan di perangkat. Sistem akan mengirimkannya ke server secara otomatis saat sinyal kembali."
            onDismiss={() => setOfflineSavedNotice(false)}
          />
        )}

        {/* Notifikasi Hasil Sinkronisasi */}
        {syncNotice && (
          <ToastAlert
            type={syncNotice.failed === 0 ? "success" : "info"}
            title="Hasil Sinkronisasi Data"
            message={`${syncNotice.synced} rencana SPK berhasil dikirim ke server.${
              syncNotice.failed > 0
                ? ` (${syncNotice.failed} item tertunda karena validasi atau sinyal)`
                : ""
            }`}
            onDismiss={() => setSyncNotice(null)}
          />
        )}

        {/* Notifikasi Sukses Pendaftaran */}
        {submittedPlan && (
          <div className="rounded-2xl bg-emerald-50 border border-emerald-300 p-4 space-y-3 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-xs font-black text-emerald-900 uppercase tracking-wider">
                  Rencana SPK Berhasil Disimpan
                </h3>
                <p className="text-xs text-emerald-800 font-bold mt-0.5 truncate">
                  {submittedPlan.customerName}
                </p>
                <p className="text-[11px] text-emerald-700 font-medium">
                  {submittedPlan.unitName} • Target:{" "}
                  {formatDisplayDateWIB(submittedPlan.planDate)}
                </p>
              </div>
            </div>

            {submittedPlan.isRepeatFailed && (
              <div className="p-2.5 rounded-xl bg-amber-100/80 border border-amber-300 text-amber-900 text-xs font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-700" />
                <span>
                  Perhatian: Prospek ini tercatat pernah belum berhasil sebelumnya.
                </span>
              </div>
            )}

            <button
              type="button"
              onClick={handleResetForNextInput}
              className="w-full min-h-[44px] py-2 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors cursor-pointer shadow-2xs"
            >
              + Input Rencana SPK Lainnya
            </button>
          </div>
        )}

        {/* Feedback Error Validasi */}
        {errorMessage && (
          <ToastAlert
            type="error"
            title="Pendaftaran Belum Berhasil"
            message={errorMessage}
            onDismiss={() => setErrorMessage(null)}
          />
        )}

        {/* Formulir Input Utama */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl bg-white border border-slate-200/90 p-4 shadow-2xs space-y-4"
        >
          {/* Input Nama Pelanggan */}
          <FormField
            label="Nama Pelanggan / Prospek"
            required
            hint="Masukkan nama lengkap customer yang akan closing SPK"
          >
            <Input
              type="text"
              placeholder="Contoh: Bpk. Idham Kholid"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              disabled={isPending}
              leftIcon={<User className="w-4 h-4 text-slate-400" />}
              autoComplete="name"
              required
            />
          </FormField>

          {/* Pemilihan Unit Model Toyota */}
          <FormField
            label="Model Kendaraan Toyota"
            required
            hint="Pilih unit yang diminati customer"
          >
            <Select
              options={TOYOTA_MODELS}
              placeholder="Pilih Model Unit Toyota..."
              value={unitName}
              onChange={(e) => setUnitName(e.target.value)}
              disabled={isPending}
              leftIcon={<Car className="w-4 h-4 text-slate-400" />}
              required
            />
          </FormField>

          {/* Pemilihan Tanggal Cerdas (Smart Date H-1) */}
          <FormField
            label="Target Tanggal SPK"
            required
            hint="Pilih tanggal target realisasi SPK cabang"
          >
            <DateToggle
              selected={planDate}
              onSelect={setPlanDate}
              disabled={isPending}
              smartDate={initialSmartDate}
            />
          </FormField>

          {/* Tombol Simpan Rencana */}
          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full min-h-[48px] shadow-md shadow-blue-600/20"
              isLoading={isPending}
              rightIcon={<Send className="w-4 h-4" />}
            >
              Simpan Rencana SPK
            </Button>
          </div>
        </form>

        {/* Riwayat Closing Sales (Motivation Section) */}
        {dealHistory.length > 0 && (
          <div className="pt-2 border-t border-slate-200">
            <DealHistorySection deals={dealHistory} />
          </div>
        )}
      </div>
    </MobilePwaLayout>
  );
}
