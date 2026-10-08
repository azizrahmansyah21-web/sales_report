"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ToyotaLogo from "@/components/atoms/ToyotaLogo";
import Badge from "@/components/atoms/Badge";
import Avatar from "@/components/atoms/Avatar";
import {
  Bell,
  Home,
  PlusCircle,
  History,
  User,
} from "lucide-react";

export interface MobileHeaderProps {
  salesName?: string;
  isOnline?: boolean;
  unreadCount?: number;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  salesName = "Bagus Triyanto",
  isOnline = true,
  unreadCount = 1,
}) => {
  const pathname = usePathname();

  const navItems = [
    {
      href: "/beranda",
      label: "Beranda",
      icon: <Home className="w-4 h-4" />,
    },
    {
      href: "/input",
      label: "Input SPK H-1",
      icon: <PlusCircle className="w-4 h-4" />,
    },
    {
      href: "/riwayat",
      label: "Riwayat SPK",
      icon: <History className="w-4 h-4" />,
    },
    {
      href: "/profil",
      label: "Profil Saya",
      icon: <User className="w-4 h-4" />,
    },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between">
        {/* Brand & Branch Info */}
        <Link href="/beranda" className="flex items-center gap-2.5 select-none shrink-0">
          <ToyotaLogo size="sm" />
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 leading-none">
              <span className="font-black text-sm text-slate-900 tracking-tight">
                Agung Toyota
              </span>
              <span className="hidden sm:inline-block text-[11px] font-bold text-slate-400">
                • Cabang 247
              </span>
              <Badge
                variant={isOnline ? "ONLINE" : "OFFLINE"}
                size="sm"
                showDot
                className="hidden md:inline-flex"
              >
                {isOnline ? "ONLINE" : "OFFLINE"}
              </Badge>
            </div>
            <p className="text-[10px] text-slate-500 font-medium mt-0.5">
              Portal Sales & Counter — UjungBatu
            </p>
          </div>
        </Link>

        {/* Center: Desktop Navigation Tabs (Hidden on Mobile) */}
        <nav
          className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-2xl border border-slate-200/60"
          aria-label="Menu Utama Desktop"
        >
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href === "/beranda" && pathname === "/");

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  isActive
                    ? "bg-white text-blue-700 shadow-2xs border border-slate-200/60"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Controls: Notifications & Sales Profile */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Bell Notification */}
          <button
            type="button"
            className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Notifikasi"
          >
            <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-600 ring-2 ring-white" />
            )}
          </button>

          {/* Sales Avatar & Name Pill */}
          <Link
            href="/profil"
            aria-label={`Profil ${salesName}`}
            className="flex items-center gap-2 p-1 pl-1.5 sm:pr-2.5 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <Avatar
              name={salesName}
              size="sm"
              isOnline={isOnline}
              className="ring-2 ring-blue-600/20"
            />
            <div className="hidden sm:flex flex-col text-left leading-none">
              <span className="text-xs font-bold text-slate-900 truncate max-w-[120px]">
                {salesName}
              </span>
              <span className="text-[10px] text-slate-500 font-mono mt-0.5">
                Sales Advisor
              </span>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default MobileHeader;
