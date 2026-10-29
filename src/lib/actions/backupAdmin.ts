/**
 * Server Actions untuk Modul 4: Pengaturan Backup Database (Pusat Kendali Superadmin)
 * Agung Toyota UjungBatu (Cabang 220)
 *
 * Mengelola pembuatan snapshot in-memory, kompresi Gzip (.sql.gz),
 * pengaliran unduhan data, serta pencatatan audit log riwayat backup.
 */

"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import zlib from "zlib";

export type BackupScope = "FULL" | "TRANSACTIONS_ONLY";

export type BackupLogItem = {
  id: string;
  fileName: string;
  fileSizeBytes: number;
  formattedSize: string;
  recordsCount: number;
  scope: string;
  createdBy: string | null;
  createdAt: string;
};

export type BackupOverviewData = {
  stats: {
    totalRecords: number;
    totalProspects: number;
    totalUsers: number;
    totalWaMessages: number;
    totalBackupsCreated: number;
    lastBackupAt: string | null;
    estimatedDumpSize: string;
  };
  recentLogs: BackupLogItem[];
};

export type BackupActionResult<T = void> =
  | { success: true; message: string; data?: T }
  | { success: false; error: string };

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function escapeSqlValue(value: unknown): string {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (value instanceof Date) return `'${value.toISOString()}'`;
  return `'${String(value).replace(/'/g, "''")}'`;
}

/**
 * Mengambil ringkasan data backup, estimasi ukuran, dan 10 riwayat snapshot terakhir.
 */
export async function getBackupOverviewAction(): Promise<
  BackupActionResult<BackupOverviewData>
> {
  try {
    const session = await auth();
    if (session?.user?.role !== "SUPERADMIN") {
      return { success: false, error: "Akses ditolak: Hanya Superadmin yang berwenang." };
    }

    const [totalProspects, totalUsers, totalWaMessages, totalLogs, lastLog, logs] =
      await Promise.all([
        prisma.planSPK.count(),
        prisma.user.count(),
        prisma.whatsAppMessage.count(),
        prisma.databaseBackupLog.count(),
        prisma.databaseBackupLog.findFirst({
          orderBy: { createdAt: "desc" },
          select: { createdAt: true },
        }),
        prisma.databaseBackupLog.findMany({
          orderBy: { createdAt: "desc" },
          take: 10,
        }),
      ]);

    const totalRecords = totalProspects + totalUsers + totalWaMessages;
    // Estimasi kasar: ~250 bytes per baris terkompresi
    const estimatedCompressedBytes = Math.max(1024, totalRecords * 250);

    const formattedLogs: BackupLogItem[] = logs.map((l) => ({
      id: l.id,
      fileName: l.fileName,
      fileSizeBytes: l.fileSizeBytes,
      formattedSize: formatBytes(l.fileSizeBytes),
      recordsCount: l.recordsCount,
      scope: l.scope === "FULL" ? "Seluruh Database" : "Transaksi Prospek Saja",
      createdBy: l.createdBy,
      createdAt: l.createdAt.toISOString().replace("T", " ").substring(0, 19) + " WIB",
    }));

    return {
      success: true,
      message: "Data telemetri backup berhasil dimuat.",
      data: {
        stats: {
          totalRecords,
          totalProspects,
          totalUsers,
          totalWaMessages,
          totalBackupsCreated: totalLogs,
          lastBackupAt: lastLog?.createdAt
            ? lastLog.createdAt.toISOString().replace("T", " ").substring(0, 19) + " WIB"
            : null,
          estimatedDumpSize: formatBytes(estimatedCompressedBytes),
        },
        recentLogs: formattedLogs,
      },
    };
  } catch (error) {
    console.error("[getBackupOverviewAction] Error:", error);
    return { success: false, error: "Gagal memuat status backup database." };
  }
}

/**
 * Menghasilkan SQL dump terstruktur, mengompresi dengan Gzip (.sql.gz),
 * dan mencatat riwayat snapshot ke database.
 */
export async function generateDatabaseBackupAction(params: {
  scope: BackupScope;
}): Promise<
  BackupActionResult<{
    base64Content: string;
    fileName: string;
    fileSizeBytes: number;
    formattedSize: string;
    recordsCount: number;
  }>
> {
  try {
    const session = await auth();
    if (session?.user?.role !== "SUPERADMIN") {
      return { success: false, error: "Akses ditolak: Hanya Superadmin yang berwenang." };
    }

    const { scope } = params;
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const dateStr = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
    const timeStr = `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    const fileName = `backup_toyota220_${scope.toLowerCase()}_${dateStr}_${timeStr}.sql.gz`;

    let sqlDump = `-- ====================================================================\n`;
    sqlDump += `-- AGUNG TOYOTA UJUNGBATU (CABANG 220) — DATABASE SNAPSHOT DUMP\n`;
    sqlDump += `-- Diekspor oleh: ${session.user.name || "Superadmin"} (Username: ${session.user.username || "-"})\n`;
    sqlDump += `-- Waktu Ekspor: ${now.toISOString()}\n`;
    sqlDump += `-- Cakupan Data: ${scope}\n`;
    sqlDump += `-- ====================================================================\n\n`;
    sqlDump += `SET statement_timeout = 0;\n`;
    sqlDump += `SET client_encoding = 'UTF8';\n`;
    sqlDump += `SET standard_conforming_strings = on;\n\n`;

    let totalRecordsCount = 0;

    // 1. Ekspor Tabel Users (jika scope FULL)
    if (scope === "FULL") {
      const users = await prisma.user.findMany({
        orderBy: { createdAt: "asc" },
      });
      totalRecordsCount += users.length;

      sqlDump += `-- --------------------------------------------------------------------\n`;
      sqlDump += `-- Tabel: users (${users.length} baris)\n`;
      sqlDump += `-- --------------------------------------------------------------------\n`;
      for (const u of users) {
        sqlDump += `INSERT INTO users (id, name, nip, username, email, password, role, title, phone, is_active, created_at, updated_at) VALUES (`;
        sqlDump += `${escapeSqlValue(u.id)}, `;
        sqlDump += `${escapeSqlValue(u.name)}, `;
        sqlDump += `${escapeSqlValue(u.nip)}, `;
        sqlDump += `${escapeSqlValue(u.username)}, `;
        sqlDump += `${escapeSqlValue(u.email)}, `;
        sqlDump += `${escapeSqlValue(u.password)}, `;
        sqlDump += `${escapeSqlValue(u.role)}, `;
        sqlDump += `${escapeSqlValue(u.title)}, `;
        sqlDump += `${escapeSqlValue(u.phone)}, `;
        sqlDump += `${escapeSqlValue(u.isActive)}, `;
        sqlDump += `${escapeSqlValue(u.createdAt)}, `;
        sqlDump += `${escapeSqlValue(u.updatedAt)}`;
        sqlDump += `) ON CONFLICT (id) DO NOTHING;\n`;
      }
      sqlDump += `\n`;
    }

    // 2. Ekspor Tabel Plan SPK (Prospek)
    const prospects = await prisma.planSPK.findMany({
      orderBy: { createdAt: "asc" },
    });
    totalRecordsCount += prospects.length;

    sqlDump += `-- --------------------------------------------------------------------\n`;
    sqlDump += `-- Tabel: plan_spk (${prospects.length} baris)\n`;
    sqlDump += `-- --------------------------------------------------------------------\n`;
    for (const p of prospects) {
      sqlDump += `INSERT INTO plan_spk (id, sales_id, customer_name, unit_name, plan_date, spk_status, keterangan, keterangan_spv, keterangan_admin, is_duplicate, is_repeat_failed, is_unplanned, created_at, updated_at) VALUES (`;
      sqlDump += `${escapeSqlValue(p.id)}, `;
      sqlDump += `${escapeSqlValue(p.salesId)}, `;
      sqlDump += `${escapeSqlValue(p.customerName)}, `;
      sqlDump += `${escapeSqlValue(p.unitName)}, `;
      sqlDump += `${escapeSqlValue(p.planDate)}, `;
      sqlDump += `${escapeSqlValue(p.spkStatus)}, `;
      sqlDump += `${escapeSqlValue(p.keterangan)}, `;
      sqlDump += `${escapeSqlValue(p.keteranganSpv)}, `;
      sqlDump += `${escapeSqlValue(p.keteranganAdmin)}, `;
      sqlDump += `${escapeSqlValue(p.isDuplicate)}, `;
      sqlDump += `${escapeSqlValue(p.isRepeatFailed)}, `;
      sqlDump += `${escapeSqlValue(p.isUnplanned)}, `;
      sqlDump += `${escapeSqlValue(p.createdAt)}, `;
      sqlDump += `${escapeSqlValue(p.updatedAt)}`;
      sqlDump += `) ON CONFLICT (id) DO NOTHING;\n`;
    }
    sqlDump += `\n`;

    // 3. Ekspor Tabel WhatsApp Messages & Settings (jika scope FULL)
    if (scope === "FULL") {
      const waSettings = await prisma.whatsAppSetting.findMany();
      if (waSettings.length > 0) {
        sqlDump += `-- --------------------------------------------------------------------\n`;
        sqlDump += `-- Tabel: whatsapp_settings (${waSettings.length} baris)\n`;
        sqlDump += `-- --------------------------------------------------------------------\n`;
        for (const ws of waSettings) {
          sqlDump += `INSERT INTO whatsapp_settings (id, target_group_id, target_group_name, is_morning_blast_active, morning_blast_time, is_evening_blast_active, evening_blast_time, send_report_to_bm, send_report_to_adh, updated_at) VALUES (`;
          sqlDump += `${escapeSqlValue(ws.id)}, `;
          sqlDump += `${escapeSqlValue(ws.targetGroupId)}, `;
          sqlDump += `${escapeSqlValue(ws.targetGroupName)}, `;
          sqlDump += `${escapeSqlValue(ws.isMorningBlastActive)}, `;
          sqlDump += `${escapeSqlValue(ws.morningBlastTime)}, `;
          sqlDump += `${escapeSqlValue(ws.isEveningBlastActive)}, `;
          sqlDump += `${escapeSqlValue(ws.eveningBlastTime)}, `;
          sqlDump += `${escapeSqlValue(ws.sendReportToBm)}, `;
          sqlDump += `${escapeSqlValue(ws.sendReportToAdh)}, `;
          sqlDump += `${escapeSqlValue(ws.updatedAt)}`;
          sqlDump += `) ON CONFLICT (id) DO NOTHING;\n`;
        }
        sqlDump += `\n`;
      }

      const waMessages = await prisma.whatsAppMessage.findMany({
        orderBy: { createdAt: "asc" },
      });
      totalRecordsCount += waMessages.length;

      sqlDump += `-- --------------------------------------------------------------------\n`;
      sqlDump += `-- Tabel: whatsapp_messages (${waMessages.length} baris)\n`;
      sqlDump += `-- --------------------------------------------------------------------\n`;
      for (const wm of waMessages) {
        sqlDump += `INSERT INTO whatsapp_messages (id, message_type, target_jid, target_name, content, has_document, document_name, status, error_message, sent_at, created_by, created_at) VALUES (`;
        sqlDump += `${escapeSqlValue(wm.id)}, `;
        sqlDump += `${escapeSqlValue(wm.messageType)}, `;
        sqlDump += `${escapeSqlValue(wm.targetJid)}, `;
        sqlDump += `${escapeSqlValue(wm.targetName)}, `;
        sqlDump += `${escapeSqlValue(wm.content)}, `;
        sqlDump += `${escapeSqlValue(wm.hasDocument)}, `;
        sqlDump += `${escapeSqlValue(wm.documentName)}, `;
        sqlDump += `${escapeSqlValue(wm.status)}, `;
        sqlDump += `${escapeSqlValue(wm.errorMessage)}, `;
        sqlDump += `${escapeSqlValue(wm.sentAt)}, `;
        sqlDump += `${escapeSqlValue(wm.createdBy)}, `;
        sqlDump += `${escapeSqlValue(wm.createdAt)}`;
        sqlDump += `) ON CONFLICT (id) DO NOTHING;\n`;
      }
      sqlDump += `\n`;
    }

    // Kompresi buffer dengan Gzip (.sql.gz)
    const uncompressedBuffer = Buffer.from(sqlDump, "utf-8");
    const compressedBuffer = zlib.gzipSync(uncompressedBuffer, { level: 9 });
    const fileSizeBytes = compressedBuffer.length;
    const base64Content = compressedBuffer.toString("base64");

    // Catat ke log riwayat backup
    await prisma.databaseBackupLog.create({
      data: {
        fileName,
        fileSizeBytes,
        recordsCount: totalRecordsCount,
        scope,
        createdBy: session.user.name || "SUPERADMIN",
      },
    });

    revalidatePath("/admin/settings");

    return {
      success: true,
      message: `Snapshot database "${fileName}" (${formatBytes(fileSizeBytes)}) berhasil dibuat.`,
      data: {
        base64Content,
        fileName,
        fileSizeBytes,
        formattedSize: formatBytes(fileSizeBytes),
        recordsCount: totalRecordsCount,
      },
    };
  } catch (error) {
    console.error("[generateDatabaseBackupAction] Error:", error);
    return { success: false, error: "Gagal membuat snapshot backup database." };
  }
}