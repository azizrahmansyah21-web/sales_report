import { loadDaemonConfig } from "./env";
import {
  initWhatsAppClient,
  sendGroupMessage,
  closeWhatsAppClient,
  isWhatsAppReady,
} from "./client";
import { formatIndonesianDate, formatWibTime } from "./message-formatter";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runTestSend(): Promise<void> {
  console.log("================================================================================");
  console.log("🧪 UJI COBA PENGIRIMAN PESAN WHATSAPP KE GRUP TARGET CABANG 247");
  console.log("================================================================================");

  const config = loadDaemonConfig();
  console.log(`Target Group ID: ${config.whatsappTargetGroupId}\n`);

  if (!config.whatsappTargetGroupId) {
    console.error("Gagal: WHATSAPP_TARGET_GROUP_ID di .env belum diisi.");
    process.exit(1);
  }

  console.log("Menginisialisasi koneksi socket WhatsApp...");
  await initWhatsAppClient();

  // Menunggu socket siap terhubung (maksimal 30 detik)
  let waited = 0;
  while (!isWhatsAppReady() && waited < 30) {
    await sleep(1000);
    waited++;
    if (waited % 5 === 0 && !isWhatsAppReady()) {
      console.log(`[Menunggu koneksi Baileys... ${waited} detik]`);
    }
  }

  if (!isWhatsAppReady()) {
    console.error("Koneksi WhatsApp belum siap setelah 30 detik. Pastikan nomor kantor aktif dan sesi valid.");
    await closeWhatsAppClient();
    process.exit(1);
  }

  const now = new Date();
  const dateStr = formatIndonesianDate(now);
  const timeStr = formatWibTime(now);

  const testMessage =
    `🚗 *AGUNG TOYOTA UJUNGBATU (CABANG 247)*\n` +
    `🔔 *UJI COBA SISTEM AUTOMASI WHATSAPP*\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `Halo rekan-rekan! Ini adalah pesan uji coba koneksi otomatis dari *Sistem Pelaporan Plan SPK H-1*.\n\n` +
    `✅ *Status Koneksi:* Terhubung Aktif\n` +
    `📅 *Waktu Uji Coba:* ${dateStr} - ${timeStr} WIB\n\n` +
    `Sistem siap beroperasi untuk penyiaran rekapitulasi harian pukul 08:00 WIB dan notifikasi rencana susulan.\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `_Sistem Plan SPK H-1 Otomatis_`;

  console.log("Mensimulasikan status 'sedang mengetik' dan mengirim pesan ke grup...");
  const success = await sendGroupMessage(testMessage);

  if (success) {
    console.log("\n================================================================================");
    console.log("🎉 BERHASIL! Pesan uji coba telah berhasil terkirim ke grup WhatsApp.");
    console.log("Silakan periksa grup WhatsApp cabang di HP Anda.");
    console.log("================================================================================\n");
  } else {
    console.error("\n❌ Gagal mengirim pesan ke grup target.");
  }

  await closeWhatsAppClient();
  setTimeout(() => {
    process.exit(0);
  }, 1000);
}

runTestSend().catch((err: unknown) => {
  console.error("Terjadi kesalahan:", err);
  process.exit(1);
});
