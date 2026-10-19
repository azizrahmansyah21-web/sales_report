"use client";

import React from "react";
import MobileHeader from "@/components/organisms/MobileHeader";
import BottomNavigationBar from "@/components/organisms/BottomNavigationBar";
import SalesSidebar from "@/components/organisms/SalesSidebar";
import Avatar from "@/components/atoms/Avatar";
import Badge from "@/components/atoms/Badge";

export interface MobilePwaLayoutProps {
  children: React.ReactNode;
  salesName?: string;
  isOnline?: boolean;
  showHeader?: boolean;
  showBottomNav?: boolean;
}

export const MobilePwaLayout: React.FC<MobilePwaLayoutProps> = ({
  children,
  salesName = "Sales",
  isOnline = true,
  showHeader = true,
  showBottomNav = true,
}) => {
  return (
    <div className="min-h-screen bg-slate-100 flex antialiased font-sans text-slate-900">
      {/* Desktop & Wide Viewport Pinned Sidebar (>= 1024px) */}
      <div className="hidden lg:block shrink-0">
        <SalesSidebar salesName={salesName} isOnline={isOnline} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Top Header (< 1024px) */}
        {showHeader && (
          <div className="block lg:hidden">
            <MobileHeader salesName={salesName} isOnline={isOnline} />
          </div>
        )}

        {/* Desktop Top Header (>= 1024px) */}
        <header className="hidden lg:flex h-16 bg-white border-b border-slate-200/90 px-8 items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 select-none">
            <span className="text-slate-400">Portal Sales Lapangan</span>
            <span className="text-slate-300">&gt;</span>
            <span className="font-bold text-slate-800">Cabang UjungBatu (220)</span>
          </div>

          <div className="flex items-center gap-3">
            <Badge
              variant={isOnline ? "ONLINE" : "OFFLINE"}
              size="sm"
              showDot
            >
              {isOnline ? "ONLINE" : "OFFLINE"}
            </Badge>
            <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
              <Avatar name={salesName} size="sm" isOnline={isOnline} />
              <div className="flex flex-col text-left leading-none">
                <span className="text-xs font-bold text-slate-900">{salesName}</span>
                <span className="text-[10px] text-slate-500 mt-0.5">Sales Lapangan</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Body Content */}
        <main className="flex-1 bg-slate-50/80 p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8 overflow-y-auto">
          <div className="w-full max-w-lg lg:max-w-3xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile, Foldables, & Narrow Tablet Bottom Nav (< 1024px) */}
      {showBottomNav && <BottomNavigationBar />}
    </div>
  );
};

export default MobilePwaLayout;
