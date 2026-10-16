"use client";

import React from "react";
import { usePathname } from "next/navigation";
import BottomNavItem from "@/components/molecules/BottomNavItem";
import { PlusCircle, User } from "lucide-react";

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
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-lg"
      aria-label="Navigasi Bawah Sales"
    >
      <div className="max-w-lg mx-auto flex items-center justify-around px-2 py-1">
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
      </div>
    </nav>
  );
};

export default BottomNavigationBar;
