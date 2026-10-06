"use client";

import React from "react";
import Link from "next/link";
import ToyotaLogo from "@/components/atoms/ToyotaLogo";
import Badge from "@/components/atoms/Badge";
import Avatar from "@/components/atoms/Avatar";
import { Bell } from "lucide-react";

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
  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-2.5 flex items-center justify-between shadow-2xs">
      {/* Brand & Page Info */}
      <Link href="/beranda" className="flex items-center gap-2.5 select-none">
        <ToyotaLogo size="sm" />
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 leading-none">
            <span className="font-black text-sm text-slate-900">Beranda</span>
            <Badge variant={isOnline ? "ONLINE" : "OFFLINE"} size="sm" showDot>
              {isOnline ? "ONLINE" : "OFFLINE"}
            </Badge>
          </div>
          <p className="text-[10px] text-slate-500 font-medium mt-0.5">
            Agung Toyota - UjungBatu
          </p>
        </div>
      </Link>

      {/* Right Controls: Bell, Avatar */}
      <div className="flex items-center gap-2.5">
        {/* Bell Notification */}
        <button
          type="button"
          className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          aria-label="Notifikasi"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-600 ring-2 ring-white" />
          )}
        </button>

        {/* Sales Avatar */}
        <Link href="/profil" aria-label={`Profil ${salesName}`}>
          <Avatar
            name={salesName}
            size="sm"
            isOnline={isOnline}
            className="ring-2 ring-blue-600/20"
          />
        </Link>
      </div>
    </header>
  );
};

export default MobileHeader;
