export interface SalesPerson {
  id: string;
  name: string;
  nip: string | null;
}

export interface PlanForBroadcast {
  id: string;
  customerName: string;
  unitName: string;
  planDate: Date;
  createdAt: Date;
  sales: {
    id: string;
    name: string;
    nip: string | null;
  };
}

const DAYS_ID = [
  "Minggu",
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
];

const MONTHS_ID = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

export function formatIndonesianDate(date: Date): string {
  const utc = date.getTime() + date.getTimezoneOffset() * 60000;
  const wib = new Date(utc + 7 * 3600000);

  const dayName = DAYS_ID[wib.getDay()];
  const dayNum = String(wib.getDate()).padStart(2, "0");
  const monthName = MONTHS_ID[wib.getMonth()];
  const year = wib.getFullYear();

  return `${dayName}, ${dayNum} ${monthName} ${year}`;
}

export function formatWibTime(date: Date): string {
  const utc = date.getTime() + date.getTimezoneOffset() * 60000;
  const wib = new Date(utc + 7 * 3600000);

  const hours = String(wib.getHours()).padStart(2, "0");
  const minutes = String(wib.getMinutes()).padStart(2, "0");

  return `${hours}:${minutes}`;
}

export function formatMorningBroadcast(
  plans: PlanForBroadcast[],
  unsubmittedSales: SalesPerson[],
  targetDate: Date
): string {
  const dateStr = formatIndonesianDate(targetDate);
  const totalSales = plans.length + unsubmittedSales.length;
  const percentage = totalSales > 0 ? Math.round((plans.length / totalSales) * 100) : 0;

  // 1. Bagian List yang SUDAH mengisi
  let submittedText = "";
  if (plans.length === 0) {
    submittedText = "_(Belum ada rencana SPK yang terdaftar)_";
  } else {
    const lines = plans.map((p, idx) => {
      const num = idx + 1;
      return (
        `${num}. 👤 *${p.sales.name}*\n` +
        `   • Customer : ${p.customerName}\n` +
        `   • Unit     : ${p.unitName}`
      );
    });
    submittedText = lines.join("\n\n");
  }

  // 2. Bagian List yang BELUM mengisi
  let unsubmittedText = "";
  if (unsubmittedSales.length === 0) {
    unsubmittedText = "🎉 _Luar biasa! Seluruh sales telah mengisi rencana SPK._";
  } else {
    const lines = unsubmittedSales.map((s, idx) => `${idx + 1}. 👤 ${s.name}`);
    unsubmittedText = lines.join("\n");
  }

  return (
    `🚗 *AGUNG TOYOTA UJUNGBATU (CABANG 220)*\n` +
    `📋 *REKAP PLAN SPK HARI INI*\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `📅 *Hari/Tanggal:* ${dateStr}\n` +
    `⏰ *Pukul:* 08:00 WIB\n\n` +
    `✅ *SUDAH MENGISI PLAN (${plans.length} Sales):*\n` +
    `${submittedText}\n\n` +
    `❌ *BELUM MENGISI PLAN (${unsubmittedSales.length} Sales):*\n` +
    `${unsubmittedText}\n\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `📊 *Progres Input:* ${plans.length} / ${totalSales} Sales (${percentage}%)\n` +
    `"Mari kawal setiap rencana SPK hari ini hingga closing sah. Bagi yang belum input, segera input melalui https://planspk.com"\n\n` +
    `_Sistem Pelaporan Plan SPK H-1 Otomatis_`
  );
}

export function formatLatePlanAlert(
  plan: PlanForBroadcast,
  allPlansToday: PlanForBroadcast[],
  unsubmittedSales: SalesPerson[],
  targetDate: Date
): string {
  const dateStr = formatIndonesianDate(targetDate);
  const timeStr = formatWibTime(plan.createdAt);
  const totalSales = allPlansToday.length + unsubmittedSales.length;
  const percentage = totalSales > 0 ? Math.round((allPlansToday.length / totalSales) * 100) : 0;

  // 1. List yang SUDAH mengisi terupdate
  const submittedLines = allPlansToday.map((p, idx) => {
    const num = idx + 1;
    const isNewMarker = p.id === plan.id ? " *(BARU INPUT)*" : "";
    return (
      `${num}. 👤 *${p.sales.name}*${isNewMarker}\n` +
      `   • Customer : ${p.customerName}\n` +
      `   • Unit     : ${p.unitName}`
    );
  });
  const submittedText = submittedLines.join("\n\n");

  // 2. List yang BELUM mengisi terupdate
  let unsubmittedText = "";
  if (unsubmittedSales.length === 0) {
    unsubmittedText = "🎉 _Semua sales telah tuntas mengisi rencana SPK._";
  } else {
    const unLines = unsubmittedSales.map((s, idx) => `${idx + 1}. 👤 ${s.name}`);
    unsubmittedText = unLines.join("\n");
  }

  return (
    `🚗 *AGUNG TOYOTA UJUNGBATU (CABANG 220)*\n` +
    `🔄 *UPDATE REKAP PLAN SPK (SUSULAN)*\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `📅 *Hari/Tanggal:* ${dateStr}\n` +
    `⏰ *Waktu Update:* ${timeStr} WIB\n\n` +
    `⚡ *Entri Susulan Masuk:*\n` +
    `👤 *Sales:* ${plan.sales.name}\n` +
    `• Customer : ${plan.customerName}\n` +
    `• Unit     : ${plan.unitName}\n` +
    `• Jam Input: ${timeStr} WIB\n\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `📋 *DAFTAR TERUPDATE HARI INI:*\n\n` +
    `✅ *SUDAH MENGISI PLAN (${allPlansToday.length} Sales):*\n` +
    `${submittedText}\n\n` +
    `❌ *BELUM MENGISI PLAN (${unsubmittedSales.length} Sales):*\n` +
    `${unsubmittedText}\n\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `📊 *Progres Terupdate:* ${allPlansToday.length} / ${totalSales} Sales (${percentage}%)\n` +
    `_Sistem Pelaporan Plan SPK H-1 Otomatis_`
  );
}
