"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import BottomNavItem from "@/components/molecules/BottomNavItem";
import { PlusCircle, User, LogOut } from "lucide-react";

export const BottomNavigationBar: React.FC = () => {
  const pathname = usePathname();

  const navItems = [
    {
      href: "/input",
      label: "Input SPK",
      icon: <PlusCircle className="w-5 h-5" />,
    },
    {
      href: "/profil",
      label: "Profil",
      icon: <User className="w-5 h-5" />,
    },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 shadow-md pb-[env(safe-area-inset-bottom,0px)] lg:hidden select-none"
      aria-label="Navigasi Bawah Sales"
    >
      <div className="max-w-md mx-auto flex items-center justify-around px-2 py-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <BottomNavItem
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              isActive={isActive}
            />
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

export default BottomNavigationBar;
