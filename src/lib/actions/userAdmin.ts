/**
 * Server Actions untuk Modul 2: Management USER (Pusat Kendali Superadmin)
 * Agung Toyota UjungBatu (Cabang 220)
 *
 * Mengelola CRUD karyawan cabang, saklar status aktif (isActive),
 * mutasi jabatan/role, serta pembaruan kredensial sales & admin.
 */

"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";
import {
  createUserSchema,
  updateUserSchema,
} from "@/lib/validations/user";
import type { Role } from "@prisma/client";

export type AdminUserItem = {
  id: string;
  name: string;
  nip: string | null;
  username: string | null;
  email: string | null;
  role: Role;
  title: string | null;
  phone: string | null;
  isActive: boolean;
  totalPlansCount: number;
  createdAt: string;
};

export type UserActionResult<T = void> =
  | { success: true; message: string; data?: T }
  | { success: false; error: string };

/**
 * Mengambil daftar seluruh personel cabang dengan metrik performa masing-masing.
 */
export async function getUsersListAction(params?: {
  search?: string;
  role?: string;
}): Promise<
  UserActionResult<{
    users: AdminUserItem[];
    stats: {
      total: number;
      active: number;
      inactive: number;
      salesCount: number;
      spvCount: number;
      adminCount: number;
    };
  }>
> {
  try {
    const session = await auth();
    if (session?.user?.role !== "SUPERADMIN") {
      return { success: false, error: "Akses ditolak: Hanya Superadmin yang berwenang." };
    }

    const whereClause: {
      role?: Role;
      OR?: Array<{
        name?: { contains: string; mode: "insensitive" };
        nip?: { contains: string; mode: "insensitive" };
        username?: { contains: string; mode: "insensitive" };
        phone?: { contains: string; mode: "insensitive" };
      }>;
    } = {};

    if (params?.role && params.role !== "ALL") {
      whereClause.role = params.role as Role;
    }

    const cleanSearch = params?.search?.trim();
    if (cleanSearch) {
      whereClause.OR = [
        { name: { contains: cleanSearch, mode: "insensitive" } },
        { nip: { contains: cleanSearch, mode: "insensitive" } },
        { username: { contains: cleanSearch, mode: "insensitive" } },
        { phone: { contains: cleanSearch, mode: "insensitive" } },
      ];
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      include: {
        _count: {
          select: { planSpks: true },
        },
      },
      orderBy: [{ role: "asc" }, { name: "asc" }],
    });

    const formatted: AdminUserItem[] = users.map((u) => ({
      id: u.id,
      name: u.name,
      nip: u.nip,
      username: u.username,
      email: u.email,
      role: u.role,
      title: u.title,
      phone: u.phone,
      isActive: u.isActive,
      totalPlansCount: u._count.planSpks,
      createdAt: u.createdAt.toISOString().split("T")[0],
    }));

    const stats = {
      total: users.length,
      active: users.filter((u) => u.isActive).length,
      inactive: users.filter((u) => !u.isActive).length,
      salesCount: users.filter((u) => u.role === "SALES").length,
      spvCount: users.filter((u) => u.role === "SPV").length,
      adminCount: users.filter((u) => u.role === "ADMIN" || u.role === "SUPERADMIN").length,
    };

    return {
      success: true,
      message: "Data pengguna berhasil dimuat.",
      data: { users: formatted, stats },
    };
  } catch (error) {
    console.error("[getUsersListAction] Error:", error);
    return { success: false, error: "Gagal memuat daftar pengguna." };
  }
}

/**
 * Mendaftarkan akun karyawan/personel baru di cabang 220.
 */
export async function createUserAction(
  formData: unknown
): Promise<UserActionResult<AdminUserItem>> {
  try {
    const session = await auth();
    if (session?.user?.role !== "SUPERADMIN") {
      return { success: false, error: "Akses ditolak: Hanya Superadmin yang berwenang." };
    }

    const parsed = createUserSchema.safeParse(formData);
    if (!parsed.success) {
      const firstMsg = parsed.error.issues[0]?.message || "Data input tidak valid.";
      return { success: false, error: firstMsg };
    }

    const { name, nip, username, email, phone, role, title, password } = parsed.data;

    // Periksa duplikasi NIP atau Username
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { nip },
          { username },
          ...(email ? [{ email }] : []),
        ],
      },
    });

    if (existing) {
      if (existing.nip === nip) {
        return { success: false, error: `NIP "${nip}" sudah digunakan oleh karyawan ${existing.name}.` };
      }
      if (existing.username === username) {
        return { success: false, error: `Username "${username}" sudah digunakan.` };
      }
      if (email && existing.email === email) {
        return { success: false, error: `Email "${email}" sudah terdaftar.` };
      }
    }

    const rawPassword = password && password.trim() ? password.trim() : "toyota220";
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    const newUser = await prisma.user.create({
      data: {
        name: name.trim().toUpperCase(),
        nip,
        username,
        email: email && email.trim() ? email.trim().toLowerCase() : null,
        phone: phone && phone.trim() ? phone.trim() : null,
        role: role as Role,
        title: title && title.trim() ? title.trim() : null,
        password: hashedPassword,
        isActive: true,
      },
    });

    revalidatePath("/admin/settings");
    revalidatePath("/admin/team");
    revalidatePath("/admin/profile");

    return {
      success: true,
      message: `Akun personel "${newUser.name}" (NIP: ${newUser.nip}) berhasil dibuat.`,
      data: {
        id: newUser.id,
        name: newUser.name,
        nip: newUser.nip,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        title: newUser.title,
        phone: newUser.phone,
        isActive: newUser.isActive,
        totalPlansCount: 0,
        createdAt: newUser.createdAt.toISOString().split("T")[0],
      },
    };
  } catch (error) {
    console.error("[createUserAction] Error:", error);
    return { success: false, error: "Gagal membuat akun karyawan baru." };
  }
}

/**
 * Memperbarui data profil, NIP, nomor WhatsApp, atau mutasi role karyawan.
 */
export async function updateUserAction(
  formData: unknown
): Promise<UserActionResult<AdminUserItem>> {
  try {
    const session = await auth();
    if (session?.user?.role !== "SUPERADMIN") {
      return { success: false, error: "Akses ditolak: Hanya Superadmin yang berwenang." };
    }

    const parsed = updateUserSchema.safeParse(formData);
    if (!parsed.success) {
      const firstMsg = parsed.error.issues[0]?.message || "Data input tidak valid.";
      return { success: false, error: firstMsg };
    }

    const { id, name, nip, username, email, phone, role, title, newPassword } = parsed.data;

    // Periksa apakah user ada
    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      return { success: false, error: "Akun pengguna tidak ditemukan." };
    }

    // Periksa duplikasi NIP / username dengan akun lain
    const conflict = await prisma.user.findFirst({
      where: {
        id: { not: id },
        OR: [
          { nip },
          { username },
          ...(email ? [{ email }] : []),
        ],
      },
    });

    if (conflict) {
      if (conflict.nip === nip) {
        return { success: false, error: `NIP "${nip}" sudah digunakan oleh karyawan ${conflict.name}.` };
      }
      if (conflict.username === username) {
        return { success: false, error: `Username "${username}" sudah digunakan.` };
      }
    }

    const updateData: {
      name: string;
      nip: string;
      username: string;
      email: string | null;
      phone: string | null;
      role: Role;
      title: string | null;
      password?: string;
    } = {
      name: name.trim().toUpperCase(),
      nip,
      username,
      email: email && email.trim() ? email.trim().toLowerCase() : null,
      phone: phone && phone.trim() ? phone.trim() : null,
      role: role as Role,
      title: title && title.trim() ? title.trim() : null,
    };

    if (newPassword && newPassword.trim().length >= 6) {
      updateData.password = await bcrypt.hash(newPassword.trim(), 10);
    }

    const updated = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/admin/settings");
    revalidatePath("/admin/team");
    revalidatePath("/admin/profile");

    return {
      success: true,
      message: `Data karyawan "${updated.name}" berhasil diperbarui.`,
      data: {
        id: updated.id,
        name: updated.name,
        nip: updated.nip,
        username: updated.username,
        email: updated.email,
        role: updated.role,
        title: updated.title,
        phone: updated.phone,
        isActive: updated.isActive,
        totalPlansCount: 0,
        createdAt: updated.createdAt.toISOString().split("T")[0],
      },
    };
  } catch (error) {
    console.error("[updateUserAction] Error:", error);
    return { success: false, error: "Gagal memperbarui data pengguna." };
  }
}

/**
 * Mengubah status aktif/nonaktif akun karyawan (isActive: boolean).
 */
export async function toggleUserStatusAction(
  userId: string,
  newStatus: boolean
): Promise<UserActionResult<{ id: string; isActive: boolean }>> {
  try {
    const session = await auth();
    if (session?.user?.role !== "SUPERADMIN" || !session.user.id) {
      return { success: false, error: "Akses ditolak: Hanya Superadmin yang berwenang." };
    }

    // Proteksi: Superadmin dilarang menonaktifkan akun sendiri
    if (userId === session.user.id) {
      return { success: false, error: "Dilarang menonaktifkan akun Superadmin Anda sendiri." };
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { isActive: newStatus },
      select: { id: true, name: true, isActive: true },
    });

    revalidatePath("/admin/settings");
    revalidatePath("/admin/team");

    const statusLabel = updated.isActive ? "DIAKTIFKAN" : "DINONAKTIFKAN";
    return {
      success: true,
      message: `Akun "${updated.name}" berhasil ${statusLabel}.`,
      data: { id: updated.id, isActive: updated.isActive },
    };
  } catch (error) {
    console.error("[toggleUserStatusAction] Error:", error);
    return { success: false, error: "Gagal mengubah status aktif karyawan." };
  }
}

/**
 * Menghapus akun karyawan secara permanen beserta riwayat prospeknya.
 */
export async function deleteUserAction(
  userId: string
): Promise<UserActionResult<void>> {
  try {
    const session = await auth();
    if (session?.user?.role !== "SUPERADMIN" || !session.user.id) {
      return { success: false, error: "Akses ditolak: Hanya Superadmin yang berwenang." };
    }

    // Proteksi: Superadmin dilarang menghapus akun sendiri
    if (userId === session.user.id) {
      return { success: false, error: "Dilarang menghapus akun Superadmin Anda sendiri." };
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true },
    });

    if (!targetUser) {
      return { success: false, error: "Akun pengguna tidak ditemukan." };
    }

    await prisma.$transaction([
      prisma.planSPK.deleteMany({ where: { salesId: userId } }),
      prisma.user.delete({ where: { id: userId } }),
    ]);

    revalidatePath("/admin/settings");
    revalidatePath("/admin/team");
    revalidatePath("/admin/profile");

    return {
      success: true,
      message: `Akun "${targetUser.name}" berhasil dihapus dari sistem.`,
    };
  } catch (error) {
    console.error("[deleteUserAction] Error:", error);
    return { success: false, error: "Gagal menghapus akun pengguna." };
  }
}

