"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ToyotaLogo from "@/components/atoms/ToyotaLogo";
import Badge from "@/components/atoms/Badge";
import Avatar from "@/components/atoms/Avatar";
import { PlusCircle, User } from "lucide-react";

export interface MobileHeaderProps {
  salesName?: string;
  isOnline?: boolean;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  salesName = "Sales",
  isOnline = true,
}) => {
  const pathname = usePathname();

  const navItems = [
    {
      href: "/input",
      label: "Input SPK H-1",
      icon: <PlusCircle className="w-4 h-4" />,
    },
    {
      href: "/profil",
      label: "Profil Saya",
      icon: <User className="w-4 h-4" />,
    },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
      <div className="max-w-lg mx-auto px-4 py-2.5 flex items-center justify-between">
        {/* Brand identity */}
        <Link href="/input" className="flex items-center gap-2.5 select-none shrink-0">
          <ToyotaLogo size="sm" />
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 leading-none">
              <span className="font-black text-sm text-slate-900 tracking-tight">
                Agung Toyota
              </span>
              <span className="text-[11px] font-bold text-slate-400">
                • Cabang 220
              </span>
              <Badge
                variant={isOnline ? "ONLINE" : "OFFLINE"}
                size="sm"
                showDot
                className="hidden sm:inline-flex"
              >
                {isOnline ? "ONLINE" : "OFFLINE"}
              </Badge>
            </div>
            <p className="text-[10px] text-slate-500 font-medium mt-0.5">
              Portal Sales: UjungBatu
            </p>
          </div>
        </Link>

        {/* Desktop navigation tabs: only visible above sm */}
        <nav
          className="hidden sm:flex items-center gap-1 bg-slate-100/80 p-1 rounded-2xl border border-slate-200/60"
          aria-label="Menu Utama Desktop"
        >
          {navItems.map((item) => {
            const isActive = pathname === item.href;

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

        {/* Sales avatar shortcut to profile */}
        <Link
          href="/profil"
          aria-label={`Profil ${salesName}`}
          className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 transition-colors"
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
              Tim Sales
            </span>
          </div>
        </Link>
      </div>
    </header>
  );
};

export default MobileHeader;
