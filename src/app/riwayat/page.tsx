"use client";

import React, { useState, useMemo } from "react";
import MobilePwaLayout from "@/components/templates/MobilePwaLayout";
import SearchInput from "@/components/molecules/SearchInput";
import ProspectCardMobile from "@/components/organisms/ProspectCardMobile";
import { MOCK_MOBILE_PROSPECTS, ProspectMobileItem } from "@/lib/mockData";
import { Calendar, Filter, Award, TrendingUp } from "lucide-react";

export default function RiwayatPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Extended mock history list for Bagus Triyanto
  const allProspects: ProspectMobileItem[] = useMemo(() => {
    return [
      ...MOCK_MOBILE_PROSPECTS,
      {
        id: "p5",
        customerName: "H. Syamsul Bahri",
        customerPhone: "0811-7654-3210",
        unitName: "Hilux Double Cab 2.4 V 4x4 AT",
        status: "DEAL",
        timestamp: "23 Okt 2024 • 14:15 WIB",
        notes: "SPK Closing! Pembelian armada kebun 2 unit tunai via Agung Toyota.",
      },
      {
        id: "p6",
        customerName: "dr. Maya Anggraini",
        customerPhone: "0813-7123-9087",
        unitName: "Yaris Cross 1.5 S HEV GR",
        status: "FOLLOW_UP",
        timestamp: "22 Okt 2024 • 10:40 WIB",
        notes: "Test drive di RS Surya Insani UjungBatu, pertimbangan warna Scarlet.",
      },
      {
        id: "p7",
        customerName: "Suryanto / CV Rokan Mandiri",
        customerPhone: "0853-6234-8871",
        unitName: "Hilux Rangga Cab & Chassis 2.4 DSL",
        status: "FOLLOW_UP",
        timestamp: "21 Okt 2024 • 16:20 WIB",
        isDuplicate: true,
        duplicateFrequency: 2,
        duplicateNote:
          "Duplikasi: CV Rokan Mandiri pernah kontak sales showroom 2 minggu lalu.",
      },
      {
        id: "p8",
        customerName: "Dedi Supardi",
        customerPhone: "0823-8899-0011",
        unitName: "All New Veloz 1.5 Q CVT",
        status: "LOST",
        timestamp: "19 Okt 2024 • 11:00 WIB",
        notes: "Batal, memilih unit seken di Pekanbaru.",
      },
    ];
  }, []);

  // Filter prospects based on search & status filter
  const filteredProspects = useMemo(() => {
    return allProspects.filter((item) => {
      const matchSearch =
        item.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.customerPhone.includes(searchQuery) ||
        item.unitName.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchSearch) return false;

      if (statusFilter === "ALL") return true;
      if (statusFilter === "DUPLICATE") return !!item.isDuplicate;
      return item.status === statusFilter;
    });
  }, [allProspects, searchQuery, statusFilter]);

  const duplicateCount = allProspects.filter((p) => p.isDuplicate).length;

  return (
    <MobilePwaLayout salesName="Bagus Triyanto" isOnline={true}>
      <div className="space-y-4">
        {/* Header Title */}
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">
              Riwayat Prospek Sales
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Bagus Triyanto (NPK-ATUB-202108)
            </p>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>Okt 2024</span>
          </div>
        </div>

        {/* 2 KPI Performance Summary Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
              <span>Closing SPK</span>
              <Award className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-extrabold text-slate-900">8 Unit</p>
            <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">
              Target 10 Unit (80%)
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
              <span>Rasio Konversi</span>
              <TrendingUp className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-2xl font-extrabold text-slate-900">19.0%</p>
            <p className="text-[11px] text-blue-600 font-semibold mt-0.5">
              Top 2 Cabang UjungBatu
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Cari nama pelanggan, unit, nomor HP..."
        />

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          <button
            type="button"
            onClick={() => setStatusFilter("ALL")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all ${
              statusFilter === "ALL"
                ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            Semua ({allProspects.length})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("NEW")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all ${
              statusFilter === "NEW"
                ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            Baru ({allProspects.filter((p) => p.status === "NEW").length})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("FOLLOW_UP")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all ${
              statusFilter === "FOLLOW_UP"
                ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            Follow Up ({allProspects.filter((p) => p.status === "FOLLOW_UP").length})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("DEAL")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all ${
              statusFilter === "DEAL"
                ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            Deal ({allProspects.filter((p) => p.status === "DEAL").length})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("DUPLICATE")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all ${
              statusFilter === "DUPLICATE"
                ? "bg-amber-500 text-amber-950 border-amber-500 shadow-xs"
                : "bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100"
            }`}
          >
            ⚠️ Duplikat ({duplicateCount})
          </button>
        </div>

        {/* Prospect Items List */}
        <div className="space-y-3 pt-1">
          {filteredProspects.length > 0 ? (
            filteredProspects.map((item) => (
              <ProspectCardMobile key={item.id} prospect={item} />
            ))
          ) : (
            <div className="text-center py-10 bg-white rounded-2xl border border-slate-200/80 p-6 space-y-2">
              <Filter className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700">
                Tidak ada data prospek yang cocok
              </p>
              <p className="text-xs text-slate-400">
                Coba sesuaikan kata kunci pencarian atau filter status.
              </p>
            </div>
          )}
        </div>
      </div>
    </MobilePwaLayout>
  );
}
