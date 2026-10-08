"use client";

import React from "react";
import Avatar from "@/components/atoms/Avatar";
import {
  X,
  Clock,
  MapPin,
  Car,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  Users,
  ShieldAlert,
  Loader2,
} from "lucide-react";
import type { SpkStatus } from "@prisma/client";

export interface TimelineDrawerPlanItem {
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
    phone?: string | null;
  };
}

export interface TimelineJourneyDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  customerName: string;
  plans: TimelineDrawerPlanItem[];
  isLoading?: boolean;
}

export const TimelineJourneyDrawer: React.FC<TimelineJourneyDrawerProps> = ({
  isOpen,
  onClose,
  customerName,
  plans,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  // Identify distinct sales advisors who submitted this customer
  const distinctSales = Array.from(new Set(plans.map((p) => p.sales.name)));
  const isMultiSalesDispute = distinctSales.length > 1;
  const hasPreviousFailed = plans.some(
    (p) => p.isRepeatFailed || p.spkStatus === "BELUM_BERHASIL"
  );

  return (
    <div className="fixed inset-0 z-50 flex justify-end antialiased">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div className="relative z-10 w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between border-l border-slate-200 overflow-hidden animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50/90 flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                Audit Trail Rencana SPK
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                {plans.length}x Rencana Terdaftar
              </span>
            </div>

            <h3 className="text-lg font-black text-slate-900 tracking-tight">
              {customerName}
            </h3>

            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>PT Agung Automall — Cabang UjungBatu (247)</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
            aria-label="Tutup drawer riwayat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Scrollable Content: Timeline Steps */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <p className="text-xs font-semibold">Memuat riwayat audit customer...</p>
            </div>
          ) : (
            <>
              {/* Multi-Sales Dispute Warning Banner */}
              {isMultiSalesDispute && (
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-xs text-amber-950 space-y-1.5 shadow-2xs">
                  <div className="flex items-center gap-1.5 font-bold text-amber-900">
                    <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>Peringatan Potensi Sengketa Lead</span>
                  </div>
                  <p className="leading-relaxed">
                    Customer ini terdaftar pada <strong>{distinctSales.length} sales advisor berbeda</strong> ({distinctSales.join(", ")}).
                    Sesuai SOP cabang 247, mediasi dilakukan oleh SPV/Admin sebelum penutupan SPK.
                  </p>
                </div>
              )}

              {/* Repeat Failed Notification */}
              {hasPreviousFailed && !isMultiSalesDispute && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-950 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-rose-900">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>Riwayat Penundaan Closing</span>
                  </div>
                  <p className="leading-relaxed text-rose-800">
                    Customer ini memiliki catatan rencana yang belum berhasil closing pada jadwal sebelumnya. Tinjau catatan evaluasi admin di bawah ini untuk melihat kendala transaksi.
                  </p>
                </div>
              )}

              {/* Timeline Items List */}
              <div className="space-y-5 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200">
                {plans.map((item, idx) => {
                  const isLatest = idx === plans.length - 1;
                  const targetDate = new Date(item.planDate).toLocaleDateString(
                    "id-ID",
                    {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    }
                  );
                  const inputTime = new Date(item.createdAt).toLocaleDateString(
                    "id-ID",
                    {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  );

                  return (
                    <div
                      key={item.id}
                      className="relative flex items-start gap-4 pl-1"
                    >
                      {/* Step Number Circle */}
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 z-10 ring-4 ring-white ${
                          item.spkStatus === "BERHASIL"
                            ? "bg-emerald-600 text-white"
                            : item.spkStatus === "BELUM_BERHASIL"
                            ? "bg-rose-600 text-white"
                            : isLatest
                            ? "bg-blue-600 text-white"
                            : "bg-slate-300 text-slate-700"
                        }`}
                      >
                        {idx + 1}
                      </div>

                      {/* Card Body */}
                      <div
                        className={`flex-1 rounded-2xl p-4 border transition-all space-y-2.5 ${
                          isLatest
                            ? "bg-blue-50/30 border-blue-200 shadow-2xs"
                            : "bg-white border-slate-200"
                        }`}
                      >
                        {/* Header: Step Info & Status Badge */}
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                              Entri ke-{idx + 1} • Target: {targetDate}
                            </span>
                            <div className="flex items-center gap-1.5 font-bold text-slate-900 text-sm mt-0.5">
                              <Car className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                              <span>{item.unitName}</span>
                            </div>
                          </div>

                          {/* Realization Status Badge */}
                          {item.spkStatus === "BERHASIL" ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>SPK Berhasil</span>
                            </span>
                          ) : item.spkStatus === "BELUM_BERHASIL" ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
                              <XCircle className="w-3 h-3 text-rose-600" />
                              <span>Belum Berhasil</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                              <Clock className="w-3 h-3 text-amber-600" />
                              <span>Menunggu</span>
                            </span>
                          )}
                        </div>

                        {/* Admin Evaluation Notes */}
                        {item.keterangan ? (
                          <div className="rounded-xl bg-slate-50 border border-slate-200 p-2.5 text-xs text-slate-700 flex items-start gap-2">
                            <FileText className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                                Catatan Evaluasi:
                              </span>
                              <p className="text-[11px] text-slate-700 leading-relaxed italic">
                                &quot;{item.keterangan}&quot;
                              </p>
                            </div>
                          </div>
                        ) : (
                          <p className="text-[10px] text-slate-400 italic">
                            Belum ada catatan evaluasi untuk entri ini.
                          </p>
                        )}

                        {/* Footer Info: Sales Advisor & Created Time */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                          <div className="flex items-center gap-2">
                            <Avatar name={item.sales.name} size="sm" />
                            <div>
                              <p className="font-bold text-slate-900 leading-none">
                                {item.sales.name}
                              </p>
                              <p className="text-[10px] text-slate-500 font-mono mt-0.5 leading-none">
                                {item.sales.nip || "SALES-ATUB"} • {item.sales.title || "Sales"}
                              </p>
                            </div>
                          </div>

                          <span className="text-[10px] text-slate-400">
                            Diinput: {inputTime}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>
            Total <strong>{plans.length} rencana</strong> tercatat di database cabang.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

export default TimelineJourneyDrawer;
