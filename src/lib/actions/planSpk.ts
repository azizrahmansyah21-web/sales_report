/**
 * Server Actions untuk Pengelolaan Rencana SPK H-1
 * Agung Toyota UjungBatu (Cabang 220)
 *
 * Modul ini menangani:
 * 1. Pendaftaran rencana SPK baru oleh Sales dengan penegakan batas waktu (cutoff) 16:00 WIB.
 * 2. Deteksi otomatis prospek duplikat dan gagal berulang di basis data cabang.
 * 3. Verifikasi realisasi closing dan catatan evaluasi oleh SPV, ADH, dan Admin.
 * 4. Pengiriman notifikasi WhatsApp Group dengan proteksi serverless Vercel.
 */

"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import {
  planSpkSchema,
  updateSpkStatusSchema,
  updateKeteranganSpvSchema,
  updateSpkStatusDanAdminSchema,
  createUnplannedSpkSchema,
} from "@/lib/validations/planSpk";
import {
  isPastCutoff16WIB,
  getDateStringWIB,
  getTodayRangeWIB,
} from "@/lib/utils/wibDate";
import {
  canManageRealization,
  canChangeSpkStatus,
} from "@/lib/auth/roleRoutes";
import { sendPlanSpkNotification } from "@/lib/whatsapp/client";
import { SpkStatus } from "@prisma/client";
import type { PlanSPK, User, Prisma } from "@prisma/client";

/**
 * Memanggil revalidatePath secara aman di luar konteks request Next.js (misal saat unit test).
 *
 * @param path - Rute yang ingin di-revalidate
 */
function safeRevalidatePath(path: string): void {
  try {
    revalidatePath(path);
  } catch {
    // Abaikan jika dipanggil di luar siklus HTTP Next.js
  }
}

// ─── TIPE DATA HASIL & STATISTIK ─────────────────────────────────────────────

export type PlanSpkWithUser = PlanSPK & {
  sales: Pick<User, "id" | "name" | "nip" | "title" | "phone">;
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

export interface ActionSessionUser {
  id: string;
  role: string;
  name?: string | null;
}

// ─── PEMBUATAN RENCANA SPK (SALES ROLE) ──────────────────────────────────────

/**
 * Menyimpan data rencana SPK H-1 baru yang diinput oleh Sales.
 * Menerapkan aturan operasional Cabang 220:
 * - Mengambil User ID langsung dari sesi terotentikasi server (Security IDOR Patch).
 * - Jika waktu submit sudah >= 16:00 WIB dan tanggal yang dikirim adalah hari ini,
 *   tanggal rencana otomatis dialihkan ke H+1 (esok hari).
 * - Mendeteksi apakah nama pelanggan sudah pernah diajukan sebelumnya (duplikat).
 * - Menandai status gagal berulang jika prospek sebelumnya berstatus BELUM_BERHASIL.
 *
 * @param formData - Objek input dari form klien
 * @param overrideSession - Opsional token sesi untuk testing
 * @returns Rencana SPK yang berhasil dibuat
 */
export async function createPlanSpk(
  formData: unknown,
  overrideSession?: { user: ActionSessionUser } | null
): Promise<ActionResult<PlanSPK>> {
  try {
    const session =
      overrideSession !== undefined ? overrideSession : await auth();

    if (!session?.user?.id) {
      return {
        success: false,
        error: "Akses ditolak: Sesi login tidak ditemukan atau telah kedaluwarsa.",
      };
    }

    const userId = session.user.id;

    const parsed = planSpkSchema.safeParse(formData);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? "Data tidak valid";
      return { success: false, error: firstError };
    }

    const { customerName, unitName, planDate } = parsed.data;
    const cleanCustomerName = customerName.trim();

    // Penegakan aturan Cutoff 16:00 WIB di sisi server
    const todayStrWIB = getDateStringWIB(0);
    const tomorrowStrWIB = getDateStringWIB(1);
    let finalPlanDate = planDate;

    if (isPastCutoff16WIB()) {
      const submittedDateStr = planDate.toISOString().split("T")[0];
      // Jika submit setelah 16:00 WIB dan memilih hari ini, alihkan ke esok hari
      if (submittedDateStr <= todayStrWIB) {
        finalPlanDate = new Date(`${tomorrowStrWIB}T00:00:00.000Z`);
      }
    }

    // 1. Proteksi Idempotensi (Anti-Double Submit & Anti-Sync Duplicate):
    // Jika sales yang sama sudah memiliki rencana SPK aktif (PENDING) untuk customer yang sama,
    // unit yang sama, dan target tanggal yang sama, kembalikan data yang sudah ada (jangan buat baris ganda).
    const existingPendingPlan = await prisma.planSPK.findFirst({
      where: {
        salesId: userId,
        customerName: {
          equals: cleanCustomerName,
          mode: "insensitive",
        },
        unitName: {
          equals: unitName.trim(),
          mode: "insensitive",
        },
        planDate: finalPlanDate,
        spkStatus: "PENDING",
      },
      orderBy: { createdAt: "desc" },
    });

    if (existingPendingPlan) {
      safeRevalidatePath("/input");
      safeRevalidatePath("/admin/prospects");
      return { success: true, data: existingPendingPlan };
    }

    // 2. Deteksi duplikat riwayat / lintas sales di cabang:
    // Cari riwayat sebelumnya dengan nama pelanggan serupa di cabang
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
    const isRepeatFailed = previousPlans.some(
      (p) => p.spkStatus === "BELUM_BERHASIL"
    );

    // Ambil data sales untuk payload notifikasi
    const salesUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true },
    });

    const newPlan = await prisma.planSPK.create({
      data: {
        salesId: userId,
        customerName: cleanCustomerName,
        unitName: unitName.trim(),
        planDate: finalPlanDate,
        spkStatus: "PENDING",
        keterangan: null,
        isDuplicate,
        isRepeatFailed,
      },
    });

    // Kirim notifikasi WA secara background (graceful bypass di Vercel demo)
    sendPlanSpkNotification({
      customerName: cleanCustomerName,
      unitName: unitName.trim(),
      planDate: finalPlanDate,
      salesName: salesUser?.name || "Sales Cabang 220",
    }).catch((notifError) => {
      console.error("[createPlanSpk] Kendala pengiriman notifikasi:", notifError);
    });

    safeRevalidatePath("/input");
    safeRevalidatePath("/admin/prospects");
    return { success: true, data: newPlan };
  } catch (error) {
    console.error("[createPlanSpk] Error:", error);
    return { success: false, error: "Gagal menyimpan rencana SPK ke basis data." };
  }
}

// ─── PENGAMBILAN DATA BERPAGINASI & FILTER ────────────────────────────────────

/**
 * Mengambil daftar rencana SPK dengan filter pencarian, status, sales, dan tanggal.
 *
 * @param params - Parameter filter query
 * @returns Data rencana berpaginasi
 */
export async function getPlanSpks(params?: {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: SpkStatus;
  salesId?: string;
  date?: Date;
  todayInputOnly?: boolean;
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

    // Filter khusus: Hanya data yang diinput hari ini pada zona waktu WIB
    if (params?.todayInputOnly) {
      const { startOfDayUTC, endOfDayUTC } = getTodayRangeWIB();
      whereClause.createdAt = {
        gte: startOfDayUTC,
        lte: endOfDayUTC,
      };
    }

    const [total, data] = await Promise.all([
      prisma.planSPK.count({ where: whereClause }),
      prisma.planSPK.findMany({
        where: whereClause,
        include: {
          sales: {
            select: { id: true, name: true, nip: true, title: true, phone: true },
          },
        },
        orderBy: params?.todayInputOnly
          ? { createdAt: "desc" }
          : { planDate: "desc" },
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
    return { success: false, error: "Gagal memuat data rencana SPK." };
  }
}

// ─── VERIFIKASI STATUS & CATATAN EVALUASI (SPV / ADH / ADMIN) ────────────────

/**
 * Memperbarui status realisasi SPK (PENDING, BERHASIL, atau BELUM_BERHASIL).
 * Wewenang diberikan kepada ADMIN, ADH, dan SPV.
 *
 * @param planId - ID rencana SPK
 * @param formData - Objek berisi status baru
 * @param overrideSession - Opsional token sesi untuk testing
 * @returns Data rencana SPK terupdate
 */
/**
 * Memperbarui status realisasi SPK (PENDING, BERHASIL, atau BELUM_BERHASIL).
 * Wewenang dibatasi khusus untuk ADMIN dan ADH (SPV dilarang mengubah status).
 */
export async function updateSpkStatus(
  planId: string,
  formData: unknown,
  overrideSession?: { user: ActionSessionUser } | null
): Promise<ActionResult<PlanSPK>> {
  try {
    const session = overrideSession !== undefined ? overrideSession : await auth();
    if (!session?.user || !canChangeSpkStatus(session.user.role)) {
      return {
        success: false,
        error: "Akses ditolak: Hanya Admin dan ADH yang dapat memverifikasi status SPK.",
      };
    }

    const parsed = updateSpkStatusSchema.safeParse(formData);
    if (!parsed.success) {
      return { success: false, error: "Status realisasi yang dipilih tidak valid." };
    }

    const updated = await prisma.planSPK.update({
      where: { id: planId },
      data: { spkStatus: parsed.data.spkStatus },
    });

    safeRevalidatePath("/input");
    safeRevalidatePath("/admin/prospects");
    safeRevalidatePath("/admin/team");
    return { success: true, data: updated };
  } catch (error) {
    console.error("[updateSpkStatus] Error:", error);
    return { success: false, error: "Gagal memperbarui status realisasi SPK." };
  }
}

/**
 * Memperbarui catatan supervisi oleh SPV.
 * Diizinkan bagi akun dengan role SPV, ADMIN, dan ADH.
 */
export async function updateKeteranganSpv(
  planId: string,
  formData: unknown,
  overrideSession?: { user: ActionSessionUser } | null
): Promise<ActionResult<PlanSPK>> {
  try {
    const session = overrideSession !== undefined ? overrideSession : await auth();
    if (!session?.user || !canManageRealization(session.user.role)) {
      return {
        success: false,
        error: "Akses ditolak: Hanya SPV, Admin, dan ADH yang dapat mengisi Catatan SPV.",
      };
    }

    const parsed = updateKeteranganSpvSchema.safeParse(formData);
    if (!parsed.success) {
      return { success: false, error: "Format catatan SPV tidak valid." };
    }

    const updated = await prisma.planSPK.update({
      where: { id: planId },
      data: { keteranganSpv: parsed.data.keteranganSpv },
    });

    safeRevalidatePath("/admin/prospects");
    safeRevalidatePath("/admin/team");
    return { success: true, data: updated };
  } catch (error) {
    console.error("[updateKeteranganSpv] Error:", error);
    return { success: false, error: "Gagal menyimpan Catatan SPV." };
  }
}

/**
 * Memperbarui status realisasi SPK, catatan verifikasi admin, dan status SPK unplanned.
 * Hak akses dibatasi ketat khusus untuk ADMIN dan ADH (SPV dilarang mengubah status).
 */
export async function updateSpkStatusDanAdmin(
  planId: string,
  formData: unknown,
  overrideSession?: { user: ActionSessionUser } | null
): Promise<ActionResult<PlanSPK>> {
  try {
    const session = overrideSession !== undefined ? overrideSession : await auth();
    if (!session?.user || !canChangeSpkStatus(session.user.role)) {
      return {
        success: false,
        error: "Akses ditolak: Hanya Admin dan ADH yang berwenang mengubah status SPK dan catatan admin.",
      };
    }

    const parsed = updateSpkStatusDanAdminSchema.safeParse(formData);
    if (!parsed.success) {
      return { success: false, error: "Data status atau catatan admin tidak valid." };
    }

    const updated = await prisma.planSPK.update({
      where: { id: planId },
      data: {
        spkStatus: parsed.data.spkStatus,
        keteranganAdmin: parsed.data.keteranganAdmin,
        isUnplanned: parsed.data.isUnplanned,
      },
    });

    safeRevalidatePath("/input");
    safeRevalidatePath("/admin/prospects");
    safeRevalidatePath("/admin/team");
    return { success: true, data: updated };
  } catch (error) {
    console.error("[updateSpkStatusDanAdmin] Error:", error);
    return { success: false, error: "Gagal memperbarui status realisasi dan catatan admin." };
  }
}

/**
 * Mendaftarkan SPK closing dadakan (unplanned) langsung oleh Admin/ADH.
 * Digunakan jika sales tembus closing fisik tanpa sempat menginput rencana H-1.
 */
export async function createUnplannedSpk(
  formData: unknown,
  overrideSession?: { user: ActionSessionUser } | null
): Promise<ActionResult<PlanSPK>> {
  try {
    const session = overrideSession !== undefined ? overrideSession : await auth();
    if (!session?.user || !canChangeSpkStatus(session.user.role)) {
      return {
        success: false,
        error: "Akses ditolak: Hanya Admin dan ADH yang berwenang mendaftarkan SPK Unplanned.",
      };
    }

    const parsed = createUnplannedSpkSchema.safeParse(formData);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? "Data tidak valid";
      return { success: false, error: firstError };
    }

    const { salesId, customerName, unitName, planDate, spkStatus, keteranganAdmin } = parsed.data;

    const salesUser = await prisma.user.findUnique({
      where: { id: salesId },
      select: { id: true },
    });

    if (!salesUser) {
      return { success: false, error: "Akun sales yang dipilih tidak terdaftar di sistem." };
    }

    const created = await prisma.planSPK.create({
      data: {
        salesId,
        customerName: customerName.trim(),
        unitName: unitName.trim(),
        planDate,
        spkStatus,
        keteranganAdmin: keteranganAdmin ? keteranganAdmin.trim() : null,
        isUnplanned: true,
      },
    });

    safeRevalidatePath("/input");
    safeRevalidatePath("/admin/prospects");
    safeRevalidatePath("/admin/team");
    return { success: true, data: created };
  } catch (error) {
    console.error("[createUnplannedSpk] Error:", error);
    return { success: false, error: "Gagal mendaftarkan SPK Unplanned." };
  }
}

/**
 * Memperbarui status realisasi dan catatan evaluasi lama (kompatibilitas transisi).
 */
export async function updateSpkRealization(
  planId: string,
  payload: { spkStatus: SpkStatus; keterangan?: string | null }
): Promise<ActionResult<PlanSPK>> {
  try {
    const session = await auth();
    if (!session?.user || !canChangeSpkStatus(session.user.role)) {
      return {
        success: false,
        error: "Akses ditolak: Hanya Admin dan ADH yang berwenang memperbarui status realisasi.",
      };
    }

    const updated = await prisma.planSPK.update({
      where: { id: planId },
      data: {
        spkStatus: payload.spkStatus,
        keterangan: payload.keterangan ? payload.keterangan.trim() : null,
      },
    });

    safeRevalidatePath("/input");
    safeRevalidatePath("/admin/prospects");
    safeRevalidatePath("/admin/team");
    return { success: true, data: updated };
  } catch (error) {
    console.error("[updateSpkRealization] Error:", error);
    return { success: false, error: "Gagal menyimpan pembaruan realisasi SPK." };
  }
}

// ─── RIWAYAT AUDIT & CLOSING SALES ───────────────────────────────────────────

export type CustomerHistoryItem = PlanSPK & {
  sales: Pick<User, "id" | "name" | "nip" | "title" | "phone">;
};

/**
 * Mengambil seluruh rekam jejak pengajuan suatu nama pelanggan untuk audit timeline.
 *
 * @param customerName - Nama pelanggan yang dicari
 * @returns Daftar riwayat rencana pelanggan
 */
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
    return { success: false, error: "Gagal memuat riwayat audit pelanggan." };
  }
}

export type SalesDealRecord = {
  id: string;
  customerName: string;
  unitName: string;
  planDate: string;
};

/**
 * Mengambil riwayat rencana yang berhasil closing (DEAL) milik seorang sales.
 * Ditampilkan di bawah form input sebagai Closing Motivation Card.
 *
 * @param salesId - ID pengguna sales
 * @param limit - Jumlah maksimal data closing (default 7)
 * @returns Daftar rencana closing terverifikasi
 */
export async function getSalesDealHistory(
  salesId: string,
  limit = 7
): Promise<ActionResult<SalesDealRecord[]>> {
  try {
    const deals = await prisma.planSPK.findMany({
      where: {
        salesId,
        spkStatus: "BERHASIL",
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        customerName: true,
        unitName: true,
        planDate: true,
      },
    });

    const serialized = deals.map((d) => ({
      id: d.id,
      customerName: d.customerName,
      unitName: d.unitName,
      planDate: d.planDate.toISOString(),
    }));

    return { success: true, data: serialized };
  } catch (error) {
    console.error("[getSalesDealHistory] Error:", error);
    return { success: false, error: "Gagal memuat riwayat closing berhasil." };
  }
}
