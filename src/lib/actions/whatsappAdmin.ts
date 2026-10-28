/**
 * Server Actions untuk Modul 3: Management WA Blast ke Grup (Pusat Kendali Superadmin)
 * Agung Toyota UjungBatu (Cabang 220)
 *
 * Mengelola pengiriman pesan darurat/manual, penjadwalan blast rutin,
 * laporan pimpinan (BM & ADH), pengiriman rekap dokumen Excel, dan telemetri log.
 */

"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import * as XLSX from "xlsx";

export type WhatsAppSocketStatus = "ONLINE" | "STANDBY" | "OFFLINE";

export type WhatsAppOverviewData = {
  settings: {
    id: string;
    targetGroupId: string;
    targetGroupName: string;
    isMorningBlastActive: boolean;
    morningBlastTime: string;
    isEveningBlastActive: boolean;
    eveningBlastTime: string;
    sendReportToBm: boolean;
    sendReportToAdh: boolean;
  };
  telemetry: {
    socketStatus: WhatsAppSocketStatus;
    totalSentToday: number;
    pendingCount: number;
    failedCount: number;
    lastSentAt: string | null;
  };
  leadership: {
    bm: { name: string; phone: string | null; nip: string | null } | null;
    adh: { name: string; phone: string | null; nip: string | null } | null;
  };
};

export type WhatsAppMessageItem = {
  id: string;
  messageType: string;
  targetJid: string;
  targetName: string | null;
  content: string;
  hasDocument: boolean;
  documentName: string | null;
  status: string;
  errorMessage: string | null;
  sentAt: string | null;
  createdBy: string | null;
  createdAt: string;
};

export type WhatsAppActionResult<T = void> =
  | { success: true; message: string; data?: T }
  | { success: false; error: string };

/**
 * Mengambil ringkasan telemetri, konfigurasi grup, dan data kontak pimpinan.
 */
export async function getWhatsAppOverviewAction(): Promise<
  WhatsAppActionResult<WhatsAppOverviewData>
> {
  try {
    const session = await auth();
    if (session?.user?.role !== "SUPERADMIN") {
      return { success: false, error: "Akses ditolak: Hanya Superadmin yang berwenang." };
    }

    // Ambil atau inisialisasi settings cabang 220
    let settings = await prisma.whatsAppSetting.findUnique({
      where: { id: "cabang_220" },
    });

    if (!settings) {
      settings = await prisma.whatsAppSetting.create({
        data: {
          id: "cabang_220",
          targetGroupId: process.env.WHATSAPP_TARGET_GROUP_ID || "120363028340277890@g.us",
          targetGroupName: "SALES AGUNG TOYOTA UBT (CABANG 220)",
          isMorningBlastActive: true,
          morningBlastTime: "08:00",
          isEveningBlastActive: true,
          eveningBlastTime: "17:15",
          sendReportToBm: false, // Default false until BM approves format
          sendReportToAdh: false,
        },
      });
    }

    // Hitung metrik hari ini (WIB)
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [sentToday, pending, failed, lastMessage] = await Promise.all([
      prisma.whatsAppMessage.count({
        where: {
          status: "SENT",
          createdAt: { gte: todayStart },
        },
      }),
      prisma.whatsAppMessage.count({
        where: { status: "PENDING" },
      }),
      prisma.whatsAppMessage.count({
        where: { status: "FAILED" },
      }),
      prisma.whatsAppMessage.findFirst({
        where: { status: "SENT" },
        orderBy: { sentAt: "desc" },
        select: { sentAt: true },
      }),
    ]);

    // Data pimpinan BM & ADH
    const [bmUser, adhUser] = await Promise.all([
      prisma.user.findFirst({
        where: {
          OR: [
            { username: "branchmanager" },
            { title: { contains: "Branch Manager", mode: "insensitive" } },
          ],
        },
        select: { name: true, phone: true, nip: true },
      }),
      prisma.user.findFirst({
        where: {
          OR: [
            { username: "adh" },
            { title: { contains: "Administration Head", mode: "insensitive" } },
          ],
        },
        select: { name: true, phone: true, nip: true },
      }),
    ]);

    return {
      success: true,
      message: "Data telemetri WA Blast berhasil dimuat.",
      data: {
        settings: {
          id: settings.id,
          targetGroupId: settings.targetGroupId || "-",
          targetGroupName: settings.targetGroupName || "Grup Utama Cabang",
          isMorningBlastActive: settings.isMorningBlastActive,
          morningBlastTime: settings.morningBlastTime,
          isEveningBlastActive: settings.isEveningBlastActive,
          eveningBlastTime: settings.eveningBlastTime,
          sendReportToBm: settings.sendReportToBm,
          sendReportToAdh: settings.sendReportToAdh,
        },
        telemetry: {
          socketStatus: settings.targetGroupId ? "ONLINE" : "STANDBY",
          totalSentToday: sentToday,
          pendingCount: pending,
          failedCount: failed,
          lastSentAt: lastMessage?.sentAt
            ? lastMessage.sentAt.toISOString().replace("T", " ").substring(0, 19) + " WIB"
            : null,
        },
        leadership: {
          bm: bmUser
            ? { name: bmUser.name, phone: bmUser.phone, nip: bmUser.nip }
            : null,
          adh: adhUser
            ? { name: adhUser.name, phone: adhUser.phone, nip: adhUser.nip }
            : null,
        },
      },
    };
  } catch (error) {
    console.error("[getWhatsAppOverviewAction] Error:", error);
    return { success: false, error: "Gagal memuat telemetri WhatsApp." };
  }
}

/**
 * Menyimpan pembaruan konfigurasi blast, jadwal rutin, dan toggle laporan pimpinan.
 */
export async function updateWhatsAppSettingsAction(data: {
  targetGroupId?: string;
  targetGroupName?: string;
  isMorningBlastActive: boolean;
  morningBlastTime: string;
  isEveningBlastActive: boolean;
  eveningBlastTime: string;
  sendReportToBm: boolean;
  sendReportToAdh: boolean;
}): Promise<WhatsAppActionResult> {
  try {
    const session = await auth();
    if (session?.user?.role !== "SUPERADMIN") {
      return { success: false, error: "Akses ditolak: Hanya Superadmin yang berwenang." };
    }

    await prisma.whatsAppSetting.upsert({
      where: { id: "cabang_220" },
      update: {
        targetGroupId: data.targetGroupId?.trim() || null,
        targetGroupName: data.targetGroupName?.trim() || null,
        isMorningBlastActive: data.isMorningBlastActive,
        morningBlastTime: data.morningBlastTime,
        isEveningBlastActive: data.isEveningBlastActive,
        eveningBlastTime: data.eveningBlastTime,
        sendReportToBm: data.sendReportToBm,
        sendReportToAdh: data.sendReportToAdh,
      },
      create: {
        id: "cabang_220",
        targetGroupId: data.targetGroupId?.trim() || null,
        targetGroupName: data.targetGroupName?.trim() || null,
        isMorningBlastActive: data.isMorningBlastActive,
        morningBlastTime: data.morningBlastTime,
        isEveningBlastActive: data.isEveningBlastActive,
        eveningBlastTime: data.eveningBlastTime,
        sendReportToBm: data.sendReportToBm,
        sendReportToAdh: data.sendReportToAdh,
      },
    });

    revalidatePath("/admin/settings");
    return { success: true, message: "Pengaturan jadwal WA Blast berhasil diperbarui." };
  } catch (error) {
    console.error("[updateWhatsAppSettingsAction] Error:", error);
    return { success: false, error: "Gagal memperbarui pengaturan WhatsApp." };
  }
}

/**
 * Mengirim pesan manual atau pengumuman darurat (maintenance/downtime/kontak sysadmin).
 */
export async function sendManualWhatsAppMessageAction(params: {
  targetType: "GROUP" | "BM" | "ADH" | "CUSTOM";
  customRecipient?: string;
  content: string;
}): Promise<WhatsAppActionResult<{ messageId: string }>> {
  try {
    const session = await auth();
    if (session?.user?.role !== "SUPERADMIN") {
      return { success: false, error: "Akses ditolak: Hanya Superadmin yang berwenang." };
    }

    const cleanContent = params.content.trim();
    if (!cleanContent) {
      return { success: false, error: "Isi pesan tidak boleh kosong." };
    }

    let targetJid = "";
    let targetName = "";

    const settings = await prisma.whatsAppSetting.findUnique({
      where: { id: "cabang_220" },
    });

    if (params.targetType === "GROUP") {
      targetJid = settings?.targetGroupId || "120363028340277890@g.us";
      targetName = settings?.targetGroupName || "Grup Utama Sales Cabang";
    } else if (params.targetType === "BM") {
      const bm = await prisma.user.findFirst({
        where: {
          OR: [
            { username: "branchmanager" },
            { title: { contains: "Branch Manager", mode: "insensitive" } },
          ],
        },
        select: { phone: true, name: true },
      });
      if (!bm || !bm.phone) {
        return { success: false, error: "Nomor WhatsApp Branch Manager belum terdaftar di database." };
      }
      const cleanPhone = bm.phone.replace(/^0/, "62").replace(/[^0-9]/g, "");
      targetJid = `${cleanPhone}@s.whatsapp.net`;
      targetName = `Pribadi BM (${bm.name})`;
    } else if (params.targetType === "ADH") {
      const adh = await prisma.user.findFirst({
        where: {
          OR: [
            { username: "adh" },
            { title: { contains: "Administration Head", mode: "insensitive" } },
          ],
        },
        select: { phone: true, name: true },
      });
      if (!adh || !adh.phone) {
        return { success: false, error: "Nomor WhatsApp ADH belum terdaftar di database." };
      }
      const cleanPhone = adh.phone.replace(/^0/, "62").replace(/[^0-9]/g, "");
      targetJid = `${cleanPhone}@s.whatsapp.net`;
      targetName = `Pribadi ADH (${adh.name})`;
    } else if (params.targetType === "CUSTOM") {
      const recipient = params.customRecipient?.trim();
      if (!recipient) {
        return { success: false, error: "Nomor tujuan custom wajib diisi." };
      }
      const cleanPhone = recipient.replace(/^0/, "62").replace(/[^0-9]/g, "");
      targetJid = recipient.includes("@") ? recipient : `${cleanPhone}@s.whatsapp.net`;
      targetName = `Nomor Khusus (${cleanPhone})`;
    }

    const newMessage = await prisma.whatsAppMessage.create({
      data: {
        messageType: "MANUAL",
        targetJid,
        targetName,
        content: cleanContent,
        hasDocument: false,
        status: "PENDING",
        createdBy: session.user.name || "SUPERADMIN",
      },
    });

    revalidatePath("/admin/settings");
    return {
      success: true,
      message: `Pesan berhasil dimasukkan ke antrean pengiriman ke ${targetName}.`,
      data: { messageId: newMessage.id },
    };
  } catch (error) {
    console.error("[sendManualWhatsAppMessageAction] Error:", error);
    return { success: false, error: "Gagal memproses pengiriman pesan." };
  }
}

/**
 * Membuat rekap dokumen Excel plan SPK dan memasukkannya ke antrean pengiriman dokumen WA.
 */
export async function sendManualExcelReportAction(params: {
  targetDate: string; // YYYY-MM-DD
  targetType: "GROUP" | "BM" | "ADH";
}): Promise<WhatsAppActionResult<{ messageId: string; documentName: string; rowCount: number }>> {
  try {
    const session = await auth();
    if (session?.user?.role !== "SUPERADMIN") {
      return { success: false, error: "Akses ditolak: Hanya Superadmin yang berwenang." };
    }

    const dateStr = params.targetDate.trim();
    if (!dateStr) {
      return { success: false, error: "Tanggal rekap wajib ditentukan." };
    }

    const targetDateObj = new Date(`${dateStr}T00:00:00.000Z`);
    const nextDateObj = new Date(`${dateStr}T23:59:59.999Z`);

    // Ambil data prospek pada tanggal yang dipilih
    const plans = await prisma.planSPK.findMany({
      where: {
        planDate: {
          gte: targetDateObj,
          lte: nextDateObj,
        },
      },
      include: {
        sales: {
          select: { name: true, nip: true, phone: true },
        },
      },
      orderBy: [{ sales: { name: "asc" } }, { createdAt: "asc" }],
    });

    // Format data ke dalam lembar kerja Excel
    const rows = plans.map((p, index) => ({
      No: index + 1,
      "Tanggal Rencana": p.planDate.toISOString().split("T")[0],
      "Nama Sales": p.sales?.name || "-",
      "NIP Sales": p.sales?.nip || "-",
      "Nama Pelanggan": p.customerName,
      "Model Unit Toyota": p.unitName,
      "Status SPK": p.spkStatus,
      "Duplikat?": p.isDuplicate ? "YA" : "TIDAK",
      "Keterangan Admin": p.keteranganAdmin || "-",
      "Waktu Input": p.createdAt.toISOString().replace("T", " ").substring(0, 19),
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows.length > 0 ? rows : [{ Keterangan: "Tidak ada data rencana SPK pada tanggal ini." }]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Rekap SPK");

    const documentName = `Rekap_SPK_Cabang220_${dateStr}.xlsx`;

    // Tentukan target
    const settings = await prisma.whatsAppSetting.findUnique({ where: { id: "cabang_220" } });
    let targetJid = settings?.targetGroupId || "120363028340277890@g.us";
    let targetName = settings?.targetGroupName || "Grup Utama Sales Cabang";

    if (params.targetType === "BM") {
      const bm = await prisma.user.findFirst({
        where: {
          OR: [
            { username: "branchmanager" },
            { title: { contains: "Branch Manager", mode: "insensitive" } },
          ],
        },
        select: { phone: true, name: true },
      });
      if (bm?.phone) {
        const cleanPhone = bm.phone.replace(/^0/, "62").replace(/[^0-9]/g, "");
        targetJid = `${cleanPhone}@s.whatsapp.net`;
        targetName = `Pribadi BM (${bm.name})`;
      }
    } else if (params.targetType === "ADH") {
      const adh = await prisma.user.findFirst({
        where: {
          OR: [
            { username: "adh" },
            { title: { contains: "Administration Head", mode: "insensitive" } },
          ],
        },
        select: { phone: true, name: true },
      });
      if (adh?.phone) {
        const cleanPhone = adh.phone.replace(/^0/, "62").replace(/[^0-9]/g, "");
        targetJid = `${cleanPhone}@s.whatsapp.net`;
        targetName = `Pribadi ADH (${adh.name})`;
      }
    }

    const caption = `📊 *DOKUMEN REKAP PLAN SPK CABANG 220*\n` +
      `📅 Target Tanggal: ${dateStr}\n` +
      `📋 Total Data: ${plans.length} prospek\n` +
      `👤 Diekspor oleh: ${session.user.name || "Superadmin"}\n\n` +
      `_File terlampir dalam format resmi Excel (.xlsx)_`;

    const newMessage = await prisma.whatsAppMessage.create({
      data: {
        messageType: "EXCEL_DOCUMENT",
        targetJid,
        targetName,
        content: caption,
        hasDocument: true,
        documentName,
        status: "PENDING",
        createdBy: session.user.name || "SUPERADMIN",
      },
    });

    revalidatePath("/admin/settings");
    return {
      success: true,
      message: `File "${documentName}" (${plans.length} baris) siap dikirimkan ke ${targetName}.`,
      data: {
        messageId: newMessage.id,
        documentName,
        rowCount: plans.length,
      },
    };
  } catch (error) {
    console.error("[sendManualExcelReportAction] Error:", error);
    return { success: false, error: "Gagal membuat dokumen rekap Excel." };
  }
}

/**
 * Mengambil histori log pesan WhatsApp dengan paginasi, pencarian, dan filter status.
 */
export async function getWhatsAppHistoryAction(params?: {
  page?: number;
  pageSize?: number;
  search?: string;
  statusFilter?: string;
  typeFilter?: string;
}): Promise<
  WhatsAppActionResult<{
    messages: WhatsAppMessageItem[];
    total: number;
    page: number;
    totalPages: number;
  }>
> {
  try {
    const session = await auth();
    if (session?.user?.role !== "SUPERADMIN") {
      return { success: false, error: "Akses ditolak: Hanya Superadmin yang berwenang." };
    }

    const page = Math.max(1, params?.page || 1);
    const pageSize = Math.max(5, Math.min(50, params?.pageSize || 15));
    const skip = (page - 1) * pageSize;

    const whereClause: {
      status?: string;
      messageType?: string;
      OR?: Array<{
        content?: { contains: string; mode: "insensitive" };
        targetName?: { contains: string; mode: "insensitive" };
        documentName?: { contains: string; mode: "insensitive" };
      }>;
    } = {};

    if (params?.statusFilter && params.statusFilter !== "ALL") {
      whereClause.status = params.statusFilter;
    }

    if (params?.typeFilter && params.typeFilter !== "ALL") {
      whereClause.messageType = params.typeFilter;
    }

    const cleanSearch = params?.search?.trim();
    if (cleanSearch) {
      whereClause.OR = [
        { content: { contains: cleanSearch, mode: "insensitive" } },
        { targetName: { contains: cleanSearch, mode: "insensitive" } },
        { documentName: { contains: cleanSearch, mode: "insensitive" } },
      ];
    }

    const [total, records] = await Promise.all([
      prisma.whatsAppMessage.count({ where: whereClause }),
      prisma.whatsAppMessage.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
    ]);

    const formatted: WhatsAppMessageItem[] = records.map((m) => ({
      id: m.id,
      messageType: m.messageType,
      targetJid: m.targetJid,
      targetName: m.targetName,
      content: m.content,
      hasDocument: m.hasDocument,
      documentName: m.documentName,
      status: m.status,
      errorMessage: m.errorMessage,
      sentAt: m.sentAt ? m.sentAt.toISOString().replace("T", " ").substring(0, 19) + " WIB" : null,
      createdBy: m.createdBy,
      createdAt: m.createdAt.toISOString().replace("T", " ").substring(0, 19) + " WIB",
    }));

    return {
      success: true,
      message: "Histori pesan WhatsApp berhasil dimuat.",
      data: {
        messages: formatted,
        total,
        page,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  } catch (error) {
    console.error("[getWhatsAppHistoryAction] Error:", error);
    return { success: false, error: "Gagal memuat histori pesan WhatsApp." };
  }
}
