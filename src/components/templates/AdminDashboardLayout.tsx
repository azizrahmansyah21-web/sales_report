"use client";

import React, { useState } from "react";
import AdminSidebar from "@/components/organisms/AdminSidebar";
import AdminHeader from "@/components/organisms/AdminHeader";

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
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100 flex antialiased font-sans text-slate-900">
      {/* Desktop Pinned Sidebar */}
      <div className="hidden md:block shrink-0">
        <AdminSidebar duplicateCount={duplicateCount} salesCount={salesCount} />
      </div>

      {/* Mobile Sidebar Overlay Drawer */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            onClick={() => setIsMobileSidebarOpen(false)}
            aria-hidden="true"
          />
          {/* Sidebar Drawer */}
          <div className="relative z-10 w-64 max-w-[80vw]">
            <AdminSidebar duplicateCount={duplicateCount} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          title={title}
          subtitle={subtitle}
          onToggleSidebar={() => setIsMobileSidebarOpen(true)}
        />

        <main className="flex-1 bg-slate-50/80 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboardLayout;
