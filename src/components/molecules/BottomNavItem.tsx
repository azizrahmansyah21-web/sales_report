"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface BottomNavItemProps {
  href: string;
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  badgeCount?: number;
}

export const BottomNavItem: React.FC<BottomNavItemProps> = ({
  href,
  label,
  icon,
  isActive,
  badgeCount,
}) => {
  return (
    <Link
      href={href}
      className={cn(
        "relative flex flex-col items-center justify-center flex-1 h-14 py-1 select-none transition-colors duration-150 active:scale-95",
        isActive ? "text-blue-600" : "text-slate-400 hover:text-slate-600"
      )}
    >
      <div className="relative">
        <span
          className={cn(
            "flex items-center justify-center w-7 h-7 rounded-xl transition-all duration-150",
            isActive && "text-blue-600"
          )}
        >
          {icon}
        </span>

        {badgeCount !== undefined && badgeCount > 0 && (
          <span className="absolute -top-1 -right-1.5 min-w-4 h-4 px-1 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center shadow-2xs">
            {badgeCount}
          </span>
        )}
      </div>

      <span
        className={cn(
          "text-[11px] tracking-tight mt-0.5 font-medium transition-all",
          isActive ? "font-bold text-blue-600" : "text-slate-500 font-normal"
        )}
      >
        {label}
      </span>

      {isActive && (
        <span className="absolute bottom-1 w-1 h-1 rounded-full bg-blue-600" />
      )}
    </Link>
  );
};

export default BottomNavItem;
