import { PrismaClient } from "@prisma/client";
import { loadDaemonConfig } from "./env";
import {
  initWhatsAppClient,
  closeWhatsAppClient,
  isWhatsAppReady,
  getWhatsAppSocket,
  sendGroupMessageWithResult,
} from "./client";
import { formatIndonesianDate, formatWibTime } from "./message-formatter";

// Filter pesan internal Signal ratchet agar terminal tetap rapi dan tidak bising
const originalConsoleLog = console.log;
console.log = (...args: unknown[]) => {
  if (typeof args[0] === "string" && args[0].startsWith("Closing session:")) {
    return;
  }
  originalConsoleLog(...args);
};

const prisma = new PrismaClient();

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Menormalisasi nomor telepon untuk pencocokan ke database salesmen
function normalizePhoneNumber(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("62")) {
    return "0" + digits.slice(2);
  }
  return digits;
}

async function runTestSend(): Promise<void> {
  console.log("================================================================================");
  console.log("🧪 UJI COBA PESAN WHATSAPP & PELACAK TANDA TERIMA (READ RECEIPT TRACKER)");
  console.log("   Agung Toyota UjungBatu (Cabang Resmi 247)");
  console.log("================================================================================");

  const config = loadDaemonConfig();
  console.log(`Target Group ID: ${config.whatsappTargetGroupId}\n`);

  if (!config.whatsappTargetGroupId) {
    console.error("Gagal: WHATSAPP_TARGET_GROUP_ID di .env belum diisi.");
    process.exit(1);
  }

  // Muat peta nama salesman dari database agar nomor HP bisa dikenali dengan nama
  const phoneToNameMap = new Map<string, string>();
  try {
    const users = await prisma.user.findMany({
      select: { name: true, phone: true },
    });
    for (const u of users) {
      if (u.phone) {
        phoneToNameMap.set(normalizePhoneNumber(u.phone), u.name);
      }
    }
  } catch {
    // Database offline fallback
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
    console.error("Koneksi WhatsApp belum siap setelah 30 detik. Pastikan nomor kantor aktif.");
    await closeWhatsAppClient();
    process.exit(1);
  }

  const sock = getWhatsAppSocket();
  if (!sock) {
    console.error("Socket WhatsApp tidak tersedia.");
    await closeWhatsAppClient();
    process.exit(1);
  }

  const now = new Date();
  const dateStr = formatIndonesianDate(now);
  const timeStr = formatWibTime(now);

  const testMessage =
    `🚗 *AGUNG TOYOTA UJUNGBATU (CABANG 220)*\n` +
    `🔔 *UJI COBA SISTEM AUTOMASI WHATSAPP*\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `Halo rekan-rekan! Ini adalah pesan uji coba koneksi otomatis dari *Plan SPK H-1*.\n\n` +
    `✅ *Status Koneksi:* Terhubung Aktif\n` +
    `📅 *Waktu Uji Coba:* ${dateStr} - ${timeStr} WIB\n\n` +
    `Sistem siap beroperasi untuk penyiaran rekapitulasi harian pukul 08:00 WIB dan notifikasi rencana susulan.\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `_Plan SPK H-1 Otomatis_`;

  console.log("\nMensimulasikan status 'sedang mengetik' dan mengirim pesan ke grup...");
  const result = await sendGroupMessageWithResult(testMessage);

  if (!result.success || !result.messageId) {
    console.error("\n❌ Gagal mengirim pesan ke grup target.");
    await closeWhatsAppClient();
    process.exit(1);
  }

  const sentId = result.messageId;
  console.log("\n================================================================================");
  console.log("🎉 BERHASIL! Pesan uji coba telah dikirim ke grup WhatsApp.");
  console.log(`🆔 ID Pesan: ${sentId}`);
  console.log(`⏰ Waktu Kirim: ${timeStr} WIB`);
  console.log("================================================================================");
  console.log("📡 TRACKER AKTIF: Memantau siapa saja anggota grup yang menerima & membaca...");
  console.log("   (Akan berjalan selama 60 detik. Anda bisa tekan Ctrl+C untuk selesai lebih awal)\n");

  const readMembers = new Set<string>();
  const deliveredMembers = new Set<string>();

  function resolveMemberName(jid: string): string {
    const rawNum = jid.split("@")[0].split(":")[0];
    const norm = normalizePhoneNumber(rawNum);
    const staffName = phoneToNameMap.get(norm);
    if (staffName) {
      return `*${staffName}* (+${rawNum})`;
    }
    return `+${rawNum}`;
  }

  // Pasang pendengar penerimaan tanda terima (Receipt Listener)
  sock.ev.on("message-receipt.update", (receipts) => {
    for (const r of receipts) {
      if (r.key.id !== sentId) continue;

      const userJid = r.receipt?.userJid || r.key?.participant;
      if (!userJid) continue;

      const memberLabel = resolveMemberName(userJid);
      const eventTime = formatWibTime(new Date());

      // Jika pesan sudah dibaca
      if (r.receipt?.readTimestamp && !readMembers.has(userJid)) {
        readMembers.add(userJid);
        deliveredMembers.add(userJid);
        console.log(`\n👁️  [${eventTime} WIB] DIBACA oleh: ${memberLabel}`);
      }
      // Jika pesan baru diterima di HP anggota
      else if (r.receipt?.receiptTimestamp && !deliveredMembers.has(userJid)) {
        deliveredMembers.add(userJid);
        console.log(`\n📩 [${eventTime} WIB] DITERIMA oleh: ${memberLabel}`);
      }
    }
  });

  // Tangani interupsi manual (Ctrl+C)
  let isShuttingDown = false;
  const handleExit = async () => {
    if (isShuttingDown) return;
    isShuttingDown = true;
    console.log("\n\n--------------------------------------------------------------------------------");
    console.log("📊 REKAPITULASI PELACAKAN PESAN:");
    console.log(`   • Total Sudah Membaca (Read)     : ${readMembers.size} anggota`);
    console.log(`   • Total Sudah Menerima (Delivered): ${deliveredMembers.size} anggota`);
    console.log("--------------------------------------------------------------------------------");
    console.log("Menutup koneksi socket secara aman...");
    await closeWhatsAppClient();
    await prisma.$disconnect();
    process.exit(0);
  };

  process.on("SIGINT", () => {
    handleExit().catch(() => process.exit(0));
  });

  // Hitung mundur pemantauan selama 60 detik
  for (let i = 60; i > 0; i--) {
    if (isShuttingDown) break;
    process.stdout.write(
      `\r⏳ Memantau respons grup: ${i} detik tersisa | Dibaca: ${readMembers.size} | Diterima: ${deliveredMembers.size} `
    );
    await sleep(1000);
  }

  await handleExit();
}

runTestSend().catch((err: unknown) => {
  console.error("Terjadi kesalahan:", err);
  process.exit(1);
});
