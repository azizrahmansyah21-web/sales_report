/**
 * Modul Utilitas Tanggal & Waktu Waktu Indonesia Barat (WIB / UTC+7)
 * Agung Toyota UjungBatu (Cabang 220)
 *
 * Seluruh kalkulasi waktu dan penentuan batas waktu (cutoff) operasional cabang
 * dipusatkan di sini untuk menjamin konsistensi di sisi server maupun klien.
 */

/**
 * Representasi opsi tanggal cerdas untuk form input rencana SPK Sales
 */
export interface SmartDateOptionItem {
  /** Tanggal dalam format standar ISO YYYY-MM-DD */
  dateStr: string;
  /** Label tampilan tanggal (contoh: 16/10/2026) */
  displayDate: string;
  /** Label kontekstual (contoh: Hari Ini atau Rencana Besok) */
  label: string;
}

export interface SmartDateOptionsWIB {
  /** Pilihan tanggal hari ini */
  today: SmartDateOptionItem;
  /** Pilihan tanggal besok (H-1) */
  tomorrow: SmartDateOptionItem;
  /** Indikator apakah opsi hari ini dinonaktifkan (aktif jika sudah melewati jam 17:00 WIB) */
  isTodayDisabled: boolean;
  /** Nilai default tanggal yang dipilih secara otomatis */
  defaultPlanDate: string;
  /** Jam saat ini dalam zona waktu WIB (0 s/d 23) */
  currentHourWIB: number;
}

/** Batas jam penutupan input rencana SPK hari ini di Cabang 220 (17:00 WIB) */
export const CUTOFF_HOUR_WIB = 17;

/** Offset zona waktu WIB dalam milidetik (UTC+7) */
export const WIB_OFFSET_MS = 7 * 60 * 60 * 1000;

/**
 * Mengembalikan objek Date yang disesuaikan ke waktu saat ini di zona WIB.
 *
 * @param baseDate - Opsional tanggal rujukan (default: waktu sekarang)
 * @returns Objek Date dalam representasi zona waktu UTC+7
 */
export function getNowWIB(baseDate: Date = new Date()): Date {
  const utcTime = baseDate.getTime() + baseDate.getTimezoneOffset() * 60 * 1000;
  return new Date(utcTime + WIB_OFFSET_MS);
}

/**
 * Memeriksa apakah waktu saat ini di WIB sudah mencapai atau melewati batas jam 17:00 WIB.
 * Sesuai aturan operasional Cabang 220, setelah pukul 17:00 WIB sales tidak lagi dapat
 * memilih target hari ini dan diwajibkan menyusun rencana untuk hari esok.
 *
 * @param baseDate - Opsional tanggal rujukan
 * @returns true jika jam saat ini di WIB >= 17:00
 */
export function isPastCutoff17WIB(baseDate: Date = new Date()): boolean {
  const wib = getNowWIB(baseDate);
  return wib.getHours() >= CUTOFF_HOUR_WIB;
}

/** Alias kompatibilitas transisi */
export const isPastCutoff16WIB = isPastCutoff17WIB;

/**
 * Menghasilkan string tanggal YYYY-MM-DD berdasarkan offset hari dari hari ini di WIB.
 *
 * @param offsetDays - Jumlah hari penambahan (0 untuk hari ini, 1 untuk besok)
 * @param baseDate - Opsional tanggal rujukan
 * @returns String tanggal format YYYY-MM-DD
 */
export function getDateStringWIB(offsetDays: number = 0, baseDate: Date = new Date()): string {
  const wib = getNowWIB(baseDate);
  wib.setDate(wib.getDate() + offsetDays);

  const year = wib.getFullYear();
  const month = String(wib.getMonth() + 1).padStart(2, "0");
  const day = String(wib.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/**
 * Memformat tanggal menjadi format tampilan ramah pengguna Indonesia (DD/MM/YYYY).
 *
 * @param dateStrOrDate - String ISO atau objek Date
 * @returns String tanggal format DD/MM/YYYY
 */
export function formatDisplayDateWIB(dateStrOrDate: string | Date): string {
  let targetDate: Date;
  if (typeof dateStrOrDate === "string") {
    // Jika format YYYY-MM-DD, parse komponennya agar bebas pergeseran timezone UTC
    const parts = dateStrOrDate.split("T")[0].split("-");
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      targetDate = new Date(year, month, day);
    } else {
      targetDate = new Date(dateStrOrDate);
    }
  } else {
    targetDate = dateStrOrDate;
  }

  const day = String(targetDate.getDate()).padStart(2, "0");
  const month = String(targetDate.getMonth() + 1).padStart(2, "0");
  const year = targetDate.getFullYear();

  return `${day}/${month}/${year}`;
}

/**
 * Mengembalikan konfigurasi opsi tanggal pintar untuk form input Sales.
 * Dihitung terpusat agar rendering awal di Server Component identik dengan Browser.
 *
 * @param baseDate - Opsional tanggal rujukan
 * @returns Objek SmartDateOptionsWIB
 */
export function getSmartDateOptionsWIB(baseDate: Date = new Date()): SmartDateOptionsWIB {
  const wib = getNowWIB(baseDate);
  const currentHourWIB = wib.getHours();
  const isTodayDisabled = currentHourWIB >= CUTOFF_HOUR_WIB;

  const todayStr = getDateStringWIB(0, baseDate);
  const tomorrowStr = getDateStringWIB(1, baseDate);

  const todayDisplay = formatDisplayDateWIB(todayStr);
  const tomorrowDisplay = formatDisplayDateWIB(tomorrowStr);

  return {
    today: {
      dateStr: todayStr,
      displayDate: todayDisplay,
      label: "Hari Ini",
    },
    tomorrow: {
      dateStr: tomorrowStr,
      displayDate: tomorrowDisplay,
      label: "Rencana Besok (H-1)",
    },
    isTodayDisabled,
    // Default adalah rencana besok sesuai arahan operasional H-1
    defaultPlanDate: tomorrowStr,
    currentHourWIB,
  };
}

/**
 * Mengembalikan rentang waktu awal dan akhir hari ini di WIB dalam bentuk UTC Date.
 * Digunakan untuk filter query database Prisma (createdAt) secara presisi.
 *
 * Contoh:
 * Tanggal 16 Okt 2026 00:00:00 WIB setara dengan 15 Okt 2026 17:00:00 UTC.
 * Tanggal 16 Okt 2026 23:59:59.999 WIB setara dengan 16 Okt 2026 16:59:59.999 UTC.
 *
 * @param baseDate - Opsional tanggal rujukan
 * @returns Objek berisi startOfDayUTC dan endOfDayUTC
 */
export function getTodayRangeWIB(baseDate: Date = new Date()): {
  startOfDayUTC: Date;
  endOfDayUTC: Date;
  dateStringWIB: string;
} {
  const wib = getNowWIB(baseDate);
  const year = wib.getFullYear();
  const month = wib.getMonth();
  const day = wib.getDate();

  // Pukul 00:00:00 WIB dikurangi 7 jam = 17:00 UTC hari sebelumnya
  const startOfDayUTC = new Date(Date.UTC(year, month, day, 0 - 7, 0, 0, 0));
  // Pukul 23:59:59.999 WIB dikurangi 7 jam = 16:59:59.999 UTC hari yang sama
  const endOfDayUTC = new Date(Date.UTC(year, month, day, 23 - 7, 59, 59, 999));

  const monthStr = String(month + 1).padStart(2, "0");
  const dayStr = String(day).padStart(2, "0");
  const dateStringWIB = `${year}-${monthStr}-${dayStr}`;

  return {
    startOfDayUTC,
    endOfDayUTC,
    dateStringWIB,
  };
}

/**
 * Memformat tanggal dan waktu ke dalam format bahasa Indonesia standar WIB.
 *
 * @param dateStrOrDate - String ISO atau Date
 * @returns String terformat lengkap (contoh: 16 Okt 2026, 08:30 WIB)
 */
export function formatWIBDateTime(dateStrOrDate: string | Date): string {
  const d = typeof dateStrOrDate === "string" ? new Date(dateStrOrDate) : dateStrOrDate;
  if (isNaN(d.getTime())) return "-";

  // Tambahkan 7 jam untuk konversi ke WIB jika dari UTC
  const wibTime = new Date(d.getTime() + WIB_OFFSET_MS);

  const months = [
    "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
    "Jul", "Agu", "Sep", "Okt", "Nov", "Des"
  ];

  const day = wibTime.getUTCDate();
  const month = months[wibTime.getUTCMonth()];
  const year = wibTime.getUTCFullYear();
  const hours = String(wibTime.getUTCHours()).padStart(2, "0");
  const minutes = String(wibTime.getUTCMinutes()).padStart(2, "0");

  return `${day} ${month} ${year}, ${hours}:${minutes} WIB`;
}
