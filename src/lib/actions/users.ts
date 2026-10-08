"use server";

import { prisma } from "@/lib/prisma";
import type { User, Role } from "@prisma/client";

export type UserProfile = Omit<User, "password">;

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

// ─── GET USER PROFILE ─────────────────────────────────────────────────────

export async function getUserProfile(
  userId: string
): Promise<ActionResult<UserProfile>> {
  try {
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
        updatedAt: true,
      },
    });

    if (!user) {
      return { success: false, error: "User tidak ditemukan." };
    }

    return { success: true, data: user as UserProfile };
  } catch (error) {
    console.error("[getUserProfile] Error:", error);
    return { success: false, error: "Gagal memuat profil." };
  }
}

// ─── GET ALL SALES USERS (untuk dropdown admin/spv) ───────────────────────

export async function getAllSalesUsers(): Promise<
  ActionResult<Pick<User, "id" | "name" | "nip" | "title" | "isActive">[]>
> {
  try {
    const users = await prisma.user.findMany({
      where: { role: "SALES" },
      select: {
        id: true,
        name: true,
        nip: true,
        title: true,
        isActive: true,
      },
      orderBy: { name: "asc" },
    });

    return { success: true, data: users };
  } catch (error) {
    console.error("[getAllSalesUsers] Error:", error);
    return { success: false, error: "Gagal memuat daftar sales." };
  }
}

// ─── GET SPV USERS ───────────────────────────────────────────────────────

export async function getSPVUsers(): Promise<
  ActionResult<Pick<User, "id" | "name" | "title" | "isActive">[]>
> {
  try {
    const users = await prisma.user.findMany({
      where: { role: "SPV" },
      select: {
        id: true,
        name: true,
        title: true,
        isActive: true,
      },
      orderBy: { name: "asc" },
    });

    return { success: true, data: users };
  } catch (error) {
    console.error("[getSPVUsers] Error:", error);
    return { success: false, error: "Gagal memuat daftar SPV." };
  }
}

// ─── GET SALES TEAM WITH STATS (untuk halaman tim admin/SPV) ─────────────

export interface SalesTeamPlanItem {
  id: string;
  customerName: string;
  unitName: string;
  planDate: Date;
  spkStatus: "PENDING" | "BERHASIL" | "BELUM_BERHASIL";
  keterangan: string | null;
  isDuplicate: boolean;
  isRepeatFailed: boolean;
  createdAt: Date;
}

export interface SalesTeamMember {
  id: string;
  name: string;
  nip: string | null;
  title: string | null;
  phone: string | null;
  isActive: boolean;
  planSpks: SalesTeamPlanItem[];
  stats: {
    total: number;
    berhasil: number;
    pending: number;
    belumBerhasil: number;
    duplicates: number;
    repeatFailed: number;
    successRate: string;
  };
}

export async function getSalesTeamWithStats(): Promise<ActionResult<SalesTeamMember[]>> {
  try {
    const users = await prisma.user.findMany({
      where: { role: "SALES", isActive: true },
      select: {
        id: true,
        name: true,
        nip: true,
        title: true,
        phone: true,
        isActive: true,
        planSpks: {
          select: {
            id: true,
            customerName: true,
            unitName: true,
            planDate: true,
            spkStatus: true,
            keterangan: true,
            isDuplicate: true,
            isRepeatFailed: true,
            createdAt: true,
          },
          orderBy: { planDate: "desc" },
        },
      },
      orderBy: { name: "asc" },
    });

    const withStats: SalesTeamMember[] = users.map((u) => {
      const total = u.planSpks.length;
      const berhasil = u.planSpks.filter((p) => p.spkStatus === "BERHASIL").length;
      const pending = u.planSpks.filter((p) => p.spkStatus === "PENDING").length;
      const belumBerhasil = u.planSpks.filter((p) => p.spkStatus === "BELUM_BERHASIL").length;
      const duplicates = u.planSpks.filter((p) => p.isDuplicate).length;
      const repeatFailed = u.planSpks.filter((p) => p.isRepeatFailed).length;
      const successRate = total > 0 ? ((berhasil / total) * 100).toFixed(1) : "0.0";

      return {
        id: u.id,
        name: u.name,
        nip: u.nip,
        title: u.title,
        phone: u.phone,
        isActive: u.isActive,
        planSpks: u.planSpks as SalesTeamPlanItem[],
        stats: { total, berhasil, pending, belumBerhasil, duplicates, repeatFailed, successRate },
      };
    });

    // Sort by closing/berhasil count descending (leaderboard)
    withStats.sort((a, b) => b.stats.berhasil - a.stats.berhasil);

    return { success: true, data: withStats };
  } catch (error) {
    console.error("[getSalesTeamWithStats] Error:", error);
    return { success: false, error: "Gagal memuat data tim sales." };
  }
}
