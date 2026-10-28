"use client";

import React, { useState } from "react";
import DatabaseSettingsClient from "./DatabaseSettingsClient";
import UserSettingsClient from "./UserSettingsClient";
import type { DatabaseHealthStats } from "@/lib/actions/databaseAdmin";
import {
  Database,
  Users2,
  MessageCircle,
  HardDriveDownload,
  ShieldCheck,
  Sliders,
  Sparkles,
} from "lucide-react";

export type SettingsTabId =
  | "DATABASE"
  | "USERS"
  | "WHATSAPP"
  | "BACKUP"
  | "ROLES"
  | "PROSPECTS";

interface SettingsTabsClientProps {
  initialDbStats: DatabaseHealthStats;
}

export default function SettingsTabsClient({
  initialDbStats,
}: SettingsTabsClientProps) {
  const [activeTab, setActiveTab] = useState<SettingsTabId>("DATABASE");

  const tabs: Array<{
    id: SettingsTabId;
    label: string;
    sublabel: string;
    icon: React.ReactNode;
    badge?: string;
  }> = [
    {
      id: "DATABASE",
      label: "1. Management Database",
      sublabel: "Pembersihan & Truncate",
      icon: <Database className="w-4 h-4" />,
      badge: initialDbStats.mockProspectsCount > 0 ? `${initialDbStats.mockProspectsCount} Mock` : undefined,
    },
    {
      id: "USERS",
      label: "2. Management USER",
      sublabel: "CRUD & Saklar Aktif",
      icon: <Users2 className="w-4 h-4" />,
    },
    {
      id: "WHATSAPP",
      label: "3. Management WA Blast",
      sublabel: "Daemon & Broadcast",
      icon: <MessageCircle className="w-4 h-4" />,
    },
    {
      id: "BACKUP",
      label: "4. Backup Database",
      sublabel: "Dump .sql.gz Instan",
      icon: <HardDriveDownload className="w-4 h-4" />,
    },
    {
      id: "ROLES",
      label: "5. Management Role",
      sublabel: "RBAC & Perizinan",
      icon: <ShieldCheck className="w-4 h-4" />,
    },
    {
      id: "PROSPECTS",
      label: "6. Management Prospect",
      sublabel: "Sensitivitas & Cutoff",
      icon: <Sliders className="w-4 h-4" />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Navigation tabs */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200/90 shadow-2xs overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1.5 min-w-max">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer select-none ${
                  isActive
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <span className={isActive ? "text-white" : "text-slate-500"}>
                  {tab.icon}
                </span>
                <div className="flex flex-col text-left leading-tight">
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] font-normal ${
                      isActive ? "text-blue-100" : "text-slate-400"
                    }`}
                  >
                    {tab.sublabel}
                  </span>
                </div>
                {tab.badge && (
                  <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab content */}
      {activeTab === "DATABASE" && (
        <DatabaseSettingsClient initialStats={initialDbStats} />
      )}

      {activeTab === "USERS" && (
        <UserSettingsClient />
      )}

      {activeTab === "WHATSAPP" && (
        <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-2xs text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <MessageCircle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            Modul 3: Management WA Blast ke Grup
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            Monitoring koneksi Baileys daemon, tombol test ping ke grup cabang, master broadcast toggle, dan log riwayat pengiriman notifikasi.
          </p>
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            Siap dibangun pada tahap berikutnya
          </span>
        </div>
      )}

      {activeTab === "BACKUP" && (
        <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-2xs text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <HardDriveDownload className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            Modul 4: Pengaturan Backup Database
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            Streaming download file dump terkompresi <code>.sql.gz</code> langsung ke laptop Superadmin dan riwayat snapshot database.
          </p>
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            Siap dibangun pada tahap berikutnya
          </span>
        </div>
      )}

      {activeTab === "ROLES" && (
        <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-2xs text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            Modul 5: Management Role & RBAC
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            Matriks perizinan visual (Permissions Matrix), promosi dan demosi role pengguna secara dinamis.
          </p>
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            Siap dibangun pada tahap berikutnya
          </span>
        </div>
      )}

      {activeTab === "PROSPECTS" && (
        <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-2xs text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center mx-auto">
            <Sliders className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            Modul 6: Management Prospect Engine
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            Pengaturan sensitivitas algoritma deteksi duplikat, tombol re-scan duplicate flags, dan pengaturan fleksibel jam cutoff.
          </p>
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            Siap dibangun pada tahap berikutnya
          </span>
        </div>
      )}
    </div>
  );
}

