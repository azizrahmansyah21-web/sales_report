import React from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminProspectsClient from "./AdminProspectsClient";

export default async function AdminProspectsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Guard against non-admin / non-spv roles
  if (session.user.role === "SALES") {
    redirect("/beranda");
  }

  const currentUserRole = (session.user.role || "ADMIN") as "ADMIN" | "SPV";

  // Fetch all plans and sales users concurrently
  const [rawPlans, salesUsers] = await Promise.all([
    prisma.planSPK.findMany({
      include: {
        sales: {
          select: {
            id: true,
            name: true,
            nip: true,
            title: true,
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

  // Serialize date fields safely for Client Component
  const initialPlans = rawPlans.map((p) => ({
    id: p.id,
    customerName: p.customerName,
    unitName: p.unitName,
    planDate: p.planDate.toISOString(),
    spkStatus: p.spkStatus,
    keterangan: p.keterangan,
    isDuplicate: p.isDuplicate,
    isRepeatFailed: p.isRepeatFailed,
    createdAt: p.createdAt.toISOString(),
    sales: {
      id: p.sales.id,
      name: p.sales.name,
      nip: p.sales.nip,
      title: p.sales.title,
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
