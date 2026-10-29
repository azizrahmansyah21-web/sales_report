/**
 * Server Actions untuk Modul 5: Management Role & RBAC (Pusat Kendali Superadmin)
 * Agung Toyota UjungBatu (Cabang 220)
 *
 * Mengelola matriks perizinan visual (Permissions Matrix),
 * serta mutasi dan promosi peran pengguna cabang secara aman.
 */

"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import type { Role } from "@prisma/client";

export type RolePermissionRow = {
  id: string;
  category: string;
  action: string;
  description: string;
  sales: boolean;
  spv: boolean;
  admin: boolean;
  superadmin: boolean;
};

export type RoleUserItem = {
  id: string;
  name: string;
  nip: string | null;
  username: string | null;
  role: Role;
  title: string | null;
  phone: string | null;
  isActive: boolean;
  isProtected: boolean;
};

export type RoleOverviewData = {
  matrix: RolePermissionRow[];
  users: RoleUserItem[];
  stats: {
    total: number;
    salesCount: number;
    spvCount: number;
    adminCount: number;
    superadminCount: number;
  };
};

export type RoleActionResult<T = void> =
  | { success: true; message: string; data?: T }
  | { success: false; error: string };

const OFFICIAL_PERMISSIONS_MATRIX: RolePermissionRow[] = [
  // 1. Modul Form Input Sales
  {
    id: "p1",
    category: "Form Input Prospek (PWA)",
    action: "Input Rencana H-1",
    description: "Mengisi nama pelanggan, model Toyota, dan tanggal target prospek",
    sales: true,
    spv: false,
    admin: false,
    superadmin: true,
  },
  {
    id: "p2",
    category: "Form Input Prospek (PWA)",
    action: "Input Target Hari Ini (Cutoff 17:00 WIB)",
    description: "Input target hari berjalan sebelum batas cutoff pukul 17:00 WIB",
    sales: true,
    spv: false,
    admin: false,
    superadmin: true,
  },
  {
    id: "p3",
    category: "Form Input Prospek (PWA)",
    action: "Akses Offline PWA & Auto-Sync",
    description: "Penyimpanan antrean IndexedDB lokal saat perangkat kehilangan sinyal",
    sales: true,
    spv: false,
    admin: false,
    superadmin: true,
  },

  // 2. Modul Data Prospek & Monitoring
  {
    id: "p4",
    category: "Monitoring & Data Prospek",
    action: "Lihat Prospek Sendiri",
    description: "Melihat riwayat target prospek yang diinput oleh diri sendiri",
    sales: true,
    spv: false,
    admin: false,
    superadmin: true,
  },
  {
    id: "p5",
    category: "Monitoring & Data Prospek",
    action: "Lihat Prospek Tim Sales Binaan",
    description: "Memantau laporan dan progres seluruh sales di bawah supervisi",
    sales: false,
    spv: true,
    admin: false,
    superadmin: true,
  },
  {
    id: "p6",
    category: "Monitoring & Data Prospek",
    action: "Lihat Seluruh Prospek Cabang 220",
    description: "Akses menyeluruh seluruh transaksi sales di Agung Toyota UjungBatu",
    sales: false,
    spv: false,
    admin: true,
    superadmin: true,
  },
  {
    id: "p7",
    category: "Monitoring & Data Prospek",
    action: "Isi Catatan Evaluasi SPV",
    description: "Memberikan arahan dan catatan coaching pada prospek sales",
    sales: false,
    spv: true,
    admin: false,
    superadmin: true,
  },
  {
    id: "p8",
    category: "Monitoring & Data Prospek",
    action: "Verifikasi Closing (SPK Deal / Lost)",
    description: "Otoritas penetapan realisasi closing SPK dan catatan administrasi",
    sales: false,
    spv: false,
    admin: true,
    superadmin: true,
  },
  {
    id: "p9",
    category: "Monitoring & Data Prospek",
    action: "Ekspor Laporan Excel (.xlsx)",
    description: "Unduh rekap tabel prospek cabang dalam format spreadsheet",
    sales: false,
    spv: false,
    admin: true,
    superadmin: true,
  },

  // 3. Manajemen Tim & Personel
  {
    id: "p10",
    category: "Manajemen Tim Sales",
    action: "Lihat Roster Tim Sales",
    description: "Melihat daftar sales, nomor kontak WhatsApp, dan performa",
    sales: false,
    spv: true,
    admin: true,
    superadmin: true,
  },

  // 4. Pusat Kendali Superadmin (/admin/settings)
  {
    id: "p11",
    category: "Pusat Kendali Superadmin",
    action: "Akses Rute /admin/settings/*",
    description: "Membuka seluruh modul kontrol sistem (Middleware 403 Guard)",
    sales: false,
    spv: false,
    admin: false,
    superadmin: true,
  },
  {
    id: "p12",
    category: "Pusat Kendali Superadmin",
    action: "Management Database & Truncate",
    description: "Table Explorer, multi-select hapus baris, dan pembersihan plan_spk",
    sales: false,
    spv: false,
    admin: false,
    superadmin: true,
  },
  {
    id: "p13",
    category: "Pusat Kendali Superadmin",
    action: "Management User & Status Aktif",
    description: "CRUD karyawan cabang, toggle isActive, dan reset kata sandi",
    sales: false,
    spv: false,
    admin: false,
    superadmin: true,
  },
  {
    id: "p14",
    category: "Pusat Kendali Superadmin",
    action: "WhatsApp Blast & Rekap Excel WA",
    description: "Broadcast darurat, jadwal harian, laporan BM/ADH, dan telemetri log",
    sales: false,
    spv: false,
    admin: false,
    superadmin: true,
  },
  {
    id: "p15",
    category: "Pusat Kendali Superadmin",
    action: "Backup Database & Mutasi Role",
    description: "Streaming download .sql.gz dump dan promosi/demosi hak akses",
    sales: false,
    spv: false,
    admin: false,
    superadmin: true,
  },
];

/**
 * Mengambil matriks perizinan resmi dan daftar personel untuk mutasi peran.
 */
export async function getRoleOverviewAction(): Promise<
  RoleActionResult<RoleOverviewData>
> {
  try {
    const session = await auth();
    if (session?.user?.role !== "SUPERADMIN") {
      return { success: false, error: "Akses ditolak: Hanya Superadmin yang berwenang." };
    }

    const users = await prisma.user.findMany({
      orderBy: [{ role: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        nip: true,
        username: true,
        role: true,
        title: true,
        phone: true,
        isActive: true,
      },
    });

    const formattedUsers: RoleUserItem[] = users.map((u) => {
      const isSuperadminUser =
        u.role === "SUPERADMIN" ||
        u.nip === "999999A220" ||
        u.username === "superadmin" ||
        u.id === session.user?.id;

      return {
        id: u.id,
        name: u.name,
        nip: u.nip,
        username: u.username,
        role: u.role,
        title: u.title,
        phone: u.phone,
        isActive: u.isActive,
        isProtected: isSuperadminUser,
      };
    });

    const stats = {
      total: users.length,
      salesCount: users.filter((u) => u.role === "SALES").length,
      spvCount: users.filter((u) => u.role === "SPV").length,
      adminCount: users.filter((u) => u.role === "ADMIN").length,
      superadminCount: users.filter((u) => u.role === "SUPERADMIN").length,
    };

    return {
      success: true,
      message: "Data perizinan role berhasil dimuat.",
      data: {
        matrix: OFFICIAL_PERMISSIONS_MATRIX,
        users: formattedUsers,
        stats,
      },
    };
  } catch (error) {
    console.error("[getRoleOverviewAction] Error:", error);
    return { success: false, error: "Gagal memuat matriks perizinan role." };
  }
}

/**
 * Memperbarui peran hak akses (Role Mutation: Promosi / Demosi).
 */
export async function updateUserRoleAction(params: {
  userId: string;
  newRole: Role;
}): Promise<RoleActionResult<{ id: string; name: string; newRole: Role }>> {
  try {
    const session = await auth();
    if (session?.user?.role !== "SUPERADMIN" || !session.user.id) {
      return { success: false, error: "Akses ditolak: Hanya Superadmin yang berwenang." };
    }

    const { userId, newRole } = params;

    // Proteksi 1: Superadmin dilarang mengubah role akunnya sendiri (Self-Demotion Lock)
    if (userId === session.user.id) {
      return {
        success: false,
        error: "Dilarang mengubah role akun Anda sendiri demi menjaga integritas akses Superadmin.",
      };
    }

    // Ambil data user target
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, nip: true, username: true, role: true },
    });

    if (!targetUser) {
      return { success: false, error: "Akun karyawan tidak ditemukan." };
    }

    // Proteksi 2: Akun Superadmin utama tidak dapat diturunkan
    if (targetUser.role === "SUPERADMIN" || targetUser.nip === "999999A220") {
      return {
        success: false,
        error: "Akun Superadmin utama diproteksi dari perubahan role.",
      };
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
      select: { id: true, name: true, role: true },
    });

    revalidatePath("/admin/settings");
    revalidatePath("/admin/team");
    revalidatePath("/admin/prospects");

    return {
      success: true,
      message: `Peran "${updated.name}" berhasil diubah menjadi ${updated.role}.`,
      data: {
        id: updated.id,
        name: updated.name,
        newRole: updated.role,
      },
    };
  } catch (error) {
    console.error("[updateUserRoleAction] Error:", error);
    return { success: false, error: "Gagal memperbarui peran karyawan." };
  }
}

