"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import ToyotaLogo from "@/components/atoms/ToyotaLogo";
import {
  LayoutDashboard,
  FileSpreadsheet,
  Users2,
  Settings,
  LogOut,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";

export interface AdminSidebarProps {
  duplicateCount?: number;
  salesCount?: number;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  duplicateCount = 0,
  salesCount = 8,
}) => {
  const pathname = usePathname();

  const navItems = [
    {
      href: "/admin/dashboard",
      label: "Dashboard Analytics",
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      href: "/admin/prospects",
      label: "Data Rencana SPK",
      icon: <FileSpreadsheet className="w-5 h-5" />,
      badge: duplicateCount > 0 ? `${duplicateCount} Duplikat` : undefined,
      badgeColor: "bg-amber-100 text-amber-900 border-amber-300 font-semibold",
    },
    {
      href: "/admin/team",
      label: "Tim Sales",
      icon: <Users2 className="w-5 h-5" />,
      count: `${salesCount} Sales`,
    },
    {
      href: "/admin/settings",
      label: "Pengaturan Sistem",
      icon: <Settings className="w-5 h-5" />,
    },
  ];

  return (
    <aside
      className="w-64 bg-white text-slate-800 min-h-screen flex flex-col justify-between border-r border-slate-200 shrink-0 select-none z-30"
      aria-label="Sidebar Navigasi Admin"
    >
      <div>
        {/* Branch & Logo Header */}
        <div className="p-4 border-b border-slate-100">
          <Link href="/admin/dashboard" className="flex items-center gap-2.5">
            <ToyotaLogo size="sm" />
            <div className="flex flex-col leading-none">
              <span className="font-black text-sm text-slate-900 tracking-tight">
                Agung Toyota
              </span>
              <span className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase mt-0.5">
                Plan SPK H-1
              </span>
            </div>
          </Link>

          {/* <div className="mt-3.5 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                UJUNGBATU • ROKAN HULU
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <p className="text-xs font-semibold text-slate-800">
                  Cabang Resmi 247
                </p>
              </div>
            </div>
          </div> */}
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1" aria-label="Menu Utama">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 group",
                  isActive
                    ? "bg-blue-50 text-blue-700 shadow-2xs font-bold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={cn(
                      "transition-colors",
                      isActive
                        ? "text-blue-600"
                        : "text-slate-400 group-hover:text-slate-600"
                    )}
                  >
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={cn(
                      "text-[10px] px-2 py-0.5 rounded-md border shadow-2xs",
                      item.badgeColor
                    )}
                  >
                    {item.badge}
                  </span>
                )}

                {item.count && !isActive && (
                  <span className="text-[10px] text-slate-400 font-medium">
                    {item.count}
                  </span>
                )}

                {isActive && !item.badge && (
                  <ChevronRight className="w-3.5 h-3.5 text-blue-600" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Info & Logout */}
      <div className="p-4 border-t border-slate-100 space-y-2.5">
        {/* Sync Status */}
        <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-700 font-semibold text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>CRM SYNCED</span>
          </div>
          <span className="text-[10px] font-bold text-slate-500">Live</span>
        </div>

        {/* Quick Logout */}
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium text-left"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Keluar Portal Admin</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
