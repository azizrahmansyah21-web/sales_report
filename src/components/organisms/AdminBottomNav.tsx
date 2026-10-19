"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { FileSpreadsheet, Users2, Settings, LogOut } from "lucide-react";

export interface AdminBottomNavProps {
  duplicateCount?: number;
}

export const AdminBottomNav: React.FC<AdminBottomNavProps> = ({
  duplicateCount = 0,
}) => {
  const pathname = usePathname();

  const navItems = [
    {
      href: "/admin/prospects",
      label: "Data SPK",
      icon: <FileSpreadsheet className="w-5 h-5" />,
      badge: duplicateCount > 0 ? duplicateCount : undefined,
    },
    {
      href: "/admin/team",
      label: "Tim Sales",
      icon: <Users2 className="w-5 h-5" />,
    },
    {
      href: "/admin/settings",
      label: "Pengaturan",
      icon: <Settings className="w-5 h-5" />,
    },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 shadow-md pb-[env(safe-area-inset-bottom,0px)] lg:hidden select-none"
      aria-label="Navigasi Bawah Admin & SPV"
    >
      <div className="max-w-md mx-auto flex items-center justify-around px-2 py-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center justify-center flex-1 h-14 py-1 transition-colors duration-150 active:scale-95",
                isActive
                  ? "text-red-600 font-bold"
                  : "text-slate-500 hover:text-slate-800 font-medium"
              )}
            >
              <div className="relative">
                <span
                  className={cn(
                    "flex items-center justify-center w-7 h-7 rounded-xl transition-all duration-150",
                    isActive && "text-red-600"
                  )}
                >
                  {item.icon}
                </span>

                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1 -right-2 min-w-4 h-4 px-1 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center shadow-2xs border border-white">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[11px] leading-tight tracking-tight mt-0.5">
                {item.label}
              </span>
            </Link>
          );
        })}

        {/* Tombol Keluar Cepat */}
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="relative flex flex-col items-center justify-center flex-1 h-14 py-1 text-slate-500 hover:text-red-600 font-medium transition-colors duration-150 active:scale-95 cursor-pointer"
          aria-label="Keluar dari sistem"
        >
          <span className="flex items-center justify-center w-7 h-7 rounded-xl">
            <LogOut className="w-5 h-5" />
          </span>
          <span className="text-[11px] leading-tight tracking-tight mt-0.5">
            Keluar
          </span>
        </button>
      </div>
    </nav>
  );
};

export default AdminBottomNav;
