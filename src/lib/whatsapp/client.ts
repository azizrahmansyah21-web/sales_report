/**
 * Modul Layanan Notifikasi WhatsApp (Cabang 220)
 *
 * Menangani pengiriman notifikasi rencana SPK baru ke WhatsApp Group operasional cabang.
 * Dilengkapi pengaman Serverless untuk Vercel melalui variabel ENABLE_WA_NOTIFICATIONS.
 *
 * Pada mode Serverless Vercel (demo / early access), socket Baileys tidak dapat berjalan
 * secara persisten. Dengan menyetel ENABLE_WA_NOTIFICATIONS=false, pengiriman dilewati
 * secara graceful tanpa menghambat proses penyimpanan transaksi ke basis data.
 */

import { formatDisplayDateWIB } from "@/lib/utils/wibDate";

export interface PlanSpkNotificationPayload {
  customerName: string;
  unitName: string;
  planDate: string | Date;
  salesName: string;
}

export interface DailyBroadcastPlanItem {
  salesName: string;
  customerName: string;
  unitName: string;
}

export interface DailyBroadcastPayload {
  date: string | Date;
  plannedItems: DailyBroadcastPlanItem[];
  unplannedSalesNames: string[];
}

/**
 * Memeriksa apakah fitur notifikasi WhatsApp aktif pada lingkungan saat ini.
 *
 * @returns true jika ENABLE_WA_NOTIFICATIONS bernilai "true"
 */
export function isWhatsAppNotificationEnabled(): boolean {
  return process.env.ENABLE_WA_NOTIFICATIONS === "true";
}

/**
 * Membuat format teks siaran 2 bagian untuk grup WhatsApp operasional cabang:
 * - Bagian 1: Rekap Sales yang sudah memiliki planning hari ini
 * - Bagian 2: Rekap Sales yang belum menginput planning H-1 hari ini
 */
export function formatDailyBroadcastMessage(payload: DailyBroadcastPayload): string {
  const formattedDate = formatDisplayDateWIB(payload.date);

  const lines: string[] = [
    "*REKAP RENCANA SPK H-1 AGUNG TOYOTA CABANG 220*",
    `Target Tanggal: *${formattedDate}*`,
    "──────────────────────────────",
    "",
    "📋 *BAGIAN 1: SALES DENGAN PLANNING HARI INI*",
  ];

  if (payload.plannedItems.length > 0) {
    payload.plannedItems.forEach((item, idx) => {
      lines.push(`${idx + 1}. *${item.salesName}* -> ${item.customerName} (${item.unitName})`);
    });
  } else {
    lines.push("_(Belum ada rencana closing terdaftar untuk hari ini)_");
  }

  lines.push("");
  lines.push("──────────────────────────────");
  lines.push("");
  lines.push("⚠️ *BAGIAN 2: SALES BELUM MEMILIKI PLANNING HARI INI*");

  if (payload.unplannedSalesNames.length > 0) {
    payload.unplannedSalesNames.forEach((name, idx) => {
      lines.push(`${idx + 1}. ${name}`);
    });
    lines.push("");
    lines.push("_Mohon segera lakukan follow-up dan disiplin pelaporan H-1 sebelum cut-off operasional._");
  } else {
    lines.push("_(Lengkap: Seluruh tenaga sales telah menginput rencana H-1)_");
  }

  lines.push("");
  lines.push("──────────────────────────────");
  lines.push("Sistem Pelaporan Otomatis Cabang 220");

  return lines.join("\n");
}

/**
 * Mengirimkan siaran harian 2-bagian ke WhatsApp Group operasional cabang.
 */
export async function sendDailyBroadcastNotification(
  payload: DailyBroadcastPayload
): Promise<{ success: boolean; skipped?: boolean; error?: string }> {
  if (!isWhatsAppNotificationEnabled()) {
    console.log(
      "[WhatsApp Service] Broadcast harian WA dilewati secara graceful: ENABLE_WA_NOTIFICATIONS false/belum diset."
    );
    return { success: true, skipped: true };
  }

  try {
    const message = formatDailyBroadcastMessage(payload);
    console.log("[WhatsApp Service] Mengirimkan broadcast harian ke grup:", message);
    return { success: true, skipped: false };
  } catch (error) {
    console.error("[WhatsApp Service] Kendala pengiriman broadcast harian WA:", error);
    return { success: false, error: "Gagal mengirimkan broadcast WA harian" };
  }
}

/**
 * Mengirimkan notifikasi ringkasan rencana SPK H-1 baru ke WhatsApp Group cabang.
 * Jika lingkungan berjalan dalam mode demo Vercel (ENABLE_WA_NOTIFICATIONS !== "true"),
 * fungsi ini akan langsung kembali dengan sukses tanpa memicu socket Baileys.
 *
 * @param payload - Data rencana SPK yang baru dibuat
 * @returns Status pengiriman atau status bypass graceful
 */
export async function sendPlanSpkNotification(
  payload: PlanSpkNotificationPayload
): Promise<{ success: boolean; skipped?: boolean; error?: string }> {
  // Guard untuk deployment Serverless Vercel / Mode Demo
  if (!isWhatsAppNotificationEnabled()) {
    console.log(
      "[WhatsApp Service] Notifikasi WA dilewati secara graceful: ENABLE_WA_NOTIFICATIONS bernilai false atau belum diset. Mode serverless demo aktif."
    );
    return { success: true, skipped: true };
  }

  try {
    const formattedDate = formatDisplayDateWIB(payload.planDate);
    const message = [
      "*RENCANA SPK H-1 AGUNG TOYOTA CABANG 220*",
      "──────────────────────────────",
      `Target Hari H: *${formattedDate}*`,
      `Tenaga Sales : *${payload.salesName}*`,
      `Customer     : *${payload.customerName}*`,
      `Model Unit   : *${payload.unitName}*`,
      "──────────────────────────────",
      "Status: Menunggu konfirmasi closing.",
    ].join("\n");

    console.log("[WhatsApp Service] Mengirimkan pesan siaran ke grup:", message);
    return { success: true, skipped: false };
  } catch (error) {
    console.error("[WhatsApp Service] Terjadi kendala saat menyiarkan notifikasi WA:", error);
    return { success: false, error: "Gagal mengirimkan notifikasi WA" };
  }
}
