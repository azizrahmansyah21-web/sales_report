import React from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminDashboardLayout from "@/components/templates/AdminDashboardLayout";
import Avatar from "@/components/atoms/Avatar";
import Badge, { type BadgeVariant } from "@/components/atoms/Badge";
import SignOutButton from "./SignOutButton";
import {
  User,
  ShieldCheck,
  Building2,
  Phone,
  Mail,
  Calendar,
  FileSpreadsheet,
  Award,
  Users2,
  AlertTriangle,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const userId = session.user.id;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      nip: true,
      username: true,
      email: true,
      role: true,
      title: true,
      phone: true,
      isActive: true,
      createdAt: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  // Ringkasan metrik cabang untuk supervisi admin/SPV
  const [totalBranchPlans, totalClosed, totalDuplicates, activeSalesCount] =
    await Promise.all([
      prisma.planSPK.count(),
      prisma.planSPK.count({ where: { spkStatus: "BERHASIL" } }),
      prisma.planSPK.count({ where: { isDuplicate: true } }),
      prisma.user.count({ where: { role: "SALES", isActive: true } }),
    ]);

  const roleLabel =
    user.role === "SUPERADMIN"
      ? "Superadmin Sistem"
      : user.role === "SPV"
      ? "Supervisor Sales"
      : "Administrasi Cabang";

  const roleBadgeVariant: BadgeVariant =
    user.role === "SUPERADMIN"
      ? "LOST"
      : user.role === "SPV"
      ? "FOLLOW_UP"
      : "DEAL";

  return (
    <AdminDashboardLayout
      title="Profil Pengguna"
      subtitle="Informasi Kredensial & Pengaturan Akun Operasional"
      duplicateCount={totalDuplicates}
      salesCount={activeSalesCount}
    >
      <div className="space-y-6">
        {/* Kartu Profil Utama */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-4">
              <Avatar name={user.name} size="lg" isOnline={user.isActive} />
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                    {user.name}
                  </h1>
                  <Badge variant={roleBadgeVariant}>{roleLabel}</Badge>
                </div>
                <p className="text-xs md:text-sm font-semibold text-slate-500 mt-1">
                  {user.title || "Pejabat Operasional Cabang"} • Agung Toyota UjungBatu (Cabang 220)
                </p>
                <p className="text-xs font-mono text-slate-400 mt-0.5">
                  NIP: {user.nip || "-"} • Username: @{user.username || user.nip}
                </p>
              </div>
            </div>

            <SignOutButton />
          </div>

          {/* Grid Informasi Kontak & Akses */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>Hak Akses Peran</span>
              </div>
              <p className="mt-1.5 text-sm font-bold text-slate-800">
                {user.role}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {user.role === "SUPERADMIN"
                  ? "Akses Penuh Server & Fitur"
                  : user.role === "SPV"
                  ? "Evaluasi & Catatan SPV"
                  : "Verifikasi SPK & Ekspor"}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold">
                <Building2 className="w-4 h-4 text-emerald-600" />
                <span>Unit Kerja</span>
              </div>
              <p className="mt-1.5 text-sm font-bold text-slate-800">
                Cabang Resmi 220
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                UjungBatu, Rokan Hulu
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold">
                <Phone className="w-4 h-4 text-amber-600" />
                <span>No. WhatsApp / HP</span>
              </div>
              <p className="mt-1.5 text-sm font-bold text-slate-800 font-mono">
                {user.phone || "-"}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Aktif untuk notifikasi sistem
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold">
                <Mail className="w-4 h-4 text-purple-600" />
                <span>Email Resmi</span>
              </div>
              <p className="mt-1.5 text-sm font-bold text-slate-800 truncate">
                {user.email || "-"}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Terdaftar di database cabang
              </p>
            </div>
          </div>
        </div>

        {/* Ringkasan Operasional Cabang */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 md:p-8">
          <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-blue-600" />
            <span>Overview Basis Data Operasional Cabang 220</span>
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100">
              <div className="flex items-center gap-1.5 text-blue-700 text-xs font-semibold">
                <FileSpreadsheet className="w-4 h-4" />
                <span>Total Rencana SPK</span>
              </div>
              <p className="text-2xl font-black text-blue-900 mt-2">
                {totalBranchPlans}
              </p>
              <p className="text-[10px] text-blue-600 mt-0.5 font-medium">
                Semua entri tercatat
              </p>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100">
              <div className="flex items-center gap-1.5 text-emerald-700 text-xs font-semibold">
                <Award className="w-4 h-4" />
                <span>Realisasi Closing</span>
              </div>
              <p className="text-2xl font-black text-emerald-900 mt-2">
                {totalClosed}
              </p>
              <p className="text-[10px] text-emerald-600 mt-0.5 font-medium">
                SPK berstatus berhasil
              </p>
            </div>

            <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-100">
              <div className="flex items-center gap-1.5 text-amber-700 text-xs font-semibold">
                <AlertTriangle className="w-4 h-4" />
                <span>Terdeteksi Duplikat</span>
              </div>
              <p className="text-2xl font-black text-amber-900 mt-2">
                {totalDuplicates}
              </p>
              <p className="text-[10px] text-amber-600 mt-0.5 font-medium">
                Prospek nama pelanggan mirip
              </p>
            </div>

            <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-100">
              <div className="flex items-center gap-1.5 text-purple-700 text-xs font-semibold">
                <Users2 className="w-4 h-4" />
                <span>Personel Sales Aktif</span>
              </div>
              <p className="text-2xl font-black text-purple-900 mt-2">
                {activeSalesCount}
              </p>
              <p className="text-[10px] text-purple-600 mt-0.5 font-medium">
                Terdaftar di sistem lapangan
              </p>
            </div>
          </div>
        </div>
      </div>
    </AdminDashboardLayout>
  );
}
