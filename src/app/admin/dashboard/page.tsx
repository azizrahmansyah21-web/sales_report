import React from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSalesTeamWithStats } from "@/lib/actions/users";
import AdminDashboardClient from "./AdminDashboardClient";

export default async function AdminDashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Restrict sales advisors from accessing admin portal
  if (session.user.role === "SALES") {
    redirect("/beranda");
  }

  // Fetch real database records in parallel
  const [
    totalPlans,
    berhasilPlans,
    pendingPlans,
    belumBerhasilPlans,
    duplicatePlans,
    repeatFailedPlans,
    activeSalesCount,
    allPlansForChart,
    rawTopModels,
    rawRecentPlans,
    teamResult,
  ] = await Promise.all([
    prisma.planSPK.count(),
    prisma.planSPK.count({ where: { spkStatus: "BERHASIL" } }),
    prisma.planSPK.count({ where: { spkStatus: "PENDING" } }),
    prisma.planSPK.count({ where: { spkStatus: "BELUM_BERHASIL" } }),
    prisma.planSPK.count({ where: { isDuplicate: true } }),
    prisma.planSPK.count({ where: { isRepeatFailed: true } }),
    prisma.user.count({ where: { role: "SALES", isActive: true } }),
    prisma.planSPK.findMany({
      select: { planDate: true, spkStatus: true },
    }),
    prisma.planSPK.groupBy({
      by: ["unitName"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 4,
    }),
    prisma.planSPK.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        sales: { select: { name: true, nip: true } },
      },
    }),
    getSalesTeamWithStats(),
  ]);

  const closingRate =
    totalPlans > 0 ? ((berhasilPlans / totalPlans) * 100).toFixed(1) : "0.0";

  // Bucket plans into weekly intervals for movement trend chart
  const w1 = allPlansForChart.filter((p) => {
    const day = new Date(p.planDate).getDate();
    return day >= 1 && day <= 7;
  });
  const w2 = allPlansForChart.filter((p) => {
    const day = new Date(p.planDate).getDate();
    return day >= 8 && day <= 14;
  });
  const w3 = allPlansForChart.filter((p) => {
    const day = new Date(p.planDate).getDate();
    return day >= 15 && day <= 21;
  });
  const w4 = allPlansForChart.filter((p) => {
    const day = new Date(p.planDate).getDate();
    return day >= 22 && day <= 31;
  });

  const weeklyData = [
    {
      week: "Minggu 1",
      date: "1-7 Okt",
      prospects: w1.length,
      spk: w1.filter((p) => p.spkStatus === "BERHASIL").length,
    },
    {
      week: "Minggu 2",
      date: "8-14 Okt",
      prospects: w2.length,
      spk: w2.filter((p) => p.spkStatus === "BERHASIL").length,
    },
    {
      week: "Minggu 3",
      date: "15-21 Okt",
      prospects: w3.length,
      spk: w3.filter((p) => p.spkStatus === "BERHASIL").length,
    },
    {
      week: "Minggu 4",
      date: "22-31 Okt",
      prospects: w4.length,
      spk: w4.filter((p) => p.spkStatus === "BERHASIL").length,
    },
  ];

  // Map leaderboard from getSalesTeamWithStats
  const salesTeam = teamResult.success ? teamResult.data : [];
  const leaderboard = salesTeam.slice(0, 5).map((u, idx) => ({
    id: u.id,
    rank: idx + 1,
    name: u.name,
    npk: u.nip || `ATUB-${u.id.slice(0, 4)}`,
    spk: u.stats.berhasil,
    total: u.stats.total,
    conversionRate: u.stats.successRate,
  }));

  const topModels = rawTopModels.map((m) => ({
    name: m.unitName,
    count: m._count.id,
  }));

  const recentPlans = rawRecentPlans.map((p) => ({
    id: p.id,
    customerName: p.customerName,
    unitName: p.unitName,
    salesName: p.sales.name,
    salesNpk: p.sales.nip || "SALES-ATUB",
    planDate: new Date(p.planDate).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    spkStatus: p.spkStatus,
    isDuplicate: p.isDuplicate,
    isRepeatFailed: p.isRepeatFailed,
  }));

  return (
    <AdminDashboardClient
      totalPlans={totalPlans}
      berhasilPlans={berhasilPlans}
      pendingPlans={pendingPlans}
      belumBerhasilPlans={belumBerhasilPlans}
      duplicatePlans={duplicatePlans}
      repeatFailedPlans={repeatFailedPlans}
      activeSalesCount={activeSalesCount}
      closingRate={closingRate}
      weeklyData={weeklyData}
      leaderboard={leaderboard}
      topModels={topModels}
      recentPlans={recentPlans}
    />
  );
}
