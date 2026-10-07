"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import MobilePwaLayout from "@/components/templates/MobilePwaLayout";
import FormField from "@/components/molecules/FormField";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import Button from "@/components/atoms/Button";
import ToastAlert from "@/components/molecules/ToastAlert";
import { TOYOTA_MODELS } from "@/lib/mockData";
import { createPlanSpk } from "@/lib/actions/planSpk";
import type { PlanSPK } from "@prisma/client";
import {
  User,
  Car,
  Calendar,
  Send,
  CheckCircle2,
  AlertTriangle,
  History,
  Lock,
  Sparkles,
} from "lucide-react";

// Format helper to initialize tomorrow's date (H-1 operational requirement)
function getTomorrowDateString(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split("T")[0];
}

function getTodayDateString(): string {
  return new Date().toISOString().split("T")[0];
}

export default function InputPlanSpkPage() {
  const { data: session } = useSession();
  const salesName = session?.user?.name || "Sales Advisor";
  const userId = session?.user?.id;

  const [customerName, setCustomerName] = useState("");
  const [unitName, setUnitName] = useState("");
  const [planDate, setPlanDate] = useState(getTomorrowDateString());

  const [isPending, startTransition] = useTransition();
  const [submittedPlan, setSubmittedPlan] = useState<PlanSPK | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!userId) {
      setErrorMessage("Sesi login tidak terdeteksi. Silakan muat ulang halaman.");
      return;
    }

    if (!customerName.trim()) {
      setErrorMessage("Nama customer wajib diisi");
      return;
    }

    if (!unitName) {
      setErrorMessage("Pilihan unit Toyota wajib dipilih");
      return;
    }

    startTransition(async () => {
      try {
        const result = await createPlanSpk(userId, {
          customerName: customerName.trim(),
          unitName,
          planDate,
        });

        if (!result.success) {
          setErrorMessage(result.error);
          return;
        }

        setSubmittedPlan(result.data);
        setCustomerName("");
        setUnitName("");
        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch (err) {
        console.error("[InputPlanSpkPage] Submit error:", err);
        setErrorMessage("Terjadi kesalahan jaringan saat menyimpan data.");
      }
    });
  };

  const handleResetForNextInput = () => {
    setSubmittedPlan(null);
    setErrorMessage(null);
  };

  return (
    <MobilePwaLayout salesName={salesName} isOnline={true}>
      <div className="space-y-4">
        {/* Success feedback state */}
        {submittedPlan && (
          <div className="space-y-3 animate-in fade-in duration-200">
            <ToastAlert
              type="success"
              title="Rencana SPK Berhasil Diajukan!"
              message={`Rencana SPK untuk ${submittedPlan.customerName} (${submittedPlan.unitName}) telah tercatat dalam sistem monitoring.`}
              onDismiss={() => setSubmittedPlan(null)}
            />

            {/* Special highlight for repeated failed customer */}
            {submittedPlan.isRepeatFailed && (
              <div className="rounded-2xl bg-amber-50 border border-amber-300 p-3.5 text-xs text-amber-950 flex items-start gap-2.5 shadow-xs">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-bold text-amber-900">
                    Catatan Khusus: Riwayat Belum Berhasil
                  </p>
                  <p className="text-[11px] leading-relaxed text-amber-900/90">
                    Customer ini sebelumnya pernah tercatat belum berhasil SPK.
                    Rencana baru tetap berhasil disimpan dan akan ditandai khusus untuk
                    perhatian Supervisor (SPV).
                  </p>
                </div>
              </div>
            )}

            {/* Quick action buttons after submission */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={handleResetForNextInput}
                className="h-10 rounded-xl bg-blue-50 hover:bg-blue-100 active:bg-blue-200 text-blue-700 border border-blue-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Input Customer Lain</span>
              </button>
              <Link
                href="/riwayat"
                className="h-10 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 border border-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
              >
                <History className="w-3.5 h-3.5" />
                <span>Lihat Riwayat SPK</span>
              </Link>
            </div>
          </div>
        )}

        {/* Error notification */}
        {errorMessage && (
          <div className="rounded-2xl bg-rose-50 border border-rose-200 p-3.5 text-xs text-rose-800 flex items-start gap-2.5 animate-in fade-in">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <p className="font-medium leading-relaxed">{errorMessage}</p>
          </div>
        )}

        {/* Section title */}
        <div className="border-b border-slate-200/80 pb-3">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-semibold mb-1">
            <Calendar className="w-3 h-3 text-blue-600" />
            <span>Target Operasional H-1</span>
          </div>
          <h2 className="text-lg font-black text-slate-900 tracking-tight">
            Input Rencana SPK
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
            Laporkan rencana penutupan SPK esok hari untuk evaluasi dan approval realisasi oleh SPV.
          </p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Field 1: Customer Name */}
          <FormField
            label="Nama Lengkap Customer"
            required
            requiredBadge
            hint="Sesuai KTP calon pembeli kendaraan"
          >
            <Input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Contoh: Bambang Sudiro, S.E."
              leftIcon={<User className="w-4 h-4" />}
              required
              disabled={isPending}
            />
          </FormField>

          {/* Field 2: Toyota Unit Selection */}
          <FormField
            label="Model / Varian Unit Toyota"
            required
            requiredBadge
            hint="Pilih unit yang direncanakan deal SPK"
          >
            <Select
              value={unitName}
              onChange={(e) => setUnitName(e.target.value)}
              options={TOYOTA_MODELS}
              placeholder="-- Pilih Model Unit Toyota --"
              leftIcon={<Car className="w-4 h-4" />}
              required
              disabled={isPending}
            />
          </FormField>

          {/* Field 3: Target Plan Date */}
          <FormField
            label="Tanggal Rencana Realisasi SPK"
            required
            requiredBadge
            hint="Default target besok (H-1). Bisa disesuaikan jika rencana untuk hari lain."
          >
            <div className="space-y-2">
              <Input
                type="date"
                value={planDate}
                onChange={(e) => setPlanDate(e.target.value)}
                leftIcon={<Calendar className="w-4 h-4" />}
                required
                disabled={isPending}
              />
              {/* Shortcut buttons to quickly toggle target date */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPlanDate(getTomorrowDateString())}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
                    planDate === getTomorrowDateString()
                      ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  Besok (Target H)
                </button>
                <button
                  type="button"
                  onClick={() => setPlanDate(getTodayDateString())}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
                    planDate === getTodayDateString()
                      ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  Hari Ini
                </button>
              </div>
            </div>
          </FormField>

          {/* Form submit button */}
          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full shadow-md shadow-blue-600/20"
              isLoading={isPending}
              rightIcon={<Send className="w-4 h-4" />}
            >
              Simpan Rencana SPK
            </Button>
          </div>

          {/* Security footnote */}
          <div className="text-center pt-2 text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>Data otomatis tersimpan ke PostgreSQL & siap direkap jam 08:00</span>
          </div>
        </form>
      </div>
    </MobilePwaLayout>
  );
}
