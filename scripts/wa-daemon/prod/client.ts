import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  WASocket,
} from "@whiskeysockets/baileys";
import pino from "pino";
import fs from "fs";
import path from "path";
import { loadDaemonConfig } from "./env";

let sock: WASocket | null = null;
let isConnected = false;
let isConnecting = false;
let lastSendTimestamp = 0;

const MIN_SEND_GAP_MS = 10000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function isWhatsAppReady(): boolean {
  return isConnected && sock !== null;
}

export async function initWhatsAppClient(): Promise<void> {
  if (isConnecting || isConnected) return;

  const config = loadDaemonConfig();
  const credsFile = path.join(config.authDir, "creds.json");

  if (!fs.existsSync(credsFile)) {
    console.log(
      "[WA Daemon] Standby: Sesi WhatsApp belum ditautkan. Jalankan 'npm run wa:setup' untuk menautkan nomor kantor."
    );
    return;
  }

  isConnecting = true;
  console.log("[WA Daemon] Menghubungkan ke WhatsApp Web Socket...");

  try {
    const { state, saveCreds } = await useMultiFileAuthState(config.authDir);

    sock = makeWASocket({
      auth: state,
      logger: pino({ level: "silent" }),
      printQRInTerminal: false,
      browser: ["Agung Toyota UjungBatu", "Chrome", "1.0.0"],
    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", async (update) => {
      const { connection, lastDisconnect } = update;

      if (connection === "close") {
        isConnected = false;
        isConnecting = false;

        const statusCode = (
          lastDisconnect?.error as { output?: { statusCode?: number } }
        )?.output?.statusCode;

        const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

        if (shouldReconnect) {
          console.log(
            "[WA Daemon] Koneksi socket terputus. Mencoba menghubungkan kembali dalam 5 detik..."
          );
          setTimeout(() => {
            initWhatsAppClient().catch(() => {});
          }, 5000);
        } else {
          console.error(
            "[WA Daemon] Sesi WhatsApp kedaluwarsa atau keluar. Silakan scan ulang via 'npm run wa:setup'."
          );
        }
      } else if (connection === "open") {
        isConnected = true;
        isConnecting = false;
        console.log("[WA Daemon] WhatsApp Socket aktif dan tersambung.");

        if (!config.whatsappTargetGroupId) {
          console.log(
            "[WA Daemon] Peringatan: WHATSAPP_TARGET_GROUP_ID di .env belum diisi. Pesan belum dapat dikirimkan ke grup."
          );
        } else {
          console.log(
            `[WA Daemon] Siap menyiarkan pesan ke grup: ${config.whatsappTargetGroupId}`
          );
        }
      }
    });
  } catch (error) {
    isConnecting = false;
    isConnected = false;
    console.error("[WA Daemon] Gagal menginisialisasi koneksi socket:", error);
  }
}

export async function sendGroupMessage(text: string): Promise<boolean> {
  const config = loadDaemonConfig();
  const targetGroupId = config.whatsappTargetGroupId;

  if (!targetGroupId) {
    console.log(
      "[WA Daemon] Pesan tidak dapat dikirim: WHATSAPP_TARGET_GROUP_ID belum disetel di .env."
    );
    return false;
  }

  if (!isConnected || !sock) {
    console.log(
      "[WA Daemon] Pesan ditunda: Koneksi WhatsApp belum siap. Mencoba menghubungkan..."
    );
    await initWhatsAppClient();
    return false;
  }

  // Enforce anti-burst delay between consecutive messages
  const elapsedSinceLastSend = Date.now() - lastSendTimestamp;
  if (elapsedSinceLastSend < MIN_SEND_GAP_MS) {
    const waitTime = MIN_SEND_GAP_MS - elapsedSinceLastSend;
    await sleep(waitTime);
  }

  try {
    // Human presence typing simulation to prevent bot detection
    await sock.sendPresenceUpdate("composing", targetGroupId);
    const typingDuration = 2200 + Math.floor(Math.random() * 1600);
    await sleep(typingDuration);
    await sock.sendPresenceUpdate("paused", targetGroupId);

    // Dispatch message to WhatsApp group
    await sock.sendMessage(targetGroupId, { text });
    lastSendTimestamp = Date.now();
    console.log("[WA Daemon] Pesan berhasil dikirim ke grup kantor.");
    return true;
  } catch (error) {
    console.error("[WA Daemon] Gagal mengirim pesan ke grup:", error);
    return false;
  }
}

export function getWhatsAppSocket(): WASocket | null {
  return sock;
}

export async function sendGroupMessageWithResult(
  text: string
): Promise<{ success: boolean; messageId?: string; targetGroupId?: string }> {
  const config = loadDaemonConfig();
  const targetGroupId = config.whatsappTargetGroupId;

  if (!targetGroupId) {
    console.log(
      "[WA Daemon] Pesan tidak dapat dikirim: WHATSAPP_TARGET_GROUP_ID belum disetel di .env."
    );
    return { success: false };
  }

  if (!isConnected || !sock) {
    console.log(
      "[WA Daemon] Pesan ditunda: Koneksi WhatsApp belum siap. Mencoba menghubungkan..."
    );
    await initWhatsAppClient();
    return { success: false };
  }

  // Enforce anti-burst delay between consecutive messages
  const elapsedSinceLastSend = Date.now() - lastSendTimestamp;
  if (elapsedSinceLastSend < MIN_SEND_GAP_MS) {
    const waitTime = MIN_SEND_GAP_MS - elapsedSinceLastSend;
    await sleep(waitTime);
  }

  try {
    // Human presence typing simulation to prevent bot detection
    await sock.sendPresenceUpdate("composing", targetGroupId);
    const typingDuration = 2200 + Math.floor(Math.random() * 1600);
    await sleep(typingDuration);
    await sock.sendPresenceUpdate("paused", targetGroupId);

    // Dispatch message to WhatsApp group
    const sent = await sock.sendMessage(targetGroupId, { text });
    lastSendTimestamp = Date.now();
    console.log("[WA Daemon] Pesan berhasil dikirim ke grup kantor.");
    return {
      success: true,
      messageId: sent?.key?.id ?? undefined,
      targetGroupId,
    };
  } catch (error) {
    console.error("[WA Daemon] Gagal mengirim pesan ke grup:", error);
    return { success: false };
  }
}

export async function closeWhatsAppClient(): Promise<void> {
  if (sock) {
    sock.end(undefined);
    sock = null;
    isConnected = false;
    isConnecting = false;
    console.log("[WA Daemon] Koneksi WhatsApp ditutup dengan aman.");
  }
}
