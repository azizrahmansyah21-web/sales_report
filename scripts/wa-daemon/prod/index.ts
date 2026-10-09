import { loadDaemonConfig } from "./env";
import { initWhatsAppClient, closeWhatsAppClient } from "./client";
import { checkAndRunMorningBroadcast } from "./cron-morning";
import { checkAndAlertLatePlans } from "./watch-late";

async function main(): Promise<void> {
  console.log("================================================================================");
  console.log("🚀 WHATSAPP BROADCAST DAEMON — AGUNG TOYOTA UJUNGBATU (CABANG 247)");
  console.log("================================================================================");

  const config = loadDaemonConfig();

  if (!config.whatsappTargetGroupId) {
    console.log("[Info] WHATSAPP_TARGET_GROUP_ID di .env belum diisi.");
    console.log("[Info] Setelah nomor kantor dimasukkan ke grup cabang, jalankan 'npm run wa:find-groups'.");
    console.log("[Info] Daemon akan berjalan dalam mode standby.\n");
  } else {
    console.log(`[Config] Target Group ID: ${config.whatsappTargetGroupId}\n`);
  }

  // Menginisialisasi koneksi WhatsApp Web Socket
  await initWhatsAppClient();

  // Menjalankan pengecekan pertama saat daemon aktif
  await checkAndRunMorningBroadcast();
  await checkAndAlertLatePlans();

  // Interval polling berkala setiap 30 detik
  const intervalId = setInterval(async () => {
    try {
      await checkAndRunMorningBroadcast();
      await checkAndAlertLatePlans();
    } catch (error) {
      console.error("[Daemon Poller] Error pada siklus pengecekan:", error);
    }
  }, 30000);

  // Penanganan graceful shutdown saat proses dihentikan
  const handleShutdown = async (signal: string) => {
    console.log(`\n[Daemon] Menerima sinyal ${signal}. Menutup layanan dengan aman...`);
    clearInterval(intervalId);
    await closeWhatsAppClient();
    process.exit(0);
  };

  process.on("SIGINT", () => handleShutdown("SIGINT"));
  process.on("SIGTERM", () => handleShutdown("SIGTERM"));
}

main().catch((err) => {
  console.error("[Daemon] Kegagalan fatal saat memulai daemon:", err);
  process.exit(1);
});
