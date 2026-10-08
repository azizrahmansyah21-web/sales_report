"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import ToyotaLogo from "@/components/atoms/ToyotaLogo";
import Avatar from "@/components/atoms/Avatar";
import { Bell, Calendar, ChevronDown, Menu, Search } from "lucide-react";

export interface AdminHeaderProps {
  title?: string;
  subtitle?: string;
  onToggleSidebar?: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  title = "Dashboard Analytics",
  subtitle = "Portal Operasional Cabang UjungBatu",
  onToggleSidebar,
}) => {
  const { data: session } = useSession();
  const [searchVal, setSearchVal] = useState("");

  const userName = session?.user?.name || "Budi Santoso";
  const userTitle =
    session?.user?.title ||
    (session?.user?.role === "SPV" ? "Supervisor SPV" : "Branch Admin");

  return (
    <header className="h-16 bg-white border-b border-slate-200/90 px-4 md:px-6 flex items-center justify-between sticky top-0 z-20 gap-4">
      {/* Left: Mobile hamburger & Breadcrumb with ToyotaLogo */}
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
            aria-label="Buka menu navigasi"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* <div className="flex items-center gap-2">
          <ToyotaLogo size="sm" />
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
            <span className="text-slate-400">Portal Operasional</span>
            <span className="text-slate-300">&gt;</span>
            <span className="font-bold text-slate-800">Cabang UjungBatu</span>
          </div>
        </div> */}
      </div>

      {/* Middle: Quick Search Input */}
      <div className="hidden md:flex flex-1 max-w-xs relative items-center">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
        <input
          type="text"
          value={searchVal}
          onChange={(e) => setSearchVal(e.target.value)}
          placeholder="Cari prospek, No. HP, sales..."
          className="w-full h-9 pl-9 pr-3 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:border-blue-600 outline-none transition-all placeholder:text-slate-400 font-medium"
        />
      </div>

      {/* Right Controls: Period Filter, Bell, Admin Profile */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Period Selector Pill */}
        {/* <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>Periode: <strong>Bulan Berjalan (Q2 2024)</strong></span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </div> */}

        {/* Notifications Bell */}
        <button
          type="button"
          className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          aria-label="Notifikasi Admin"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-600 ring-2 ring-white" />
        </button>

        {/* Admin / SPV Profile */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
          <Avatar name={userName} size="sm" isOnline={true} />
          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold text-slate-900 leading-none">
              {userName}
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5 leading-none">
              {userTitle} • UjungBatu
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
