import React from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { isSuperAdmin } from "@/lib/auth/roleRoutes";
import AdminDashboardLayout from "@/components/templates/AdminDashboardLayout";
import SettingsTabsClient from "./SettingsTabsClient";
import { getDatabaseHealthStats } from "@/lib/actions/databaseAdmin";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Proteksi server-side: Hanya SUPERADMIN yang diizinkan
  if (!isSuperAdmin(session.user.role)) {
    redirect("/admin/prospects");
  }

  const initialDbStats = await getDatabaseHealthStats();

  return (
    <AdminDashboardLayout
      title="Pusat Kendali Superadmin"
      subtitle="Manajemen Database, Karyawan, WA Gateway & Pengaturan Sistem Cabang 220"
      duplicateCount={initialDbStats.totalDuplicates}
      salesCount={initialDbStats.totalActiveSales}
    >
      <SettingsTabsClient initialDbStats={initialDbStats} />
    </AdminDashboardLayout>
  );
}
