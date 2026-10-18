/**
 * Halaman Server Component: Data Rencana SPK H-1 Cabang
 * Agung Toyota UjungBatu (Cabang 220)
 *
 * Halaman tunggal operasional bagi Admin, ADH, dan SPV untuk:
 * - Memantau rencana prospek SPK seluruh sales cabang
 * - Filter cepat [✓] Input Terbaru Hari Ini
 * - Ekspor laporan data ke file Excel (.xlsx) sekali klik
 * - Verifikasi status realisasi closing dan catatan evaluasi tindak lanjut
 */

import React from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canManageRealization, getDefaultRouteForRole } from "@/lib/auth/roleRoutes";
import AdminProspectsClient from "./AdminProspectsClient";

export default async function AdminProspectsPage() {
  const session = await auth();

  // Pengguna belum login diarahkan ke halaman login
  if (!session?.user) {
    redirect("/login");
  }

  // Guard peran: jika tenaga SALES mencoba membuka rute ini, alihkan ke /input (mencegah redirect loop)
  if (!canManageRealization(session.user.role)) {
    redirect(getDefaultRouteForRole(session.user.role));
  }

  const currentUserRole = (session.user.role || "ADMIN") as "ADMIN" | "SPV" | "ADH";

  // Ambil seluruh data rencana SPK beserta relasi sales secara konkuren
  const [rawPlans, salesUsers] = await Promise.all([
    prisma.planSPK.findMany({
      include: {
        sales: {
          select: {
            id: true,
            name: true,
            nip: true,
            title: true,
            phone: true,
          },
        },
      },
      orderBy: { planDate: "desc" },
    }),
    prisma.user.findMany({
      where: { role: "SALES" },
      select: {
        id: true,
        name: true,
        nip: true,
      },
      orderBy: { name: "asc" },
    }),
  ]);

  // Serialisasi data tanggal ke ISO String untuk Client Component
  const initialPlans = rawPlans.map((p) => ({
    id: p.id,
    customerName: p.customerName,
    unitName: p.unitName,
    planDate: p.planDate.toISOString(),
    spkStatus: p.spkStatus,
    keterangan: p.keterangan,
    keteranganSpv: p.keteranganSpv,
    keteranganAdmin: p.keteranganAdmin,
    isUnplanned: p.isUnplanned,
    isDuplicate: p.isDuplicate,
    isRepeatFailed: p.isRepeatFailed,
    createdAt: p.createdAt.toISOString(),
    sales: {
      id: p.sales.id,
      name: p.sales.name,
      nip: p.sales.nip,
      title: p.sales.title,
      phone: p.sales.phone,
    },
  }));

  return (
    <AdminProspectsClient
      initialPlans={initialPlans}
      salesUsers={salesUsers}
      currentUserRole={currentUserRole}
    />
  );
}
