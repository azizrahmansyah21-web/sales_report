/**
 * Server Actions untuk Modul 6: Management Prospect & Audit Trail Engine
 * Agung Toyota UjungBatu (Cabang 220)
 *
 * Mengelola parameter operasional cabang (jam cutoff, kebijakan unplanned),
 * mesin deteksi duplikat & pelacak frekuensi input ulang,
 * serta pencatatan audit trail historis perubahan data Plan SPK.
 */

"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export type ProspectEngineSettingsData = {
  cutoffHourWib: number;
  cutoffMinuteWib: number;
  enableInterSalesCheck: boolean;
  enableReInputTracking: boolean;
  enableNameNormalization: boolean;
  allowSalesUnplanned: boolean;
  updatedAt: string | null;
};

export type ProspectStatsData = {
  totalPlans: number;
  duplicateCount: number;
  unplannedCount: number;
  reInputCount: number; // Jumlah prospek yang diinput >= 2 kali
  totalAuditLogs: number;
};

export type PlanSpkAuditItem = {
  id: string;
  planSpkId: string;
  customerName: string;
  unitName: string;
  salesName: string;
  actorId: string | null;
  actorName: string;
  actorRole: string;
  actionType: string;
  previousValue: string | null;
  newValue: string | null;
  details: string | null;
  createdAt: string;
};

export type BatchRescanResult = {
  totalProcessed: number;
  duplicatesFound: number;
  flagsUpdated: number;
  executionTimeMs: number;
  timestamp: string;
};

export type ProspectEngineActionResult<T = void> =
  | { success: true; message: string; data?: T }
  | { success: false; error: string };

const DEFAULT_SETTINGS: ProspectEngineSettingsData = {
  cutoffHourWib: 17,
  cutoffMinuteWib: 0,
  enableInterSalesCheck: true,
  enableReInputTracking: true,
  enableNameNormalization: true,
  allowSalesUnplanned: false,
  updatedAt: null,
};

/**
 * Normalisasi nama pelanggan untuk mendeteksi variasi penulisan.
 * Menghapus tanda baca, spasi ganda, dan sapaan/gelar umum (Pak, Ibu, Haji, dr., dll.)
 */
function normalizeCustomerName(
  rawName: string,
  enableNormalization: boolean = true
): string {
  if (!rawName) return "";
  const trimmed = rawName.trim().toLowerCase();
  if (!enableNormalization) return trimmed;

  // 1. Bersihkan tanda baca dan simbol umum
  let cleaned = trimmed.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, " ");

  // 2. Bersihkan sapaan dan gelar di awal kata
  cleaned = cleaned.replace(
    /^(pak|bapak|bpk|ibu|ibuk|buk|haji|h\b|dr\b|dokter|ir\b|ny\b|tuan)\s+/i,
    ""
  );

  // 3. Gabungkan spasi ganda menjadi 1 spasi
  return cleaned.replace(/\s+/g, " ").trim();
}

/**
 * Mencatat riwayat perubahan (Audit Trail) Plan SPK secara aman.
 * Non-blocking: kegagalan pencatatan log audit tidak menggagalkan transaksi utama.
 */
export async function recordPlanSpkAuditLog(params: {
  planSpkId: string;
  actorId?: string | null;
  actorName: string;
  actorRole: string;
  actionType: "CREATE" | "STATUS_CHANGE" | "SPV_NOTE" | "ADMIN_NOTE" | "UNPLANNED";
  previousValue?: string | null;
  newValue?: string | null;
  details?: string | null;
}): Promise<void> {
  try {
    await prisma.planSpkHistory.create({
      data: {
        planSpkId: params.planSpkId,
        actorId: params.actorId || null,
        actorName: params.actorName,
        actorRole: params.actorRole,
        actionType: params.actionType,
        previousValue: params.previousValue || null,
        newValue: params.newValue || null,
        details: params.details || null,
      },
    });
  } catch (error) {
    // Graceful fallback jika tabel belum di-push
    console.warn("[recordPlanSpkAuditLog] Audit log bypassed (non-blocking):", error);
  }
}

/**
 * Mengambil konfigurasi aktif, telemetri statistik, dan riwayat audit trail terbaru.
 */
export async function getProspectEngineOverviewAction(): Promise<
  ProspectEngineActionResult<{
    settings: ProspectEngineSettingsData;
    stats: ProspectStatsData;
    recentAudits: PlanSpkAuditItem[];
  }>
> {
  try {
    const session = await auth();
    if (session?.user?.role !== "SUPERADMIN") {
      return { success: false, error: "Akses ditolak: Hanya Superadmin yang berwenang." };
    }

    // 1. Ambil pengaturan (dengan fallback jika tabel belum di-push)
    let currentSettings = DEFAULT_SETTINGS;
    try {
      const dbSetting = await prisma.prospectEngineSetting.findUnique({
        where: { id: "cabang_220" },
      });
      if (dbSetting) {
        currentSettings = {
          cutoffHourWib: dbSetting.cutoffHourWib,
          cutoffMinuteWib: dbSetting.cutoffMinuteWib,
          enableInterSalesCheck: dbSetting.enableInterSalesCheck,
          enableReInputTracking: dbSetting.enableReInputTracking,
          enableNameNormalization: dbSetting.enableNameNormalization,
          allowSalesUnplanned: dbSetting.allowSalesUnplanned,
          updatedAt: dbSetting.updatedAt.toISOString(),
        };
      }
    } catch {
      // Fallback default jika tabel belum ada
    }

    // 2. Ambil metrik statistik dari database
    const totalPlans = await prisma.planSPK.count();
    const duplicateCount = await prisma.planSPK.count({
      where: { isDuplicate: true },
    });
    const unplannedCount = await prisma.planSPK.count({
      where: { isUnplanned: true },
    });

    // Hitung nama pelanggan dengan frekuensi input >= 2
    let reInputCount = 0;
    try {
      const grouped = await prisma.planSPK.groupBy({
        by: ["customerName"],
        _count: { id: true },
        having: {
          id: { _count: { gt: 1 } },
        },
      });
      reInputCount = grouped.length;
    } catch {
      reInputCount = duplicateCount;
    }

    // 3. Ambil log riwayat audit terbaru
    let recentAudits: PlanSpkAuditItem[] = [];
    let totalAuditLogs = 0;
    try {
      totalAuditLogs = await prisma.planSpkHistory.count();
      const rawAudits = await prisma.planSpkHistory.findMany({
        take: 40,
        orderBy: { createdAt: "desc" },
        include: {
          planSpk: {
            select: {
              customerName: true,
              unitName: true,
              sales: {
                select: { name: true },
              },
            },
          },
        },
      });

      recentAudits = rawAudits.map((item) => ({
        id: item.id,
        planSpkId: item.planSpkId,
        customerName: item.planSpk?.customerName || "(Dihapus)",
        unitName: item.planSpk?.unitName || "-",
        salesName: item.planSpk?.sales?.name || "Sales Cabang 220",
        actorId: item.actorId,
        actorName: item.actorName,
        actorRole: item.actorRole,
        actionType: item.actionType,
        previousValue: item.previousValue,
        newValue: item.newValue,
        details: item.details,
        createdAt: item.createdAt.toISOString(),
      }));
    } catch {
      // Fallback jika belum ada tabel history
      recentAudits = [];
    }

    return {
      success: true,
      message: "Data engine prospek berhasil dimuat.",
      data: {
        settings: currentSettings,
        stats: {
          totalPlans,
          duplicateCount,
          unplannedCount,
          reInputCount,
          totalAuditLogs,
        },
        recentAudits,
      },
    };
  } catch (error) {
    console.error("[getProspectEngineOverviewAction] Error:", error);
    return { success: false, error: "Gagal memuat konfigurasi engine prospek." };
  }
}

/**
 * Menyimpan pembaruan konfigurasi parameter operasional Cabang 220.
 */
export async function saveProspectEngineSettingsAction(payload: {
  cutoffHourWib: number;
  cutoffMinuteWib: number;
  enableInterSalesCheck: boolean;
  enableReInputTracking: boolean;
  enableNameNormalization: boolean;
  allowSalesUnplanned: boolean;
}): Promise<ProspectEngineActionResult<ProspectEngineSettingsData>> {
  try {
    const session = await auth();
    if (session?.user?.role !== "SUPERADMIN") {
      return { success: false, error: "Akses ditolak: Hanya Superadmin yang berwenang." };
    }

    // Validasi nilai
    const hour = Math.max(0, Math.min(23, Number(payload.cutoffHourWib) || 17));
    const minute = Math.max(0, Math.min(59, Number(payload.cutoffMinuteWib) || 0));

    const updated = await prisma.prospectEngineSetting.upsert({
      where: { id: "cabang_220" },
      create: {
        id: "cabang_220",
        cutoffHourWib: hour,
        cutoffMinuteWib: minute,
        enableInterSalesCheck: payload.enableInterSalesCheck,
        enableReInputTracking: payload.enableReInputTracking,
        enableNameNormalization: payload.enableNameNormalization,
        allowSalesUnplanned: payload.allowSalesUnplanned,
      },
      update: {
        cutoffHourWib: hour,
        cutoffMinuteWib: minute,
        enableInterSalesCheck: payload.enableInterSalesCheck,
        enableReInputTracking: payload.enableReInputTracking,
        enableNameNormalization: payload.enableNameNormalization,
        allowSalesUnplanned: payload.allowSalesUnplanned,
      },
    });

    revalidatePath("/admin/settings");
    revalidatePath("/input");
    revalidatePath("/admin/prospects");

    return {
      success: true,
      message: "Konfigurasi operasional Cabang 220 berhasil diperbarui.",
      data: {
        cutoffHourWib: updated.cutoffHourWib,
        cutoffMinuteWib: updated.cutoffMinuteWib,
        enableInterSalesCheck: updated.enableInterSalesCheck,
        enableReInputTracking: updated.enableReInputTracking,
        enableNameNormalization: updated.enableNameNormalization,
        allowSalesUnplanned: updated.allowSalesUnplanned,
        updatedAt: updated.updatedAt.toISOString(),
      },
    };
  } catch (error) {
    console.error("[saveProspectEngineSettingsAction] Error:", error);
    return { success: false, error: "Gagal menyimpan konfigurasi operasional cabang." };
  }
}

/**
 * Mesin Pindai Ulang Duplikat Massal (Batch Re-scan Engine).
 * Menelusuri seluruh data prospek kronologis dan menyinkronkan flag isDuplicate.
 */
export async function batchRescanDuplicatesAction(): Promise<
  ProspectEngineActionResult<BatchRescanResult>
> {
  const startTime = Date.now();
  try {
    const session = await auth();
    if (session?.user?.role !== "SUPERADMIN") {
      return { success: false, error: "Akses ditolak: Hanya Superadmin yang berwenang." };
    }

    // 1. Ambil pengaturan aktif
    let interSales = true;
    let normalize = true;
    try {
      const setting = await prisma.prospectEngineSetting.findUnique({
        where: { id: "cabang_220" },
      });
      if (setting) {
        interSales = setting.enableInterSalesCheck;
        normalize = setting.enableNameNormalization;
      }
    } catch {
      // gunakan nilai default
    }

    // 2. Ambil seluruh data plan_spk terurut kronologis
    const allPlans = await prisma.planSPK.findMany({
      orderBy: [{ planDate: "asc" }, { createdAt: "asc" }],
      select: {
        id: true,
        salesId: true,
        customerName: true,
        isDuplicate: true,
      },
    });

    const seenMap = new Map<string, Array<{ id: string; salesId: string }>>();
    const updates: Array<{ id: string; isDuplicate: boolean }> = [];
    let duplicatesFound = 0;

    for (const plan of allPlans) {
      const normKey = normalizeCustomerName(plan.customerName, normalize);
      const existing = seenMap.get(normKey);

      let isDupe = false;
      if (existing && existing.length > 0) {
        if (interSales) {
          // Duplikat jika ada record sebelumnya dari sales mana pun di cabang 220
          isDupe = true;
        } else {
          // Duplikat hanya jika diajukan oleh sales yang sama
          isDupe = existing.some((item) => item.salesId === plan.salesId);
        }
      }

      if (isDupe) {
        duplicatesFound++;
      }

      // Jika flag di database berbeda dengan hasil evaluasi, catat untuk update
      if (plan.isDuplicate !== isDupe) {
        updates.push({ id: plan.id, isDuplicate: isDupe });
      }

      // Catat ke daftar yang sudah pernah terlihat
      if (!existing) {
        seenMap.set(normKey, [{ id: plan.id, salesId: plan.salesId }]);
      } else {
        existing.push({ id: plan.id, salesId: plan.salesId });
      }
    }

    // 3. Jalankan pembaruan massal secara chunk jika ada perubahan
    if (updates.length > 0) {
      const chunkSize = 50;
      for (let i = 0; i < updates.length; i += chunkSize) {
        const chunk = updates.slice(i, i + chunkSize);
        await prisma.$transaction(
          chunk.map((item) =>
            prisma.planSPK.update({
              where: { id: item.id },
              data: { isDuplicate: item.isDuplicate },
            })
          )
        );
      }
    }

    const executionTimeMs = Date.now() - startTime;

    // Catat ke log riwayat audit
    await recordPlanSpkAuditLog({
      planSpkId: allPlans[0]?.id || "system",
      actorId: session.user.id,
      actorName: session.user.name || "SUPERADMIN",
      actorRole: "SUPERADMIN",
      actionType: "STATUS_CHANGE",
      details: `Batch Re-scan Duplikat selesai: ${allPlans.length} data dipindai, ${duplicatesFound} duplikat terdeteksi, ${updates.length} flag diperbarui (${executionTimeMs}ms).`,
    });

    revalidatePath("/admin/settings");
    revalidatePath("/admin/prospects");

    return {
      success: true,
      message: `Pindai ulang selesai: ${allPlans.length} prospek dipindai, ${duplicatesFound} duplikat ditemukan, ${updates.length} baris diperbarui.`,
      data: {
        totalProcessed: allPlans.length,
        duplicatesFound,
        flagsUpdated: updates.length,
        executionTimeMs,
        timestamp: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error("[batchRescanDuplicatesAction] Error:", error);
    return { success: false, error: "Gagal menjalankan pemindaian ulang duplikat." };
  }
}

