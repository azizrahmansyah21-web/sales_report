"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import ToyotaLogo from "@/components/atoms/ToyotaLogo";
import Avatar from "@/components/atoms/Avatar";
import { PlusCircle, User, LogOut, ChevronRight, Wifi, WifiOff } from "lucide-react";

export interface SalesSidebarProps {
  salesName?: string;
  salesTitle?: string;
  isOnline?: boolean;
}

export const SalesSidebar: React.FC<SalesSidebarProps> = ({
  salesName = "Sales Executive",
  salesTitle = "Tim Sales Lapangan",
  isOnline = true,
}) => {
  const pathname = usePathname();

  const navItems = [
    {
      href: "/input",
      label: "Input Rencana SPK",
      icon: <PlusCircle className="w-5 h-5" />,
    },
    {
      href: "/profil",
      label: "Profil & Statistik",
      icon: <User className="w-5 h-5" />,
    },
  ];

  return (
    <aside
      className="w-64 bg-white text-slate-800 min-h-screen flex flex-col justify-between border-r border-slate-200 shrink-0 select-none z-30"
      aria-label="Sidebar Navigasi Sales"
    >
      <div>
        {/* Brand & Header Cabang */}
        <div className="p-4 border-b border-slate-100">
          <Link href="/input" className="flex items-center gap-2.5">
            <ToyotaLogo size="sm" />
            <div className="flex flex-col leading-none">
              <span className="font-black text-sm text-slate-900 tracking-tight">
                Agung Toyota <span className="text-red-600 font-bold">220</span>
              </span>
              <span className="text-[10px] text-slate-500 font-medium mt-1">
                Portal Sales UjungBatu
              </span>
            </div>
          </Link>
        </div>

        {/* User Card Summary */}
        <div className="p-4 mx-3 my-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
          <Avatar name={salesName} size="md" isOnline={isOnline} />
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-slate-900 truncate">
              {salesName}
            </span>
            <span className="text-[10px] text-slate-500 truncate mt-0.5">
              {salesTitle}
            </span>
            <div className="flex items-center gap-1.5 mt-1">
              {isOnline ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700">
                  <Wifi className="w-3 h-3 text-emerald-600" />
                  Online
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700">
                  <WifiOff className="w-3 h-3 text-amber-600" />
                  Offline
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1.5" aria-label="Menu Utama Sales">
          <p className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">
            Menu Operasional
          </p>
          {navItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-150",
                  isActive
                    ? "bg-red-50 text-red-600 border border-red-200/80 shadow-2xs"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <span className={cn(isActive ? "text-red-600" : "text-slate-400")}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {isActive && (
                  <ChevronRight className="w-3.5 h-3.5 text-red-600" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Logout */}
      <div className="p-4 border-t border-slate-100">
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium text-left cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Keluar Portal Sales</span>
        </button>
      </div>
    </aside>
  );
};

export default SalesSidebar;
