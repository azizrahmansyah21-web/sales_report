import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
} from "@whiskeysockets/baileys";
import pino from "pino";
import path from "path";
import fs from "fs";

const AUTH_DIR = path.resolve(process.cwd(), "auth_info_baileys");
const CREDS_FILE = path.join(AUTH_DIR, "creds.json");

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function findWhatsAppGroups(): Promise<void> {
  if (!fs.existsSync(CREDS_FILE)) {
    console.error("Kredensial WhatsApp belum ditemukan.");
    console.error(
      "Silakan jalankan 'npm run wa:setup' terlebih dahulu untuk menautkan nomor WhatsApp kantor.\n"
    );
    process.exit(1);
  }

  console.log("================================================================================");
  console.log("🔄 WHATSAPP GROUP FINDER & RE-SYNC TOOL — AGUNG TOYOTA UJUNGBATU");
  console.log("================================================================================");
  console.log("Menghubungkan ke WhatsApp menggunakan sesi tersimpan (tanpa scan QR)...");

  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);

  const sock = makeWASocket({
    auth: state,
    logger: pino({ level: "silent" }),
    printQRInTerminal: false,
    syncFullHistory: true,
    browser: ["Agung Toyota UjungBatu", "Chrome", "1.0.0"],
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === "close") {
      const statusCode = (
        lastDisconnect?.error as { output?: { statusCode?: number } }
      )?.output?.statusCode;

      if (statusCode === DisconnectReason.loggedOut) {
        console.error(
          "Sesi WhatsApp telah kedaluwarsa atau keluar dari HP kantor."
        );
        console.error("Silakan jalankan 'npm run wa:setup' untuk menautkan ulang.");
        process.exit(1);
      }
    } else if (connection === "open") {
      console.log("Sesi terverifikasi aktif!");
      console.log(
        "Menunggu server WhatsApp menyinkronkan daftar obrolan dan grup terbaru..."
      );

      // Countdown sinkronisasi agar seluruh grup yang baru dimasukkan terserap sempurna
      for (let i = 5; i >= 1; i--) {
        process.stdout.write(`\rMemproses sinkronisasi server WhatsApp: ${i} detik tersisa... `);
        await sleep(1000);
      }
      process.stdout.write("\rSinkronisasi selesai! Mengambil daftar seluruh grup aktif...\n\n");

      try {
        const groups = await sock.groupFetchAllParticipating();
        const groupList = Object.values(groups);

        if (groupList.length === 0) {
          console.log(
            "Nomor WhatsApp ini belum terdeteksi tergabung ke dalam grup mana pun."
          );
          console.log(
            "Pastikan nomor kantor sudah dimasukkan ke dalam grup WhatsApp cabang."
          );
        } else {
          console.log(`Ditemukan ${groupList.length} grup WhatsApp:\n`);
          console.log(
            "----------------------------------------------------------------------------------------------------------------"
          );
          console.log(
            "| No | Nama Grup (Subject)                   | ID Grup WhatsApp (JID)                          | Anggota       |"
          );
          console.log(
            "----------------------------------------------------------------------------------------------------------------"
          );

          groupList.forEach((group, index) => {
            const no = String(index + 1).padStart(2, " ");
            const subject = group.subject.padEnd(33, " ").slice(0, 33);
            const id = group.id.padEnd(47, " ");
            const members = `${group.participants?.length || 0} orang`.padEnd(13, " ");
            console.log(`| ${no} | ${subject} | ${id} | ${members} |`);
          });

          console.log(
            "----------------------------------------------------------------------------------------------------------------\n"
          );
          console.log("Petunjuk Penyimpanan ID Grup Cabang:");
          console.log("1. Temukan nama grup resmi laporan cabang pada daftar di atas.");
          console.log("2. Salin nilai 'ID Grup WhatsApp (JID)' yang berakhiran '@g.us'.");
          console.log(
            "3. Buka file .env pada folder root proyek, lalu ubah/isi baris berikut:"
          );
          console.log(
            '   WHATSAPP_TARGET_GROUP_ID="<ID_GRUP_YANG_DISALIN>"\n'
          );
        }
      } catch (error: unknown) {
        console.error("Terjadi kendala saat membaca daftar grup:", error);
      } finally {
        sock.end(undefined);
        setTimeout(() => {
          process.exit(0);
        }, 500);
      }
    }
  });
}

findWhatsAppGroups().catch((err: unknown) => {
  console.error("Gagal menjalankan tool pencari grup:", err);
  process.exit(1);
});
