import React from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import RiwayatClient from "./RiwayatClient";

export default async function RiwayatPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const userId = session.user.id;
  const salesName = session.user.name || "Sales Advisor";
  const salesTitle = session.user.title || "Sales Advisor Lapangan";

  // Query all Plan SPKs for the logged-in sales, latest first
  const plans = await prisma.planSPK.findMany({
    where: { salesId: userId },
    orderBy: { planDate: "desc" },
  });

  return (
    <RiwayatClient
      initialPlans={plans}
      salesName={salesName}
      salesTitle={salesTitle}
    />
  );
}
