"use client";

import React from "react";
import Link from "next/link";
import MobilePwaLayout from "@/components/templates/MobilePwaLayout";
import MetricCard from "@/components/molecules/MetricCard";
import ProspectCardMobile from "@/components/organisms/ProspectCardMobile";
import { MOCK_MOBILE_PROSPECTS } from "@/lib/mockData";
import {
  UserPlus,
  ArrowRight,
  Sparkles,
  Calendar,
  CheckCircle,
  TrendingUp,
  Tag,
} from "lucide-react";

export default function BerandaPage() {
  return (
    <MobilePwaLayout salesName="Bagus Triyanto" isOnline={true}>
      <div className="space-y-5">
        {/* Sales Greeting & Shift Status Card */}
        <div className="rounded-2xl bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white p-5 shadow-md relative overflow-hidden">
          <div className="relative z-10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white/15 text-blue-100 backdrop-blur-xs border border-white/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Shift Lapangan Aktif • Ring 1
              </span>

              <div className="flex items-center gap-1 text-[11px] text-blue-200">
                <Calendar className="w-3.5 h-3.5" />
                <span>24 Okt 2024</span>
              </div>
            </div>

            <div>
              <p className="text-xs text-blue-200 font-medium">Selamat Pagi,</p>
              <h2 className="text-xl font-black tracking-tight text-white">
                Bagus Triyanto
              </h2>
              <p className="text-xs text-blue-200/90 font-mono mt-0.5">
                NPK-ATUB-202108 • Senior Sales Advisor
              </p>
            </div>
          </div>

          {/* Background Decorative Rings */}
          <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full bg-white/5 pointer-events-none" />
          <div className="absolute top-0 right-10 w-24 h-24 rounded-full bg-blue-500/20 blur-xl pointer-events-none" />
        </div>

        {/* 3 KPI Summary Cards */}
        <div className="grid grid-cols-3 gap-2.5">
          <MetricCard
            title="Hari Ini"
            value="4"
            trend={{ value: "+2", isPositive: true }}
            className="p-3!"
          />
          <MetricCard
            title="Target Bln"
            value="28"
            progress={{ current: 28, target: 35, percentage: 80 }}
            className="p-3!"
          />
          <MetricCard
            title="Deal SPK"
            value="6"
            subtitle="Unit Valid"
            className="p-3!"
          />
        </div>

        {/* Primary CTA: Input Prospek Baru */}
        <div>
          <Link
            href="/input"
            className="group block w-full rounded-2xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white p-4 shadow-lg shadow-blue-600/25 border border-blue-500 transition-all duration-200 select-none active:scale-[0.98]"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                  <UserPlus className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base leading-tight">
                    + Input Prospek Baru
                  </h3>
                  <p className="text-[11px] text-blue-100 mt-0.5">
                    Notifikasi seketika ke WhatsApp Group Sales
                  </p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-white/80 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>

        {/* Recent Prospects Feed */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
              <span>Prospek Terkini (Hari Ini)</span>
              <span className="w-2 h-2 rounded-full bg-blue-600" />
            </h3>

            <Link
              href="/riwayat"
              className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
            >
              Lihat Semua ({MOCK_MOBILE_PROSPECTS.length}) &rarr;
            </Link>
          </div>

          <div className="space-y-3">
            {MOCK_MOBILE_PROSPECTS.map((item) => (
              <ProspectCardMobile key={item.id} prospect={item} />
            ))}
          </div>
        </div>

        {/* Promotional Flash Banner */}
        <div className="rounded-2xl bg-gradient-to-r from-red-600 to-rose-700 text-white p-4 shadow-sm border border-red-500 space-y-2">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/20 text-[10px] font-bold tracking-wider uppercase">
              <Tag className="w-3 h-3" />
              Promo Flash Q4
            </span>
            <span className="text-[10px] text-red-100 font-medium">
              S.d 31 Des 2024
            </span>
          </div>

          <div>
            <h4 className="font-extrabold text-sm leading-tight">
              Program DP Rendah Hilux & Calya
            </h4>
            <p className="text-xs text-red-100 mt-0.5 leading-snug">
              Paket khusus perkebunan sawit Rokan Hulu. Bunga 0% tenor 1 tahun
              via Toyota Astra Finance (TAF).
            </p>
          </div>
        </div>
      </div>
    </MobilePwaLayout>
  );
}
