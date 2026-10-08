"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { planSpkSchema, updateSpkStatusSchema, updateKeteranganSchema } from "@/lib/validations/planSpk";
import { SpkStatus } from "@prisma/client";
import type { PlanSPK, User, Prisma } from "@prisma/client";

function safeRevalidatePath(path: string) {
  try {
    revalidatePath(path);
  } catch {
    // Gracefully ignore outside Next.js request context (e.g. testing)
  }
}

// ─── TYPE DEFINITIONS ──────────────────────────────────────────────────────

export type PlanSpkWithUser = PlanSPK & {
  sales: Pick<User, "id" | "name" | "nip" | "title">;
};

export type PaginatedPlanSpks = {
  data: PlanSpkWithUser[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type DashboardStats = {
  total: number;
  byStatus: { status: SpkStatus; count: number }[];
  duplicateCount: number;
  repeatFailedCount: number;
};

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

// ─── CREATE PLAN SPK (H-1) ───────────────────────────────────────────────

export async function createPlanSpk(
  userId: string, // ID dari sales yang login
  formData: unknown
): Promise<ActionResult<PlanSPK>> {
  try {
    const parsed = planSpkSchema.safeParse(formData);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? "Data tidak valid";
      return { success: false, error: firstError };
    }

    const { customerName, unitName, planDate } = parsed.data;
    const cleanCustomerName = customerName.trim();

    // Deteksi duplikat: cari plan sebelumnya dengan nama customer yang sama di cabang
    const previousPlans = await prisma.planSPK.findMany({
      where: {
        customerName: {
          equals: cleanCustomerName,
          mode: "insensitive",
        },
      },
      select: { spkStatus: true },
    });

    const isDuplicate = previousPlans.length > 0;
    const isRepeatFailed = previousPlans.some((p) => p.spkStatus === "BELUM_BERHASIL");

    const newPlan = await prisma.planSPK.create({
      data: {
        salesId: userId,
        customerName: cleanCustomerName,
        unitName: unitName.trim(),
        planDate,
        spkStatus: "PENDING", // Default
        keterangan: null,
        isDuplicate,
        isRepeatFailed,
      },
    });

    safeRevalidatePath("/beranda");
    safeRevalidatePath("/admin/dashboard");
    return { success: true, data: newPlan };
  } catch (error) {
    console.error("[createPlanSpk] Error:", error);
    return { success: false, error: "Gagal menyimpan plan SPK." };
  }
}

// ─── READ (GET ALL DENGAN PAGINASI & FILTER) ──────────────────────────────

export async function getPlanSpks(params?: {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: SpkStatus;
  salesId?: string;
  date?: Date; // Filter by plan date
}): Promise<ActionResult<PaginatedPlanSpks>> {
  try {
    const page = Math.max(1, params?.page || 1);
    const pageSize = Math.max(1, params?.pageSize || 10);
    const skip = (page - 1) * pageSize;

    const whereClause: Prisma.PlanSPKWhereInput = {};

    if (params?.search) {
      whereClause.OR = [
        { customerName: { contains: params.search, mode: "insensitive" } },
        { unitName: { contains: params.search, mode: "insensitive" } },
      ];
    }
    if (params?.status) {
      whereClause.spkStatus = params.status;
    }
    if (params?.salesId) {
      whereClause.salesId = params.salesId;
    }
    if (params?.date) {
      const startOfDay = new Date(params.date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(params.date);
      endOfDay.setHours(23, 59, 59, 999);

      whereClause.planDate = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    const [total, data] = await Promise.all([
      prisma.planSPK.count({ where: whereClause }),
      prisma.planSPK.findMany({
        where: whereClause,
        include: {
          sales: {
            select: { id: true, name: true, nip: true, title: true },
          },
        },
        orderBy: { planDate: "desc" },
        skip,
        take: pageSize,
      }),
    ]);

    const totalPages = Math.ceil(total / pageSize);

    return {
      success: true,
      data: { data, total, page, pageSize, totalPages },
    };
  } catch (error) {
    console.error("[getPlanSpks] Error:", error);
    return { success: false, error: "Gagal memuat data plan SPK." };
  }
}

import { auth } from "@/lib/auth";

export interface ActionSessionUser {
  id: string;
  role: string;
  name?: string | null;
}

// ─── UPDATE SPK STATUS (Oleh Admin & SPV) ──────────────────────────────────

export async function updateSpkStatus(
  planId: string,
  formData: unknown,
  overrideSession?: { user: ActionSessionUser } | null
): Promise<ActionResult<PlanSPK>> {
  try {
    const session = overrideSession !== undefined ? overrideSession : (await auth());
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SPV")) {
      return {
        success: false,
        error: "Akses ditolak: Hanya Admin dan SPV yang dapat mengubah status SPK.",
      };
    }

    const parsed = updateSpkStatusSchema.safeParse(formData);
    if (!parsed.success) {
      return { success: false, error: "Status tidak valid" };
    }

    const updated = await prisma.planSPK.update({
      where: { id: planId },
      data: { spkStatus: parsed.data.spkStatus },
    });

    safeRevalidatePath("/admin/dashboard");
    safeRevalidatePath("/admin/prospects");
    safeRevalidatePath("/beranda");
    safeRevalidatePath("/riwayat");
    return { success: true, data: updated };
  } catch (error) {
    console.error("[updateSpkStatus] Error:", error);
    return { success: false, error: "Gagal mengupdate status SPK." };
  }
}

// ─── UPDATE KETERANGAN (Khusus Admin) ──────────────────────────────────────

export async function updateKeterangan(
  planId: string,
  formData: unknown,
  overrideSession?: { user: ActionSessionUser } | null
): Promise<ActionResult<PlanSPK>> {
  try {
    const session = overrideSession !== undefined ? overrideSession : (await auth());
    if (!session?.user || session.user.role !== "ADMIN") {
      return {
        success: false,
        error: "Akses ditolak: Hanya Admin yang berwenang membuat atau mengubah catatan keterangan.",
      };
    }

    const parsed = updateKeteranganSchema.safeParse(formData);
    if (!parsed.success) {
      return { success: false, error: "Keterangan tidak valid" };
    }

    const updated = await prisma.planSPK.update({
      where: { id: planId },
      data: { keterangan: parsed.data.keterangan },
    });

    safeRevalidatePath("/admin/dashboard");
    safeRevalidatePath("/admin/prospects");
    safeRevalidatePath("/beranda");
    safeRevalidatePath("/riwayat");
    return { success: true, data: updated };
  } catch (error) {
    console.error("[updateKeterangan] Error:", error);
    return { success: false, error: "Gagal menyimpan keterangan." };
  }
}

// ─── GET DASHBOARD STATS ──────────────────────────────────────────────────

export async function getDashboardStats(): Promise<ActionResult<DashboardStats>> {
  try {
    const [total, grouped, duplicateCount, repeatFailedCount] = await Promise.all([
      prisma.planSPK.count(),
      prisma.planSPK.groupBy({
        by: ["spkStatus"],
        _count: { id: true },
      }),
      prisma.planSPK.count({ where: { isDuplicate: true } }),
      prisma.planSPK.count({ where: { isRepeatFailed: true } }),
    ]);

    const byStatus = grouped.map((g) => ({
      status: g.spkStatus as SpkStatus,
      count: g._count.id,
    }));

    return {
      success: true,
      data: { total, byStatus, duplicateCount, repeatFailedCount },
    };
  } catch (error) {
    console.error("[getDashboardStats] Error:", error);
    return { success: false, error: "Gagal memuat statistik dashboard." };
  }
}

// ─── GET CUSTOMER AUDIT TRAIL HISTORY ────────────────────────────────────

export type CustomerHistoryItem = PlanSPK & {
  sales: Pick<User, "id" | "name" | "nip" | "title" | "phone">;
};

export async function getCustomerHistory(
  customerName: string
): Promise<ActionResult<CustomerHistoryItem[]>> {
  try {
    const cleanName = customerName.trim();
    if (!cleanName) {
      return { success: false, error: "Nama pelanggan tidak boleh kosong." };
    }

    const plans = await prisma.planSPK.findMany({
      where: {
        customerName: {
          equals: cleanName,
          mode: "insensitive",
        },
      },
      include: {
        sales: {
          select: { id: true, name: true, nip: true, title: true, phone: true },
        },
      },
      orderBy: { planDate: "asc" },
    });

    return { success: true, data: plans };
  } catch (error) {
    console.error("[getCustomerHistory] Error:", error);
    return { success: false, error: "Gagal memuat riwayat audit customer." };
  }
}
