import fs from "fs";
import { PrismaClient } from "@prisma/client";
import { loadDaemonConfig } from "./env";
import { formatLatePlanAlert } from "./message-formatter";
import { sendGroupMessage, isWhatsAppReady } from "./client";

const prisma = new PrismaClient();

function getSentPlanIds(cacheFile: string): Set<string> {
  if (!fs.existsSync(cacheFile)) return new Set();
  try {
    const raw = fs.readFileSync(cacheFile, "utf-8");
    const parsed = JSON.parse(raw) as { sentPlanIds?: string[] };
    return new Set(parsed.sentPlanIds || []);
  } catch {
    return new Set();
  }
}

function saveSentPlanId(cacheFile: string, planId: string): void {
  try {
    const existing = getSentPlanIds(cacheFile);
    existing.add(planId);
    fs.writeFileSync(
      cacheFile,
      JSON.stringify(
        {
          sentPlanIds: Array.from(existing),
          updatedAt: new Date().toISOString(),
        },
        null,
        2
      ),
      "utf-8"
    );
  } catch (error) {
    console.error("[Watch Late] Gagal menyimpan cache plan ID:", error);
  }
}

export async function checkAndAlertLatePlans(): Promise<void> {
  if (!isWhatsAppReady()) {
    return;
  }

  const config = loadDaemonConfig();

  // Waktu saat ini dalam WIB (UTC+7)
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const wibNow = new Date(utc + 7 * 3600000);

  // Batas cutoff 08:00 WIB hari ini
  const cutoffToday = new Date(wibNow);
  cutoffToday.setHours(8, 0, 0, 0);

  // Jika saat ini belum melewati jam 08:00 WIB, belum masuk kategori susulan
  if (wibNow.getTime() < cutoffToday.getTime()) {
    return;
  }

  // Rentang hari ini
  const startOfDay = new Date(wibNow);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(wibNow);
  endOfDay.setHours(23, 59, 59, 999);

  const sentIds = getSentPlanIds(config.cacheAlertsFile);

  try {
    // Cari plan yang diinput untuk hari ini dan dibuat setelah jam 08:00 WIB
    const latePlans = await prisma.planSPK.findMany({
      where: {
        planDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
        createdAt: {
          gte: cutoffToday,
        },
      },
      include: {
        sales: {
          select: {
            id: true,
            name: true,
            nip: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    for (const plan of latePlans) {
      if (!sentIds.has(plan.id)) {
        console.log(
          `[Watch Late] Mendeteksi entri susulan: Customer "${plan.customerName}" (Sales: ${plan.sales.name}). Memperbarui rekap...`
        );

        // Ambil seluruh data sales dan seluruh plan hari ini untuk rekap 2 bagian yang terupdate
        const allSales = await prisma.user.findMany({
          where: { role: "SALES" },
          select: { id: true, name: true, nip: true },
          orderBy: { name: "asc" },
        });

        const allPlansToday = await prisma.planSPK.findMany({
          where: {
            planDate: {
              gte: startOfDay,
              lte: endOfDay,
            },
          },
          include: {
            sales: {
              select: {
                id: true,
                name: true,
                nip: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        });

        const submittedSalesIds = new Set(allPlansToday.map((p) => p.sales.id));
        const unsubmittedSales = allSales.filter((s) => !submittedSalesIds.has(s.id));

        const alertText = formatLatePlanAlert(
          plan,
          allPlansToday,
          unsubmittedSales,
          startOfDay
        );
        const isSent = await sendGroupMessage(alertText);

        if (isSent) {
          saveSentPlanId(config.cacheAlertsFile, plan.id);
          sentIds.add(plan.id);
          console.log(`[Watch Late] Rekap susulan terkirim untuk ${plan.sales.name}.`);
        }
      }
    }
  } catch (error) {
    console.error("[Watch Late] Terjadi kendala saat memeriksa entri susulan:", error);
  }
}
