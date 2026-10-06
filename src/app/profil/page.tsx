"use client";

import React, { useState } from "react";
import Link from "next/link";
import MobilePwaLayout from "@/components/templates/MobilePwaLayout";
import Avatar from "@/components/atoms/Avatar";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import {
  Award,
  MapPin,
  Target,
  RefreshCw,
  Shield,
  HelpCircle,
  LogOut,
  ChevronRight,
  MessageCircle,
  Wifi,
  Sparkles,
} from "lucide-react";

export default function ProfilPage() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState("Hari ini, 13:45 WIB");

  const handleSyncOffline = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setLastSyncTime("Baru saja (100% tersinkron)");
    }, 1200);
  };

  const menuSections = [
    {
      title: "Konfigurasi Lapangan & Komunikasi",
      items: [
        {
          label: "Wilayah Operasional & Ring 1",
          sublabel: "Kec. UjungBatu & Tandun (Radius 25 km)",
          icon: <MapPin className="w-4 h-4 text-blue-600" />,
        },
        {
          label: "WhatsApp Group Cabang",
          sublabel: "Terhubung otomatis: [ATUB] Sales Lapangan",
          icon: <MessageCircle className="w-4 h-4 text-emerald-600" />,
          statusBadge: "Terhubung",
          badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
        },
        {
          label: "Sinkronisasi Offline PWA",
          sublabel: `Status sinkron: ${lastSyncTime}`,
          icon: <Wifi className="w-4 h-4 text-purple-600" />,
          actionButton: (
            <button
              type="button"
              onClick={handleSyncOffline}
              disabled={isSyncing}
              className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-xs font-semibold flex items-center gap-1 transition-colors shrink-0 disabled:opacity-50"
            >
              <RefreshCw
                className={`w-3 h-3 ${isSyncing ? "animate-spin" : ""}`}
              />
              <span>{isSyncing ? "Sinkron..." : "Sinkron"}</span>
            </button>
          ),
        },
      ],
    },
    {
      title: "Akun & Keamanan",
      items: [
        {
          label: "Target & Skema Insentif Q4",
          sublabel: "Evaluasi SPK & komisi split lead duplikasi",
          icon: <Target className="w-4 h-4 text-amber-600" />,
        },
        {
          label: "Keamanan & Kata Sandi",
          sublabel: "Autentikasi dua langkah & biometrik aktif",
          icon: <Shield className="w-4 h-4 text-slate-600" />,
        },
        {
          label: "Pusat Bantuan & Supervisor",
          sublabel: "Kontak Branch Manager Budi Santoso",
          icon: <HelpCircle className="w-4 h-4 text-blue-600" />,
        },
      ],
    },
  ];

  return (
    <MobilePwaLayout salesName="Bagus Triyanto" isOnline={true}>
      <div className="space-y-5">
        {/* Profile Header Card */}
        <div className="rounded-3xl bg-white border border-slate-200/90 p-5 shadow-xs text-center space-y-3 relative overflow-hidden">
          {/* Top Rank Ribbon */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-300 text-xs font-bold tracking-tight">
            <Award className="w-3.5 h-3.5 text-amber-600" />
            <span>Top Sales Penetrasi Rokan Hulu • RANK #2</span>
          </div>

          {/* Avatar with Ring */}
          <div className="flex justify-center pt-1">
            <Avatar
              name="Bagus Triyanto"
              size="xl"
              isOnline={true}
              className="ring-4 ring-blue-50"
            />
          </div>

          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Bagus Triyanto
            </h2>
            <p className="text-xs font-semibold text-slate-600 mt-0.5">
              NPK-ATUB-202108 • Senior Sales Executive
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              PT Agung Automall — Cabang UjungBatu (247)
            </p>
          </div>

          <div className="pt-2 flex justify-center gap-2">
            <Badge variant="ONLINE" size="sm" showDot>
              Shift Lapangan Aktif
            </Badge>
            <Badge variant="BRANCH" size="sm">
              Ring 1 UjungBatu
            </Badge>
          </div>
        </div>

        {/* 4 Performance Q4 Grid Cards */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5 px-1">
            Performa Kuartal IV (Q4 2024)
          </h3>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-400 block uppercase">
                Prospek Masuk
              </span>
              <p className="text-xl font-extrabold text-slate-900 mt-1">
                28 <span className="text-xs text-slate-400 font-medium">/ 35</span>
              </p>
              <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full w-4/5" />
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-400 block uppercase">
                Realisasi SPK
              </span>
              <p className="text-xl font-extrabold text-emerald-700 mt-1">
                6 Unit
              </p>
              <p className="text-[10px] text-slate-400 mt-1">
                Target 8 Unit • 75%
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-400 block uppercase">
                Konversi Lead
              </span>
              <p className="text-xl font-extrabold text-slate-900 mt-1">21.4%</p>
              <p className="text-[10px] text-emerald-600 font-semibold mt-1">
                +3.2% vs rata-rata
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col justify-between">
              <span className="text-[11px] font-semibold text-slate-400 block uppercase">
                Progress Target
              </span>
              <div className="flex items-center justify-between mt-1">
                <p className="text-xl font-extrabold text-blue-600">80%</p>
                <div className="w-7 h-7 rounded-full border-3 border-blue-600 border-t-transparent animate-spin-slow flex items-center justify-center text-[10px] font-bold text-blue-600">
                  ★
                </div>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Menuju Insentif Penuh</p>
            </div>
          </div>
        </div>

        {/* Menu Sections */}
        {menuSections.map((sec) => (
          <div key={sec.title} className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">
              {sec.title}
            </h3>

            <div className="rounded-2xl bg-white border border-slate-200/90 divide-y divide-slate-100 shadow-2xs overflow-hidden">
              {sec.items.map((item) => (
                <div
                  key={item.label}
                  className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 leading-tight">
                        {item.label}
                      </h4>
                      <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                        {item.sublabel}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {item.statusBadge && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${item.badgeColor}`}
                      >
                        {item.statusBadge}
                      </span>
                    )}

                    {item.actionButton && item.actionButton}

                    {!item.actionButton && !item.statusBadge && (
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Logout Button */}
        <div className="pt-2">
          <Link
            href="/login"
            className="w-full h-12 rounded-2xl bg-red-50 hover:bg-red-100 active:bg-red-200 text-red-700 border border-red-200 text-xs font-bold flex items-center justify-center gap-2 transition-colors select-none shadow-2xs"
          >
            <LogOut className="w-4 h-4 text-red-600" />
            <span>Keluar dari Akun Sales</span>
          </Link>
        </div>
      </div>
    </MobilePwaLayout>
  );
}
