"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import MobilePwaLayout from "@/components/templates/MobilePwaLayout";
import SearchInput from "@/components/molecules/SearchInput";
import PlanSpkCardMobile from "@/components/organisms/PlanSpkCardMobile";
import type { PlanSPK } from "@prisma/client";
import {
  Calendar,
  Filter,
  PlusCircle,
  Inbox,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";

export interface RiwayatClientProps {
  initialPlans: PlanSPK[];
  salesName: string;
  salesTitle: string;
}

type FilterStatus = "ALL" | "PENDING" | "BERHASIL" | "BELUM_BERHASIL" | "REPEAT_FAILED";

export default function RiwayatClient({
  initialPlans,
  salesName,
  salesTitle,
}: RiwayatClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("ALL");

  // Summary counts for filter tabs and top KPI pills
  const counts = useMemo(() => {
    let pending = 0;
    let berhasil = 0;
    let belumBerhasil = 0;
    let repeatFailed = 0;

    for (const plan of initialPlans) {
      if (plan.spkStatus === "PENDING") pending++;
      else if (plan.spkStatus === "BERHASIL") berhasil++;
      else if (plan.spkStatus === "BELUM_BERHASIL") belumBerhasil++;

      if (plan.isRepeatFailed || plan.isDuplicate) {
        repeatFailed++;
      }
    }

    return {
      all: initialPlans.length,
      pending,
      berhasil,
      belumBerhasil,
      repeatFailed,
    };
  }, [initialPlans]);

  // Filter plans by search keyword and selected tab
  const filteredPlans = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return initialPlans.filter((plan) => {
      const matchSearch =
        query === "" ||
        plan.customerName.toLowerCase().includes(query) ||
        plan.unitName.toLowerCase().includes(query);

      if (!matchSearch) return false;

      if (statusFilter === "ALL") return true;
      if (statusFilter === "REPEAT_FAILED") return plan.isRepeatFailed || plan.isDuplicate;
      return plan.spkStatus === statusFilter;
    });
  }, [initialPlans, searchQuery, statusFilter]);

  const filterTabs: Array<{ id: FilterStatus; label: string; count: number; icon: React.ReactNode }> = [
    {
      id: "ALL",
      label: "Semua",
      count: counts.all,
      icon: <Filter className="w-3.5 h-3.5" />,
    },
    {
      id: "PENDING",
      label: "Menunggu",
      count: counts.pending,
      icon: <Clock className="w-3.5 h-3.5 text-amber-600" />,
    },
    {
      id: "BERHASIL",
      label: "Berhasil",
      count: counts.berhasil,
      icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />,
    },
    {
      id: "BELUM_BERHASIL",
      label: "Belum",
      count: counts.belumBerhasil,
      icon: <XCircle className="w-3.5 h-3.5 text-rose-600" />,
    },
    {
      id: "REPEAT_FAILED",
      label: "Gagal Ulang",
      count: counts.repeatFailed,
      icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />,
    },
  ];

  return (
    <MobilePwaLayout salesName={salesName} isOnline={true}>
      <div className="space-y-4">
        {/* Header Title with Sales Info */}
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">
              Riwayat Rencana SPK
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {salesName} • {salesTitle}
            </p>
          </div>

          <Link
            href="/input"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors shrink-0"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Tambah</span>
          </Link>
        </div>

        {/* 2 Top Operational KPI Summary Cards */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
            <span className="text-[11px] font-semibold text-slate-500 uppercase block tracking-wider">
              Total Rencana
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-black text-slate-900 tracking-tight">
                {counts.all}
              </span>
              <span className="text-xs text-slate-500 font-medium">Unit Rencana</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {counts.pending} masih menunggu hasil evaluasi
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
            <span className="text-[11px] font-semibold text-emerald-700 uppercase block tracking-wider">
              Closing Berhasil
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-black text-emerald-700 tracking-tight">
                {counts.berhasil}
              </span>
              <span className="text-xs text-slate-500 font-medium">SPK Valid</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {counts.all > 0
                ? `${Math.round((counts.berhasil / counts.all) * 100)}% Rasio Closing`
                : "Belum ada rencana"}
            </p>
          </div>
        </div>

        {/* Search Input Bar */}
        <div className="space-y-2">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Cari nama pelanggan atau tipe mobil..."
          />

          {/* Filter Status Pills with Horizontal Scroll */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1">
            {filterTabs.map((tab) => {
              const isActive = statusFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStatusFilter(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shrink-0 border ${
                    isActive
                      ? "bg-slate-900 text-white border-slate-900 shadow-2xs"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                  <span
                    className={`ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Plan SPK Cards Feed */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          {filteredPlans.length > 0 ? (
            filteredPlans.map((plan) => (
              <PlanSpkCardMobile key={plan.id} plan={plan} />
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <Inbox className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">
                  Tidak Ada Rencana SPK
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  {searchQuery || statusFilter !== "ALL"
                    ? "Tidak ditemukan data yang sesuai dengan pencarian atau filter yang dipilih."
                    : "Belum ada rencana SPK yang dicatat. Buat rencana penutupan SPK H-1 Anda sekarang."}
                </p>
              </div>

              {searchQuery || statusFilter !== "ALL" ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("ALL");
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Filter</span>
                </button>
              ) : (
                <Link
                  href="/input"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Buat Rencana SPK</span>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </MobilePwaLayout>
  );
}
