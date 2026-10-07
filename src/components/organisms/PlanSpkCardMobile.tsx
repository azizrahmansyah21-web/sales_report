import React from "react";
import { cn } from "@/lib/utils";
import { Calendar, Car, AlertTriangle, Clock, CheckCircle2, XCircle, FileText } from "lucide-react";
import type { PlanSPK } from "@prisma/client";

export interface PlanSpkCardMobileProps {
  plan: PlanSPK;
}

export const PlanSpkCardMobile: React.FC<PlanSpkCardMobileProps> = ({ plan }) => {
  const isPending = plan.spkStatus === "PENDING";
  const isSuccess = plan.spkStatus === "BERHASIL";
  const isFailed = plan.spkStatus === "BELUM_BERHASIL";

  // Format plan date for display
  const formattedDate = new Date(plan.planDate).toLocaleDateString("id-ID", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div
      className={cn(
        "rounded-2xl border p-4 transition-all duration-200 shadow-xs relative flex flex-col gap-2.5",
        plan.isRepeatFailed
          ? "bg-amber-50/70 border-amber-300 ring-1 ring-amber-300/40"
          : isSuccess
          ? "bg-emerald-50/40 border-emerald-200"
          : "bg-white border-slate-200/90 hover:border-slate-300"
      )}
    >
      {/* Header: Customer Name and Status Badge */}
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-0.5">
          <h4 className="font-bold text-slate-900 text-sm leading-snug">
            {plan.customerName}
          </h4>
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <Car className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="font-medium text-slate-700">{plan.unitName}</span>
          </div>
        </div>

        {/* Realization Status Badge */}
        {isPending && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 shrink-0">
            <Clock className="w-3 h-3 text-amber-600" />
            <span>Menunggu</span>
          </span>
        )}

        {isSuccess && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>SPK Berhasil</span>
          </span>
        )}

        {isFailed && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-800 border border-rose-200 shrink-0">
            <XCircle className="w-3 h-3 text-rose-600" />
            <span>Belum Berhasil</span>
          </span>
        )}
      </div>

      {/* Target Plan Date & Badges */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
        <div className="flex items-center gap-1 text-[11px] text-slate-600 font-medium">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>Target: {formattedDate}</span>
        </div>

        <div className="flex items-center gap-1.5">
          {plan.isRepeatFailed && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
              <AlertTriangle className="w-3 h-3 text-amber-700" />
              <span>Gagal Berulang</span>
            </span>
          )}
          {plan.isDuplicate && !plan.isRepeatFailed && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
              Duplikat
            </span>
          )}
        </div>
      </div>

      {/* Admin Notes if provided */}
      {plan.keterangan && (
        <div className="rounded-xl bg-slate-50 border border-slate-200 p-2.5 text-xs text-slate-700 flex items-start gap-2">
          <FileText className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Catatan Evaluasi:
            </span>
            <p className="text-[11px] text-slate-700 leading-relaxed font-normal">
              {plan.keterangan}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanSpkCardMobile;
