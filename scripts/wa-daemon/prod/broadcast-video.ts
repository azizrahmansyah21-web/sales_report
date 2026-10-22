import fs from "fs";
import path from "path";
import { loadDaemonConfig } from "./env";
import {
  initWhatsAppClient,
  closeWhatsAppClient,
  isWhatsAppReady,
  getWhatsAppSocket,
} from "./client";

// Filter pesan internal Signal ratchet agar terminal tetap rapi dan bersih
const originalConsoleLog = console.log;
console.log = (...args: unknown[]) => {
  if (typeof args[0] === "string" && args[0].startsWith("Closing session:")) {
    return;
  }
  originalConsoleLog(...args);
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main(): Promise<void> {
  console.log("================================================================================");
  console.log("🎬 PENGIRIMAN VIDEO TUTORIAL & SOSIALISASI PWA SPK H-1 KE GRUP WHATSAPP");
  console.log("   Agung Toyota UjungBatu (Cabang Resmi 220)");
  console.log("================================================================================");

  const config = loadDaemonConfig();
  console.log(`[Config] Target Group ID : ${config.whatsappTargetGroupId}`);

  if (!config.whatsappTargetGroupId) {
    console.error("❌ Gagal: WHATSAPP_TARGET_GROUP_ID di .env belum disetel.");
    process.exit(1);
  }

  // Pencarian berkas video target (kompatibel Server Linux & Windows Laptop)
  const candidatePaths = [
    path.resolve(process.cwd(), "tutorial.mp4"),
    path.resolve("/var/www/apps/sales-report/tutorial.mp4"),
    path.resolve(process.cwd(), "../WhatsApp Video 2026-10-23 at 02.27.41.mp4"),
    path.resolve("D:/Magang/Sales_Report/WhatsApp Video 2026-10-23 at 02.27.41.mp4"),
  ];

  let videoPath = "";
  for (const p of candidatePaths) {
    if (fs.existsSync(p)) {
      videoPath = p;
      break;
    }
  }

  if (!videoPath) {
    console.error("❌ Berkas video tidak ditemukan. Pastikan file 'tutorial.mp4' ada di folder kerja.");
    console.error("   Lokasi yang diperiksa:\n" + candidatePaths.map((c) => `   - ${c}`).join("\n"));
    process.exit(1);
  }

  const stat = fs.statSync(videoPath);
  const sizeMb = (stat.size / (1024 * 1024)).toFixed(2);
  console.log(`[Video] Ditemukan: ${path.basename(videoPath)} (${sizeMb} MB)`);

  console.log("\n[Baileys] Menghubungkan ke socket WhatsApp...");
  await initWhatsAppClient();

  // Menunggu socket siap terhubung (maksimal 35 detik)
  let waited = 0;
  while (!isWhatsAppReady() && waited < 35) {
    await sleep(1000);
    waited++;
    if (waited % 5 === 0 && !isWhatsAppReady()) {
      console.log(`[Menunggu koneksi WhatsApp... ${waited} detik]`);
    }
  }

  if (!isWhatsAppReady()) {
    console.error("❌ Koneksi WhatsApp belum siap setelah 35 detik. Pastikan nomor kantor aktif.");
    await closeWhatsAppClient();
    process.exit(1);
  }

  const sock = getWhatsAppSocket();
  if (!sock) {
    console.error("❌ Socket WhatsApp tidak tersedia.");
    await closeWhatsAppClient();
    process.exit(1);
  }

  // Teks resmi sosialisasi cabang 220
  const caption =
    `🚗 *AGUNG TOYOTA UJUNGBATU (CABANG 220)*\n` +
    `📹 *VIDEO PANDUAN PENGGUNAAN APLIKASI WEB PLAN SPK H-1*\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `Halo rekan-rekan Sales & Manajemen Agung Toyota UjungBatu! 👋\n\n` +
    `Berikut adalah video panduan pengisian laporan rencana prospek SPK melalui aplikasi web resmi cabang:\n\n` +
    `📱 *Poin Penting untuk Sales:*\n` +
    `1. Input rencana SPK H-1 ditutup setiap pukul 16:00 WIB.\n` +
    `2. Mendukung mode offline (tetap bisa isi saat sinyal lemah/pameran).\n` +
    `3. Rekapitulasi target harian disiarkan otomatis ke grup ini setiap pukul 08:00 WIB.\n\n` +
    `🌐 *Tautan Aplikasi:* https://planspk.com\n\n` +
    `Mari bersama tingkatkan pencapaian SPK cabang kita. Semangat closing! 💪\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `_Sistem Pelaporan SPK H-1 Cabang 220_`;

  console.log("\n[Baileys] Membaca buffer video...");
  const videoBuffer = fs.readFileSync(videoPath);

  try {
    console.log("[Baileys] Mengatur presence status 'recording' (2 detik)...");
    await sock.sendPresenceUpdate("recording", config.whatsappTargetGroupId);
    await sleep(2000);

    console.log(`[Baileys] Mengirim video (${sizeMb} MB) ke grup kantor...`);
    const sentMessage = await sock.sendMessage(config.whatsappTargetGroupId, {
      video: videoBuffer,
      mimetype: "video/mp4",
      caption: caption,
    });

    console.log("\n================================================================================");
    console.log("🎉 BERHASIL! Video tutorial telah terkirim ke grup WhatsApp.");
    console.log(`🆔 ID Pesan : ${sentMessage?.key?.id ?? "Terkirim"}`);
    console.log(`👥 Target   : ${config.whatsappTargetGroupId}`);
    console.log("================================================================================");

    // Jeda 5 detik agar ack socket tuntas sebelum koneksi ditutup
    await sleep(5000);
  } catch (error) {
    console.error("❌ Terjadi kesalahan saat mengirim video:", error);
  } finally {
    console.log("[Baileys] Menutup koneksi socket dengan aman...");
    await closeWhatsAppClient();
    process.exit(0);
  }
}

main().catch((err) => {
  console.error("❌ Fatal error:", err);
  process.exit(1);
});
