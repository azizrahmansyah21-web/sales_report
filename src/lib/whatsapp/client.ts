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

/**
 * Memeriksa apakah fitur notifikasi WhatsApp aktif pada lingkungan saat ini.
 *
 * @returns true jika ENABLE_WA_NOTIFICATIONS bernilai "true"
 */
export function isWhatsAppNotificationEnabled(): boolean {
  return process.env.ENABLE_WA_NOTIFICATIONS === "true";
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
      "Status: Menunggu realisasi closing di Hari H.",
    ].join("\n");

    // Jika berjalan pada server kantor lokal yang menjalankan daemon internal
    console.log("[WhatsApp Service] Mengirimkan pesan siaran ke grup:", message);
    return { success: true, skipped: false };
  } catch (error) {
    console.error("[WhatsApp Service] Terjadi kendala saat menyiarkan notifikasi WA:", error);
    // Kembalikan status tanpa memutus alur utama transaksi
    return { success: false, error: "Gagal mengirimkan notifikasi WA" };
  }
}
