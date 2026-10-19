"use client";

import React from "react";
import AdminSidebar from "@/components/organisms/AdminSidebar";
import AdminHeader from "@/components/organisms/AdminHeader";
import AdminBottomNav from "@/components/organisms/AdminBottomNav";

export interface AdminDashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  duplicateCount?: number;
  salesCount?: number;
}

export const AdminDashboardLayout: React.FC<AdminDashboardLayoutProps> = ({
  children,
  title = "Dashboard Analytics",
  subtitle = "Portal Operasional Cabang UjungBatu",
  duplicateCount = 0,
  salesCount = 8,
}) => {
  return (
    <div className="min-h-screen bg-slate-100 flex antialiased font-sans text-slate-900">
      {/* Desktop & Wide Viewports Pinned Sidebar (>= 1024px) */}
      <div className="hidden lg:block shrink-0">
        <AdminSidebar duplicateCount={duplicateCount} salesCount={salesCount} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader title={title} subtitle={subtitle} />

        <main className="flex-1 bg-slate-50/80 p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-6">{children}</div>
        </main>
      </div>

      {/* Mobile, Foldables, & Narrow Tablet Bottom Nav (< 1024px) */}
      <AdminBottomNav duplicateCount={duplicateCount} />
    </div>
  );
};

export default AdminDashboardLayout;
