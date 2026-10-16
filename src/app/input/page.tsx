/**
 * Halaman Server Component: Input Rencana SPK H-1
 * Agung Toyota UjungBatu (Cabang 220)
 *
 * Mengambil data sesi pengguna, menghitung opsi tanggal pintar (smart date)
 * di sisi server untuk mencegah React Hydration Mismatch di browser,
 * serta mengambil riwayat closing berhasil (DEAL) milik Sales.
 */

import React from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getSalesDealHistory } from "@/lib/actions/planSpk";
import { getSmartDateOptionsWIB } from "@/lib/utils/wibDate";
import { getDefaultRouteForRole } from "@/lib/auth/roleRoutes";
import InputFormClient from "./InputFormClient";

export default async function InputPlanSpkPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Jika bukan role SALES, arahkan ke rute administrasi (/admin/prospects)
  if (session.user.role !== "SALES") {
    redirect(getDefaultRouteForRole(session.user.role));
  }

  const userId = session.user.id;
  const salesName = session.user.name || "Sales Cabang 220";

  // Hitung konfigurasi smart date di server & ambil riwayat deal
  const [dealResult, initialSmartDate] = await Promise.all([
    getSalesDealHistory(userId, 7),
    Promise.resolve(getSmartDateOptionsWIB()),
  ]);

  const dealHistory = dealResult.success ? dealResult.data : [];

  return (
    <InputFormClient
      userId={userId}
      salesName={salesName}
      dealHistory={dealHistory}
      initialSmartDate={initialSmartDate}
    />
  );
}
