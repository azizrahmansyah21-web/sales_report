import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
} from "@whiskeysockets/baileys";
import qrcode from "qrcode-terminal";
import pino from "pino";
import path from "path";
import fs from "fs";

const AUTH_DIR = path.resolve(process.cwd(), "auth_info_baileys");

async function connectToWhatsApp(): Promise<void> {
  if (!fs.existsSync(AUTH_DIR)) {
    fs.mkdirSync(AUTH_DIR, { recursive: true });
  }

  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);

  const sock = makeWASocket({
    auth: state,
    logger: pino({ level: "silent" }),
    printQRInTerminal: false,
    browser: ["Agung Toyota UjungBatu", "Chrome", "1.0.0"],
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log("\nSilakan scan QR code berikut menggunakan WhatsApp resmi kantor:");
      qrcode.generate(qr, { small: true });
      console.log("Petunjuk: Buka WhatsApp HP Kantor > Pengaturan / Titik Tiga > Perangkat Tertaut > Tautkan Perangkat.\n");
    }

    if (connection === "close") {
      const statusCode = (lastDisconnect?.error as { output?: { statusCode?: number } })?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

      if (shouldReconnect) {
        console.log("Koneksi terputus. Mencoba menghubungkan kembali...");
        connectToWhatsApp();
      } else {
        console.log("Sesi telah keluar. Hapus folder auth_info_baileys dan jalankan script ini kembali untuk scan ulang.");
        process.exit(1);
      }
    } else if (connection === "open") {
      console.log("\nNomor WhatsApp kantor cabang berhasil tertaut.");
      console.log(`Kredensial tersimpan lokal di: ${AUTH_DIR}`);
      console.log("Langkah selanjutnya: Jalankan 'npm run wa:find-groups' untuk mendapatkan ID grup tujuan.\n");
      
      // Memberikan jeda singkat agar file kredensial tersimpan sempurna sebelum keluar
      setTimeout(() => {
        process.exit(0);
      }, 2000);
    }
  });
}

connectToWhatsApp().catch((err: unknown) => {
  console.error("Gagal memulai proses penautan WhatsApp:", err);
  process.exit(1);
});
