"use client";

import React from "react";
import { cn } from "@/lib/utils";
import Badge from "@/components/atoms/Badge";
import DuplicateBadge from "@/components/atoms/DuplicateBadge";
import { ProspectMobileItem } from "@/lib/mockData";
import { Phone, MessageSquare, AlertTriangle, Clock } from "lucide-react";

export interface ProspectCardMobileProps {
  prospect: ProspectMobileItem;
  onCall?: (phone: string) => void;
  onWhatsApp?: (phone: string) => void;
}

export const ProspectCardMobile: React.FC<ProspectCardMobileProps> = ({
  prospect,
  onCall,
  onWhatsApp,
}) => {
  const isDuplicate = !!prospect.isDuplicate;

  const handleWhatsApp = () => {
    if (onWhatsApp) {
      onWhatsApp(prospect.customerPhone);
    } else {
      const cleanPhone = prospect.customerPhone.replace(/[^0-9]/g, "");
      const formatted = cleanPhone.startsWith("0")
        ? `62${cleanPhone.slice(1)}`
        : cleanPhone;
      window.open(`https://wa.me/${formatted}`, "_blank");
    }
  };

  const handleCall = () => {
    if (onCall) {
      onCall(prospect.customerPhone);
    } else {
      window.open(`tel:${prospect.customerPhone}`, "_self");
    }
  };

  return (
    <div
      className={cn(
        "rounded-2xl border p-4 transition-all duration-200 shadow-xs relative flex flex-col gap-3",
        isDuplicate
          ? "bg-amber-50/60 border-amber-300 ring-1 ring-amber-300/40"
          : "bg-white border-slate-200/90 hover:border-slate-300"
      )}
    >
      {/* Top Header: Customer Name & Status Badge */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-bold text-slate-900 text-sm leading-snug">
              {prospect.customerName}
            </h4>
            {isDuplicate && (
              <DuplicateBadge
                frequency={prospect.duplicateFrequency || 2}
                size="sm"
              />
            )}
          </div>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            {prospect.customerPhone}
          </p>
        </div>

        <Badge variant={prospect.status} size="sm">
          {prospect.status === "NEW" && "BARU"}
          {prospect.status === "FOLLOW_UP" && "FOLLOW UP"}
          {prospect.status === "DEAL" && "DEAL"}
          {prospect.status === "LOST" && "LOST"}
        </Badge>
      </div>

      {/* Vehicle Model & Time */}
      <div className="text-xs space-y-1">
        <p className="font-semibold text-slate-800 line-clamp-1">
          🚗 {prospect.unitName}
        </p>

        <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
          <Clock className="w-3.5 h-3.5 shrink-0" />
          <span>{prospect.timestamp}</span>
        </div>
      </div>

      {/* Duplicate Callout Warning (If duplicate) */}
      {isDuplicate && prospect.duplicateNote && (
        <div className="rounded-xl bg-amber-100/90 border border-amber-300/90 p-2.5 text-xs text-amber-950 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div className="text-[11px] leading-tight font-medium">
            <span className="font-bold block text-amber-900">
              Duplikasi Terdeteksi!
            </span>
            {prospect.duplicateNote}
          </div>
        </div>
      )}

      {/* Notes (If present and not duplicate) */}
      {!isDuplicate && prospect.notes && (
        <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100 leading-relaxed italic">
          &quot;{prospect.notes}&quot;
        </p>
      )}

      {/* Bottom Actions: WhatsApp & Call Buttons */}
      <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
        <button
          type="button"
          onClick={handleWhatsApp}
          className="flex-1 h-9 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 active:bg-emerald-200 border border-emerald-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
        >
          <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
          <span>Chat WhatsApp</span>
        </button>

        <button
          type="button"
          onClick={handleCall}
          className="h-9 px-3 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 active:bg-slate-300 border border-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          aria-label={`Telepon ${prospect.customerName}`}
        >
          <Phone className="w-3.5 h-3.5 text-slate-600" />
          <span>Telepon</span>
        </button>
      </div>
    </div>
  );
};

export default ProspectCardMobile;
