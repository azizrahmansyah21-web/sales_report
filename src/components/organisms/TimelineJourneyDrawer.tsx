"use client";

import React from "react";
import { TimelineDrawerData } from "@/lib/mockData";
import Badge from "@/components/atoms/Badge";
import DuplicateBadge from "@/components/atoms/DuplicateBadge";
import Avatar from "@/components/atoms/Avatar";
import {
  X,
  Clock,
  Phone,
  MapPin,
  Car,
  User,
  CheckCircle2,
  AlertTriangle,
  MessageSquare,
  ShieldCheck,
} from "lucide-react";

export interface TimelineJourneyDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  data: TimelineDrawerData | null;
}

export const TimelineJourneyDrawer: React.FC<TimelineJourneyDrawerProps> = ({
  isOpen,
  onClose,
  data,
}) => {
  if (!isOpen || !data) return null;

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
        <div className="p-5 border-b border-slate-200 bg-slate-50/80 flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                Audit Trail Prospek
              </span>
              <DuplicateBadge
                frequency={data.duplicateCount}
                text={`${data.duplicateCount}x Riwayat Terinput`}
                size="sm"
              />
            </div>

            <h3 className="text-lg font-black text-slate-900 tracking-tight">
              {data.customerName}
            </h3>

            <div className="flex items-center gap-3 text-xs text-slate-600 mt-1">
              <span className="flex items-center gap-1 font-mono">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                {data.customerPhone}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {data.location}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
            aria-label="Tutup drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Scrollable Content: Timeline Steps */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Dispute Callout Box */}
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-xs text-amber-950 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Deteksi Duplikasi Nomor Handphone</span>
            </div>
            <p className="leading-relaxed">
              Nomor ini telah didaftarkan sebanyak {data.duplicateCount} kali oleh
              sales advisor berbeda dalam kurun waktu 40 hari terakhir. Silakan tinjau
              touchpoint di bawah ini untuk verifikasi mediasi komisi.
            </p>
          </div>

          {/* Timeline Touchpoint Items */}
          <div className="space-y-6 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200">
            {data.touchpoints.map((tp, idx) => {
              const isLatest = idx === data.touchpoints.length - 1;
              return (
                <div key={tp.id} className="relative flex items-start gap-4 pl-1">
                  {/* Step Bubble Indicator */}
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 z-10 ring-4 ring-white ${
                      isLatest
                        ? "bg-blue-600 text-white ring-blue-100"
                        : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {tp.stepNumber}
                  </div>

                  {/* Step Card Content */}
                  <div
                    className={`flex-1 rounded-2xl p-4 border transition-all ${
                      isLatest
                        ? "bg-blue-50/40 border-blue-200 shadow-xs"
                        : "bg-white border-slate-200/90"
                    }`}
                  >
                    {/* Step Title & Date */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Touchpoint {tp.stepNumber}
                        </span>
                        <h4 className="font-bold text-sm text-slate-900">
                          {tp.stepTitle}
                        </h4>
                      </div>

                      <span className="text-[11px] text-slate-500 font-medium whitespace-nowrap flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {tp.date}
                      </span>
                    </div>

                    {/* Vehicle */}
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 mb-2">
                      <Car className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className="line-clamp-1">{tp.vehicle}</span>
                    </div>

                    {/* Notes / Description */}
                    <p className="text-xs text-slate-600 bg-slate-50/80 p-2.5 rounded-xl border border-slate-100 leading-relaxed mb-3 italic">
                      &quot;{tp.description}&quot;
                    </p>

                    {/* Sales Advisor & Status Badge */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                      <div className="flex items-center gap-2">
                        <Avatar name={tp.salesName} size="sm" />
                        <div>
                          <p className="font-bold text-slate-900 leading-none">
                            {tp.salesName}
                          </p>
                          <p className="text-[10px] text-slate-500 font-mono mt-0.5 leading-none">
                            {tp.salesNpk}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                          tp.statusColor === "green"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : tp.statusColor === "amber"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-blue-50 text-blue-700 border-blue-200"
                        }`}
                      >
                        {tp.statusBadge}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Drawer Action Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                alert("Mediasi disetujui: Komisi ditetapkan split 50:50.");
                onClose();
              }}
              className="flex-1 h-11 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-xs"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Selesaikan Mediasi (Split 50:50)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const clean = data.customerPhone.replace(/[^0-9]/g, "");
                window.open(`https://wa.me/62${clean.slice(1)}`, "_blank");
              }}
              className="h-11 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              title="Chat WhatsApp Customer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>WhatsApp</span>
            </button>
          </div>

          <p className="text-[10px] text-slate-400 text-center">
            Penyelesaian mediasi akan dicatat pada log audit DMS Branch 247.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TimelineJourneyDrawer;
