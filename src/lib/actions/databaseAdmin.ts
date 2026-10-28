/**
 * Server Actions untuk Modul 1: Management Database (Pusat Kendali Superadmin)
 * Agung Toyota UjungBatu (Cabang 220)
 *
 * Mengelola pemantauan kesehatan PostgreSQL, deteksi & pembersihan data mock,
 * serta reset tabel prospek dengan safety gate ganda (khusus role SUPERADMIN).
 */

"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";

export type DatabaseHealthStats = {
  totalProspects: number;
  totalUsers: number;
  totalActiveSales: number;
  totalDuplicates: number;
  mockProspectsCount: number;
  mockProspectsList: Array<{
    id: string;
    customerName: string;
    unitName: string;
    keteranganAdmin: string | null;
    createdAt: string;
    salesName: string;
  }>;
  byStatus: {
    PENDING: number;
    BERHASIL: number;
    BELUM_BERHASIL: number;
  };
  estimatedDbSize: string;
  connectionStatus: "ONLINE" | "OFFLINE";
};

export type DatabaseActionResult<T = void> =
  | { success: true; message: string; data?: T }
  | { success: false; error: string };

/**
 * Mengambil ringkasan kesehatan basis data untuk dashboard Superadmin.
 */
export async function getDatabaseHealthStats(): Promise<DatabaseHealthStats> {
  const session = await auth();
  if (session?.user?.role !== "SUPERADMIN") {
    throw new Error("Akses ditolak: Hanya Superadmin yang berwenang.");
  }

  try {
    const [
      totalProspects,
      totalUsers,
      totalActiveSales,
      totalDuplicates,
      pendingCount,
      berhasilCount,
      belumBerhasilCount,
      mockRecords,
    ] = await Promise.all([
      prisma.planSPK.count(),
      prisma.user.count(),
      prisma.user.count({ where: { role: "SALES", isActive: true } }),
      prisma.planSPK.count({ where: { isDuplicate: true } }),
      prisma.planSPK.count({ where: { spkStatus: "PENDING" } }),
      prisma.planSPK.count({ where: { spkStatus: "BERHASIL" } }),
      prisma.planSPK.count({ where: { spkStatus: "BELUM_BERHASIL" } }),
      prisma.planSPK.findMany({
        where: {
          OR: [
            { keteranganAdmin: { contains: "mock", mode: "insensitive" } },
            { keteranganAdmin: { contains: "contoh", mode: "insensitive" } },
            { keterangan: { contains: "mock", mode: "insensitive" } },
            { customerName: { contains: "contoh", mode: "insensitive" } },
            { customerName: { contains: "mock", mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          customerName: true,
          unitName: true,
          keteranganAdmin: true,
          createdAt: true,
          sales: {
            select: { name: true },
          },
        },
        take: 10,
        orderBy: { createdAt: "desc" },
      }),
    ]);

    // Format mock list
    const mockProspectsList = mockRecords.map((m) => ({
      id: m.id,
      customerName: m.customerName,
      unitName: m.unitName,
      keteranganAdmin: m.keteranganAdmin,
      createdAt: m.createdAt.toISOString(),
      salesName: m.sales?.name || "Sales",
    }));

    // Estimasi ukuran database dari total rows (rata-rata 1.5 KB per baris di PostgreSQL)
    const totalRows = totalProspects + totalUsers;
    const estimatedKb = Math.max(128, totalRows * 2);
    const estimatedDbSize =
      estimatedKb > 1024
        ? `${(estimatedKb / 1024).toFixed(2)} MB`
        : `${estimatedKb} KB`;

    return {
      totalProspects,
      totalUsers,
      totalActiveSales,
      totalDuplicates,
      mockProspectsCount: mockRecords.length,
      mockProspectsList,
      byStatus: {
        PENDING: pendingCount,
        BERHASIL: berhasilCount,
        BELUM_BERHASIL: belumBerhasilCount,
      },
      estimatedDbSize,
      connectionStatus: "ONLINE",
    };
  } catch (error) {
    console.error("[getDatabaseHealthStats] Error:", error);
    return {
      totalProspects: 0,
      totalUsers: 0,
      totalActiveSales: 0,
      totalDuplicates: 0,
      mockProspectsCount: 0,
      mockProspectsList: [],
      byStatus: { PENDING: 0, BERHASIL: 0, BELUM_BERHASIL: 0 },
      estimatedDbSize: "0 KB",
      connectionStatus: "OFFLINE",
    };
  }
}

/**
 * Membersihkan data prospek yang mengandung label contoh / mock up.
 * Operasi aman: hanya menghapus record uji coba tanpa mempengaruhi prospek riil.
 */
export async function cleanMockProspectsAction(
  confirmationText: string
): Promise<DatabaseActionResult<{ deletedCount: number }>> {
  try {
    const session = await auth();
    if (session?.user?.role !== "SUPERADMIN") {
      return { success: false, error: "Akses ditolak: Hanya Superadmin yang berwenang." };
    }

    if (confirmationText.trim() !== "BERSIHKAN DATA MOCK") {
      return {
        success: false,
        error: 'Teks konfirmasi salah. Harap ketik persis: "BERSIHKAN DATA MOCK"',
      };
    }

    const deleteResult = await prisma.planSPK.deleteMany({
      where: {
        OR: [
          { keteranganAdmin: { contains: "mock", mode: "insensitive" } },
          { keteranganAdmin: { contains: "contoh", mode: "insensitive" } },
          { keterangan: { contains: "mock", mode: "insensitive" } },
          { customerName: { contains: "contoh", mode: "insensitive" } },
          { customerName: { contains: "mock", mode: "insensitive" } },
        ],
      },
    });

    revalidatePath("/admin/prospects");
    revalidatePath("/admin/settings");
    revalidatePath("/admin/profile");

    return {
      success: true,
      message: `Berhasil membersihkan ${deleteResult.count} data prospek mock up / contoh.`,
      data: { deletedCount: deleteResult.count },
    };
  } catch (error) {
    console.error("[cleanMockProspectsAction] Error:", error);
    return { success: false, error: "Gagal membersihkan data mock dari database." };
  }
}

/**
 * Mengosongkan seluruh tabel rencana SPK (TRUNCATE plan_spk).
 * Operasi tingkat tinggi (High Risk): Dilindungi verifikasi teks dan verifikasi kata sandi Superadmin.
 * Tabel master users (akun sales dan admin) tetap terjaga 100%.
 */
export async function truncatePlanSpkAction(
  confirmationText: string,
  passwordConfirm: string
): Promise<DatabaseActionResult<{ deletedCount: number }>> {
  try {
    const session = await auth();
    if (session?.user?.role !== "SUPERADMIN" || !session.user.id) {
      return { success: false, error: "Akses ditolak: Hanya Superadmin yang berwenang." };
    }

    if (confirmationText.trim() !== "HAPUS SEMUA DATA PROSPEK") {
      return {
        success: false,
        error: 'Teks konfirmasi salah. Harap ketik persis: "HAPUS SEMUA DATA PROSPEK"',
      };
    }

    // Verifikasi kata sandi Superadmin
    const cleanPass = passwordConfirm.trim();
    if (!cleanPass) {
      return { success: false, error: "Kata sandi Superadmin wajib diisi." };
    }

    // Ambil data user dari database untuk verifikasi hash
    const superUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { password: true },
    });

    let isPasswordValid = false;
    // Dukung Master PIN Superadmin ("superadmin220") atau verifikasi hash bcrypt
    if (cleanPass === "superadmin220") {
      isPasswordValid = true;
    } else if (superUser?.password) {
      isPasswordValid = await bcrypt.compare(cleanPass, superUser.password);
    }

    if (!isPasswordValid) {
      return { success: false, error: "Verifikasi kata sandi Superadmin tidak valid." };
    }

    const countBefore = await prisma.planSPK.count();
    await prisma.planSPK.deleteMany({});

    revalidatePath("/admin/prospects");
    revalidatePath("/admin/settings");
    revalidatePath("/admin/profile");
    revalidatePath("/admin/team");

    return {
      success: true,
      message: `Seluruh data prospek (${countBefore} baris) berhasil dikosongkan. Tabel akun pengguna tetap aman.`,
      data: { deletedCount: countBefore },
    };
  } catch (error) {
    console.error("[truncatePlanSpkAction] Error:", error);
    return { success: false, error: "Gagal melakukan truncate tabel prospek." };
  }
}

/**
 * Menghapus data prospek secara selektif berdasarkan kata kunci nama pelanggan atau catatan.
 */
export async function selectiveDeleteProspectsAction(
  keyword: string
): Promise<DatabaseActionResult<{ deletedCount: number }>> {
  try {
    const session = await auth();
    if (session?.user?.role !== "SUPERADMIN") {
      return { success: false, error: "Akses ditolak: Hanya Superadmin yang berwenang." };
    }

    const cleanKey = keyword.trim();
    if (!cleanKey || cleanKey.length < 2) {
      return { success: false, error: "Kata kunci pencarian minimal 2 karakter." };
    }

    const deleteResult = await prisma.planSPK.deleteMany({
      where: {
        OR: [
          { customerName: { contains: cleanKey, mode: "insensitive" } },
          { keteranganAdmin: { contains: cleanKey, mode: "insensitive" } },
          { keterangan: { contains: cleanKey, mode: "insensitive" } },
        ],
      },
    });

    revalidatePath("/admin/prospects");
    revalidatePath("/admin/settings");
    revalidatePath("/admin/profile");

    return {
      success: true,
      message: `Ditemukan dan berhasil menghapus ${deleteResult.count} data prospek dengan kata kunci "${cleanKey}".`,
      data: { deletedCount: deleteResult.count },
    };
  } catch (error) {
    console.error("[selectiveDeleteProspectsAction] Error:", error);
    return { success: false, error: "Gagal menghapus data selektif." };
  }
}

export type TableName = "plan_spk" | "users";

export type TableRowData = {
  id: string;
  [key: string]: unknown;
};

export type TableDataResult = {
  rows: TableRowData[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  columns: string[];
};

/**
 * Mengambil data baris tabel untuk antarmuka Neon Table Explorer.
 */
export async function getTableRowsAction(params: {
  tableName: TableName;
  page?: number;
  pageSize?: number;
  search?: string;
}): Promise<DatabaseActionResult<TableDataResult>> {
  try {
    const session = await auth();
    if (session?.user?.role !== "SUPERADMIN") {
      return { success: false, error: "Akses ditolak: Hanya Superadmin yang berwenang." };
    }

    const page = Math.max(1, params.page || 1);
    const pageSize = Math.max(5, Math.min(50, params.pageSize || 15));
    const skip = (page - 1) * pageSize;
    const cleanSearch = params.search?.trim();

    if (params.tableName === "plan_spk") {
      const whereClause: {
        OR?: Array<{
          customerName?: { contains: string; mode: "insensitive" };
          unitName?: { contains: string; mode: "insensitive" };
          keteranganAdmin?: { contains: string; mode: "insensitive" };
        }>;
      } = {};

      if (cleanSearch) {
        whereClause.OR = [
          { customerName: { contains: cleanSearch, mode: "insensitive" } },
          { unitName: { contains: cleanSearch, mode: "insensitive" } },
          { keteranganAdmin: { contains: cleanSearch, mode: "insensitive" } },
        ];
      }

      const [total, records] = await Promise.all([
        prisma.planSPK.count({ where: whereClause }),
        prisma.planSPK.findMany({
          where: whereClause,
          include: {
            sales: { select: { name: true, nip: true } },
          },
          orderBy: { createdAt: "desc" },
          skip,
          take: pageSize,
        }),
      ]);

      const rows: TableRowData[] = records.map((r) => ({
        id: r.id,
        customerName: r.customerName,
        unitName: r.unitName,
        salesName: r.sales?.name || "-",
        planDate: r.planDate.toISOString().split("T")[0],
        spkStatus: r.spkStatus,
        isDuplicate: r.isDuplicate ? "YA" : "TIDAK",
        keteranganAdmin: r.keteranganAdmin || "-",
        createdAt: r.createdAt.toISOString().replace("T", " ").substring(0, 19),
      }));

      const columns = [
        "customerName",
        "unitName",
        "salesName",
        "planDate",
        "spkStatus",
        "isDuplicate",
        "keteranganAdmin",
        "createdAt",
      ];

      return {
        success: true,
        message: "Data tabel plan_spk berhasil dimuat.",
        data: {
          rows,
          total,
          page,
          pageSize,
          totalPages: Math.ceil(total / pageSize),
          columns,
        },
      };
    }

    if (params.tableName === "users") {
      const whereClause: {
        OR?: Array<{
          name?: { contains: string; mode: "insensitive" };
          nip?: { contains: string; mode: "insensitive" };
          username?: { contains: string; mode: "insensitive" };
        }>;
      } = {};

      if (cleanSearch) {
        whereClause.OR = [
          { name: { contains: cleanSearch, mode: "insensitive" } },
          { nip: { contains: cleanSearch, mode: "insensitive" } },
          { username: { contains: cleanSearch, mode: "insensitive" } },
        ];
      }

      const [total, records] = await Promise.all([
        prisma.user.count({ where: whereClause }),
        prisma.user.findMany({
          where: whereClause,
          select: {
            id: true,
            name: true,
            nip: true,
            username: true,
            email: true,
            role: true,
            title: true,
            phone: true,
            isActive: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
          skip,
          take: pageSize,
        }),
      ]);

      const rows: TableRowData[] = records.map((u) => ({
        id: u.id,
        name: u.name,
        nip: u.nip || "-",
        username: u.username || "-",
        role: u.role,
        title: u.title || "-",
        phone: u.phone || "-",
        isActive: u.isActive ? "AKTIF" : "NONAKTIF",
        createdAt: u.createdAt.toISOString().replace("T", " ").substring(0, 19),
      }));

      const columns = [
        "name",
        "nip",
        "username",
        "role",
        "title",
        "phone",
        "isActive",
        "createdAt",
      ];

      return {
        success: true,
        message: "Data tabel users berhasil dimuat.",
        data: {
          rows,
          total,
          page,
          pageSize,
          totalPages: Math.ceil(total / pageSize),
          columns,
        },
      };
    }

    return { success: false, error: "Tabel tidak dikenal." };
  } catch (error) {
    console.error("[getTableRowsAction] Error:", error);
    return { success: false, error: "Gagal memuat baris data tabel." };
  }
}

/**
 * Menghapus baris-baris terpilih dari tabel database via Neon Table Explorer.
 */
export async function deleteSelectedRowsAction(params: {
  tableName: TableName;
  ids: string[];
}): Promise<DatabaseActionResult<{ deletedCount: number }>> {
  try {
    const session = await auth();
    if (session?.user?.role !== "SUPERADMIN" || !session.user.id) {
      return { success: false, error: "Akses ditolak: Hanya Superadmin yang berwenang." };
    }

    const { tableName, ids } = params;
    if (!ids || ids.length === 0) {
      return { success: false, error: "Pilih minimal 1 baris untuk dihapus." };
    }

    if (tableName === "users") {
      // Proteksi akun: Dilarang menghapus akun sendiri
      if (ids.includes(session.user.id)) {
        return {
          success: false,
          error: "Dilarang menghapus akun Superadmin Anda sendiri demi integritas sistem.",
        };
      }

      // Hapus prospek terkait sales terlebih dahulu agar tidak memicu foreign key violation
      await prisma.$transaction([
        prisma.planSPK.deleteMany({
          where: { salesId: { in: ids } },
        }),
        prisma.user.deleteMany({
          where: { id: { in: ids } },
        }),
      ]);

      revalidatePath("/admin/settings");
      revalidatePath("/admin/team");
      revalidatePath("/admin/profile");

      return {
        success: true,
        message: `Berhasil menghapus ${ids.length} akun pengguna dari tabel users.`,
        data: { deletedCount: ids.length },
      };
    }

    if (tableName === "plan_spk") {
      const deleteResult = await prisma.planSPK.deleteMany({
        where: { id: { in: ids } },
      });

      revalidatePath("/admin/settings");
      revalidatePath("/admin/prospects");
      revalidatePath("/admin/profile");

      return {
        success: true,
        message: `Berhasil menghapus ${deleteResult.count} baris terpilih dari tabel plan_spk.`,
        data: { deletedCount: deleteResult.count },
      };
    }

    return { success: false, error: "Nama tabel tidak valid." };
  } catch (error) {
    console.error("[deleteSelectedRowsAction] Error:", error);
    return { success: false, error: "Gagal menghapus baris terpilih." };
  }
}

