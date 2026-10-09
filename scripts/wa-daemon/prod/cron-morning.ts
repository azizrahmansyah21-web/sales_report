import fs from "fs";
import { PrismaClient } from "@prisma/client";
import { loadDaemonConfig } from "./env";
import { formatMorningBroadcast } from "./message-formatter";
import { sendGroupMessage, isWhatsAppReady } from "./client";

const prisma = new PrismaClient();

function getWibDate(): {
  dateObj: Date;
  dateKey: string;
  hours: number;
  minutes: number;
} {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const wib = new Date(utc + 7 * 3600000);

  const year = wib.getFullYear();
  const month = String(wib.getMonth() + 1).padStart(2, "0");
  const day = String(wib.getDate()).padStart(2, "0");
  const dateKey = `${year}-${month}-${day}`;

  return {
    dateObj: wib,
    dateKey,
    hours: wib.getHours(),
    minutes: wib.getMinutes(),
  };
}

function hasBroadcastedToday(cacheFile: string, dateKey: string): boolean {
  if (!fs.existsSync(cacheFile)) return false;
  try {
    const raw = fs.readFileSync(cacheFile, "utf-8");
    const parsed = JSON.parse(raw) as { lastBroadcastDate?: string };
    return parsed.lastBroadcastDate === dateKey;
  } catch {
    return false;
  }
}

function markBroadcastedToday(cacheFile: string, dateKey: string): void {
  try {
    fs.writeFileSync(
      cacheFile,
      JSON.stringify(
        { lastBroadcastDate: dateKey, sentAt: new Date().toISOString() },
        null,
        2
      ),
      "utf-8"
    );
  } catch (error) {
    console.error("[Cron Morning] Gagal menyimpan cache tanggal broadcast:", error);
  }
}

export async function checkAndRunMorningBroadcast(): Promise<void> {
  const config = loadDaemonConfig();
  const { dateObj, dateKey, hours, minutes } = getWibDate();

  // Hanya memicu pengiriman di rentang jam 08:00 sampai 08:10 WIB
  if (hours !== 8 || minutes > 10) {
    return;
  }

  if (hasBroadcastedToday(config.cacheMorningFile, dateKey)) {
    return;
  }

  if (!isWhatsAppReady()) {
    console.log(
      `[Cron Morning] Waktu broadcast (${dateKey} 08:${String(minutes).padStart(2, "0")} WIB) telah tiba, menunggu koneksi WhatsApp siap...`
    );
    return;
  }

  console.log(
    `[Cron Morning] Memproses penyiaran rekap rencana SPK untuk tanggal ${dateKey}...`
  );

  try {
    // Menghitung batasan hari H (00:00:00 s.d 23:59:59)
    const startOfDay = new Date(dateObj);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(dateObj);
    endOfDay.setHours(23, 59, 59, 999);

    const plans = await prisma.planSPK.findMany({
      where: {
        planDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        sales: {
          select: {
            name: true,
            nip: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    const message = formatMorningBroadcast(plans, startOfDay);
    const isSent = await sendGroupMessage(message);

    if (isSent) {
      markBroadcastedToday(config.cacheMorningFile, dateKey);
      console.log(
        `[Cron Morning] Berhasil menyiarkan rekap pagi: ${plans.length} entri plan SPK terkirim ke grup.`
      );
    }
  } catch (error) {
    console.error("[Cron Morning] Terjadi kendala saat menyusun rekap pagi:", error);
  }
}
