import React from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getSalesTeamWithStats } from "@/lib/actions/users";
import AdminTeamClient from "./AdminTeamClient";

export default async function AdminTeamPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Guard against non-admin / non-spv roles (Sales cannot access team management)
  if (session.user.role === "SALES") {
    redirect("/beranda");
  }

  const currentUserRole = (session.user.role || "ADMIN") as "ADMIN" | "SPV";

  // Fetch real sales team performance stats from PostgreSQL
  const teamResult = await getSalesTeamWithStats();
  const members = teamResult.success && teamResult.data ? teamResult.data : [];

  return (
    <AdminTeamClient
      initialMembers={members}
      currentUserRole={currentUserRole}
    />
  );
}
