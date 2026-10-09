export interface PlanForBroadcast {
  id: string;
  customerName: string;
  unitName: string;
  planDate: Date;
  createdAt: Date;
  sales: {
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
  targetDate: Date
): string {
  const dateStr = formatIndonesianDate(targetDate);

  let planListText = "";
  if (plans.length === 0) {
    planListText = "Belum ada rencana SPK yang terdaftar untuk hari ini.";
  } else {
    const lines = plans.map((p, idx) => {
      const num = idx + 1;
      return (
        `${num}. 👤 *${p.sales.name}*\n` +
        `   • Customer : ${p.customerName}\n` +
        `   • Unit     : ${p.unitName}`
      );
    });
    planListText = lines.join("\n\n");
  }

  return (
    `🚗 *AGUNG TOYOTA UJUNGBATU*\n` +
    `📋 *PLAN SPK HARI INI*\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `📅 *Hari/Tanggal:* ${dateStr}\n\n` +
    `*PLAN SPK H-1:*\n` +
    `${planListText}\n\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `"Selamat pagi rekan-rekan Sales. Mari kawal setiap rencana SPK hari ini hingga closing sah. Tetap semangat!!"\n\n` +
    `_Sistem Plan SPK H-1 Otomatis_`
  );
}

export function formatLatePlanAlert(plan: PlanForBroadcast): string {
  const timeStr = formatWibTime(plan.createdAt);

  return (
    `🚗 *AGUNG TOYOTA UJUNGBATU*\n` +
    `⚠️ *UPDATE PLAN SPK SUSULAN*\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `Tercatat input rencana SPK baru untuk hari ini:\n\n` +
    `👤 *Sales:* ${plan.sales.name}\n` +
    `• Customer : ${plan.customerName}\n` +
    `• Unit     : ${plan.unitName}\n` +
    `• Jam Input: ${timeStr} WIB\n\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `_Sistem Plan SPK H-1 Otomatis_`
  );
}
