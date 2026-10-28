/**
 * Modul Konfigurasi Hak Akses & Rute Peran Pengguna (Role-Based Routing)
 * Agung Toyota UjungBatu (Cabang 220)
 *
 * Menentukan halaman tujuan utama bagi masing-masing peran secara terpusat:
 * - SALES diarahkan langsung ke halaman input rencana SPK (/input)
 * - ADMIN, ADH, dan SPV diarahkan ke tabel data rencana SPK cabang (/admin/prospects)
 */

export const ROLE_ROUTES = {
  /** Rute utama tenaga sales untuk input rencana H-1 */
  SALES: "/input",
  /** Rute utama staf administrasi cabang */
  ADMIN: "/admin/prospects",
  /** Rute utama Supervisor operasional sales */
  SPV: "/admin/prospects",
  /** Rute utama Administration Head cabang */
  ADH: "/admin/prospects",
  /** Rute utama Superadmin Control Center */
  SUPERADMIN: "/admin/prospects",
  /** Rute login publik */
  LOGIN: "/login",
} as const;

export type AppRole = "ADMIN" | "SPV" | "SALES" | "ADH" | "SUPERADMIN";

/**
 * Mengembalikan path default rute aplikasi berdasarkan peran pengguna yang terautentikasi.
 *
 * @param role - String peran dari token sesi (ADMIN, SPV, SALES, ADH, atau SUPERADMIN)
 * @returns Path URL tujuan utama (misal: /input atau /admin/prospects)
 */
export function getDefaultRouteForRole(role?: string | null): string {
  if (!role) return ROLE_ROUTES.LOGIN;

  const normalized = role.toUpperCase();
  if (normalized === "SALES") {
    return ROLE_ROUTES.SALES;
  }
  if (
    normalized === "ADMIN" ||
    normalized === "SPV" ||
    normalized === "ADH" ||
    normalized === "SUPERADMIN"
  ) {
    return ROLE_ROUTES.ADMIN;
  }

  return ROLE_ROUTES.LOGIN;
}

/**
 * Memeriksa apakah suatu peran memiliki wewenang untuk mengelola realisasi SPK
 * dan mengisi catatan evaluasi operasional (ADMIN, ADH, SPV, dan SUPERADMIN).
 *
 * @param role - String peran pengguna
 * @returns true jika peran berwenang
 */
export function canManageRealization(role?: string | null): boolean {
  if (!role) return false;
  const normalized = role.toUpperCase();
  return (
    normalized === "ADMIN" ||
    normalized === "SPV" ||
    normalized === "ADH" ||
    normalized === "SUPERADMIN"
  );
}

/**
 * Memeriksa apakah pengguna memiliki hak otorisasi untuk mengubah status closing SPK.
 * Khusus dibatasi untuk ADMIN, ADH, dan SUPERADMIN. SPV dilarang mengubah status demi kepatuhan audit.
 *
 * @param role - String peran pengguna
 * @returns true jika peran ADMIN, ADH, atau SUPERADMIN
 */
export function canChangeSpkStatus(role?: string | null): boolean {
  if (!role) return false;
  const normalized = role.toUpperCase();
  return (
    normalized === "ADMIN" ||
    normalized === "ADH" ||
    normalized === "SUPERADMIN"
  );
}

/**
 * Memeriksa apakah pengguna berhak mengakses area administrasi cabang (/admin/*).
 *
 * @param role - String peran pengguna
 * @returns true jika bukan SALES
 */
export function canAccessAdminArea(role?: string | null): boolean {
  if (!role) return false;
  return role.toUpperCase() !== "SALES";
}

/**
 * Memeriksa apakah pengguna memiliki hak akses penuh Superadmin Control Center.
 *
 * @param role - String peran pengguna
 * @returns true jika peran SUPERADMIN
 */
export function isSuperAdmin(role?: string | null): boolean {
  if (!role) return false;
  return role.toUpperCase() === "SUPERADMIN";
}
