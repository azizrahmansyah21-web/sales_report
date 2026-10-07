import React from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ProfilClient from "./ProfilClient";

export default async function ProfilPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const userId = session.user.id;
  const salesName = session.user.name || "Sales Advisor";
  const salesTitle = session.user.title || "Sales Advisor Lapangan";
  const salesUsername = session.user.username ? `@${session.user.username}` : "NPK-ATUB-202108";

  // Fetch real performance statistics for the authenticated sales
  const [totalPlans, berhasilCount, pendingCount] = await Promise.all([
    prisma.planSPK.count({ where: { salesId: userId } }),
    prisma.planSPK.count({ where: { salesId: userId, spkStatus: "BERHASIL" } }),
    prisma.planSPK.count({ where: { salesId: userId, spkStatus: "PENDING" } }),
  ]);

  return (
    <ProfilClient
      salesName={salesName}
      salesTitle={salesTitle}
      salesUsername={salesUsername}
      totalPlans={totalPlans}
      berhasilCount={berhasilCount}
      pendingCount={pendingCount}
    />
  );
}
