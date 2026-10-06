export interface SalesAdvisor {
  id: string;
  name: string;
  npk: string;
  title: string;
  zone: string;
  status: "Aktif Lapangan" | "Aktif Showroom" | "Off Duty / Cuti";
  prospectsCount: number;
  spkTarget: string;
  spkCount: number;
  targetCount: number;
  targetPct: number;
  conversionRate: number;
  disputes: number;
  avatar: string;
}

export interface ProspectTableRow {
  id: string;
  dateTime: string;
  timeOnly?: string;
  customerName: string;
  customerLocation?: string;
  customerPhone: string;
  unitName: string;
  unitDetail?: string;
  salesName: string;
  salesNpk?: string;
  status: "NEW" | "FOLLOW_UP" | "DEAL" | "LOST";
  isDuplicate: boolean;
  duplicateFrequency?: number;
  notes?: string;
}

export interface ProspectMobileItem {
  id: string;
  customerName: string;
  customerPhone: string;
  unitName: string;
  status: "NEW" | "FOLLOW_UP" | "DEAL" | "LOST";
  timestamp: string;
  notes?: string;
  isDuplicate?: boolean;
  duplicateFrequency?: number;
  duplicateNote?: string;
}

export interface TouchpointItem {
  id: string;
  stepNumber: number;
  stepTitle: string;
  date: string;
  vehicle: string;
  description: string;
  salesName: string;
  salesNpk: string;
  statusBadge: string;
  statusColor: "green" | "amber" | "slate" | "blue";
}

export interface TimelineDrawerData {
  prospectId: string;
  customerName: string;
  customerPhone: string;
  location: string;
  duplicateCount: number;
  touchpoints: TouchpointItem[];
}

export const TOYOTA_MODELS = [
  "Kijang Innova Zenix 2.0 V CVT (Platinum White Pearl)",
  "Kijang Innova Zenix 2.0 G CVT",
  "All New Avanza 1.5 G CVT",
  "All New Veloz 1.5 Q CVT",
  "Hilux Rangga Cab Flatdeck 2.4 DSL",
  "Hilux Rangga Cab & Chassis 2.4 DSL",
  "Hilux Single Cab 4x4 MT",
  "Hilux Double Cab 2.4 V 4x4 AT",
  "New Fortuner 2.8 GR Sport 4x4",
  "New Fortuner 2.8 VRZ 4x2",
  "Yaris Cross 1.5 S HEV GR",
  "All New Rush 1.5 S GR Sport",
  "New Calya 1.2 G MT",
  "New Agya 1.2 GR Sport",
];

export const SALES_ADVISORS: SalesAdvisor[] = [
  {
    id: "s1",
    name: "Bagus Triyanto",
    npk: "NPK-ATUB-202108",
    title: "Senior Sales Executive",
    zone: "UjungBatu Kota & Tandun (Radius 25 km • Ring 1)",
    status: "Aktif Lapangan",
    prospectsCount: 42,
    spkTarget: "8 / 10",
    spkCount: 8,
    targetCount: 10,
    targetPct: 80,
    conversionRate: 19.0,
    disputes: 3,
    avatar: "BT",
  },
  {
    id: "s2",
    name: "Rian Pratama",
    npk: "NPK-ATUB-202311",
    title: "Junior Sales",
    zone: "Kunto Darussalam (Wilayah Kota Lama & Ekspansi)",
    status: "Aktif Lapangan",
    prospectsCount: 38,
    spkTarget: "7 / 8",
    spkCount: 7,
    targetCount: 8,
    targetPct: 87.5,
    conversionRate: 18.4,
    disputes: 1,
    avatar: "RP",
  },
  {
    id: "s3",
    name: "Dedi Kurniawan",
    npk: "NPK-ATUB-202204",
    title: "Sales Advisor",
    zone: "Pasir Pengaraian (Ibu Kota Kab. Rokan Hulu)",
    status: "Aktif Lapangan",
    prospectsCount: 35,
    spkTarget: "6 / 8",
    spkCount: 6,
    targetCount: 8,
    targetPct: 75,
    conversionRate: 17.1,
    disputes: 2,
    avatar: "DK",
  },
  {
    id: "s4",
    name: "Siti Aminah",
    npk: "NPK-ATUB-202210",
    title: "Sales Counter",
    zone: "Showroom UjungBatu (Walk-in Customer & Digital)",
    status: "Aktif Showroom",
    prospectsCount: 32,
    spkTarget: "5 / 7",
    spkCount: 5,
    targetCount: 7,
    targetPct: 71.4,
    conversionRate: 15.6,
    disputes: 0,
    avatar: "SA",
  },
  {
    id: "s5",
    name: "Hendra Wijaya",
    npk: "NPK-ATUB-201905",
    title: "Commercial Specialist",
    zone: "Wilayah Sawit Rokan Hulu (Hilux 4x4 & Dyna Korporasi)",
    status: "Aktif Lapangan",
    prospectsCount: 29,
    spkTarget: "5 / 6",
    spkCount: 5,
    targetCount: 6,
    targetPct: 83.3,
    conversionRate: 17.2,
    disputes: 4,
    avatar: "HW",
  },
  {
    id: "s6",
    name: "Dewi Lestari",
    npk: "NPK-ATUB-202302",
    title: "Account Exec Fleet",
    zone: "Perkebunan Tandun (Koperasi Unit Desa & PTPN)",
    status: "Aktif Lapangan",
    prospectsCount: 27,
    spkTarget: "4 / 6",
    spkCount: 4,
    targetCount: 6,
    targetPct: 66.7,
    conversionRate: 14.8,
    disputes: 1,
    avatar: "DL",
  },
  {
    id: "s7",
    name: "Wahyu Setiawan",
    npk: "NPK-ATUB-202401",
    title: "Junior Sales",
    zone: "Pagaran Tapah (Wilayah Perbatasan Tapung)",
    status: "Off Duty / Cuti",
    prospectsCount: 18,
    spkTarget: "2 / 5",
    spkCount: 2,
    targetCount: 5,
    targetPct: 40,
    conversionRate: 11.1,
    disputes: 0,
    avatar: "WS",
  },
];

export const MOCK_PROSPECTS_TABLE: ProspectTableRow[] = [
  {
    id: "P001",
    dateTime: "24 Okt 2024",
    timeOnly: "14:20 WIB",
    customerName: "Bambang Sudiro",
    customerLocation: "Desa Tandun • Rokan Hulu",
    customerPhone: "0812-7564-9981",
    unitName: "Innova Zenix 2.0 V CVT",
    unitDetail: "Warna: Platinum White Pearl",
    salesName: "Bagus Triyanto",
    salesNpk: "NPK-092 (Senior Sales)",
    status: "DEAL",
    isDuplicate: true,
    duplicateFrequency: 3,
  },
  {
    id: "P002",
    dateTime: "02 Okt 2024",
    timeOnly: "10:45 WIB",
    customerName: "Bambang Sudiro",
    customerLocation: "Desa Tandun • Rokan Hulu",
    customerPhone: "0812-7564-9981",
    unitName: "Hilux Rangga Cab Flatdeck",
    unitDetail: "Operasional Kebun Sawit",
    salesName: "Bagus Triyanto",
    salesNpk: "NPK-092 (Senior Sales)",
    status: "FOLLOW_UP",
    isDuplicate: true,
    duplicateFrequency: 2,
  },
  {
    id: "P003",
    dateTime: "12 Sep 2024",
    timeOnly: "16:15 WIB",
    customerName: "Bambang Sudiro",
    customerLocation: "Desa Tandun • Rokan Hulu",
    customerPhone: "0812-7564-9981",
    unitName: "Hilux Single Cab 4x4 MT",
    unitDetail: "Simulasi Kredit Mandiri Tunas",
    salesName: "Hendra Wijaya",
    salesNpk: "NPK-084 (Sales Exec)",
    status: "FOLLOW_UP",
    isDuplicate: true,
    duplicateFrequency: 1,
  },
  {
    id: "P004",
    dateTime: "24 Okt 2024",
    timeOnly: "13:50 WIB",
    customerName: "Haji Syahril Anwar",
    customerLocation: "Kec. Kunto Darussalam",
    customerPhone: "0813-6541-2099",
    unitName: "New Fortuner 2.8 GR-S 4x4",
    unitDetail: "Attitude Black",
    salesName: "Rian Pratama",
    salesNpk: "NPK-114 (Junior Sales)",
    status: "NEW",
    isDuplicate: false,
  },
  {
    id: "P005",
    dateTime: "23 Okt 2024",
    timeOnly: "11:15 WIB",
    customerName: "dr. Nurmala Sari, Sp.A",
    customerLocation: "RSUD Rokan Hulu • Pasir Pengaraian",
    customerPhone: "0821-7033-4812",
    unitName: "Yaris Cross 1.5 S HV GR",
    unitDetail: "Two Tone Scarlet Red",
    salesName: "Dewi Lestari",
    salesNpk: "NPK-155 (Account Exec)",
    status: "DEAL",
    isDuplicate: false,
  },
  {
    id: "P006",
    dateTime: "23 Okt 2024",
    timeOnly: "09:30 WIB",
    customerName: "PT Agro Rohul Lestari (Bpk. Edwin)",
    customerLocation: "Kawasan Industri Tandun",
    customerPhone: "0811-7600-812",
    unitName: "Hilux Rangga Cab (5 Unit)",
    unitDetail: "Fleet Pengadaan Perusahaan",
    salesName: "Wahyu Setiawan",
    salesNpk: "NPK-077 (Fleet Sales)",
    status: "FOLLOW_UP",
    isDuplicate: false,
  },
  {
    id: "P007",
    dateTime: "22 Okt 2024",
    timeOnly: "16:40 WIB",
    customerName: "Deddy Gunawan",
    customerLocation: "Pasar Lama UjungBatu",
    customerPhone: "0852-6590-1233",
    unitName: "All New Avanza 1.5 G CVT",
    unitDetail: "Silver Mica Metallic",
    salesName: "Rian Pratama",
    salesNpk: "NPK-114 (Junior Sales)",
    status: "LOST",
    isDuplicate: false,
  },
  {
    id: "P008",
    dateTime: "22 Okt 2024",
    timeOnly: "14:05 WIB",
    customerName: "Hj. Maryati",
    customerLocation: "Kec. Rokan IV Koto",
    customerPhone: "0823-8891-4421",
    unitName: "All New Veloz 1.5 Q CVT",
    unitDetail: "Black Metallic",
    salesName: "Bagus Triyanto",
    salesNpk: "NPK-092 (Senior Sales)",
    status: "FOLLOW_UP",
    isDuplicate: true,
    duplicateFrequency: 2,
  },
];

export const MOCK_MOBILE_PROSPECTS: ProspectMobileItem[] = [
  {
    id: "M001",
    customerName: "Bambang Sudiro",
    customerPhone: "0812-7564-9981",
    unitName: "Kijang Innova Zenix 2.0 V CVT Modellista",
    status: "DEAL",
    timestamp: "Hari ini, 14:20 WIB",
    notes:
      "SPK disetujui, pengiriman unit dijadwalkan minggu depan ke UjungBatu.",
  },
  {
    id: "M002",
    customerName: "Kevin Sanjaya",
    customerPhone: "0813-8821-4309",
    unitName: "Yaris Cross 1.5 S HEV GR",
    status: "FOLLOW_UP",
    timestamp: "Kemarin, 09:15 WIB",
    isDuplicate: true,
    duplicateFrequency: 2,
    duplicateNote:
      "Pernah diinput di Agung Toyota UjungBatu bulan lalu. Riwayat data dialihkan ke tim koordinasi.",
  },
  {
    id: "M003",
    customerName: "Hj. Endang Rahayu",
    customerPhone: "0821-6672-1140",
    unitName: "All New Avanza 1.5 G CVT",
    status: "NEW",
    timestamp: "23 Okt, 16:45 WIB",
    notes:
      "Prospek pameran Pasar UjungBatu, minta simulasi kredit 4 tahun via Toyota Astra Financial.",
  },
  {
    id: "M004",
    customerName: "Rian Pratama",
    customerPhone: "0852-9012-3341",
    unitName: "Fortuner 2.8 GR Sport 4x2",
    status: "FOLLOW_UP",
    timestamp: "22 Okt, 11:30 WIB",
    notes:
      "Test drive dijadwalkan hari Sabtu di Agung Toyota UjungBatu jam 10:00 WIB.",
  },
  {
    id: "M005",
    customerName: "Hendra Wijaya",
    customerPhone: "0812-3490-8812",
    unitName: "Hilux Rangga Cab & Chassis 2.4 DSL",
    status: "LOST",
    timestamp: "20 Okt, 10:10 WIB",
    notes:
      "Alasan: Memilih armada bekas karena kebutuhan mendesak untuk operasional kebun sawit.",
  },
];

export const MOCK_TIMELINE_BAMBANG: TimelineDrawerData = {
  prospectId: "PR0S-09412",
  customerName: "Bambang Sudiro",
  customerPhone: "+62 812-7564-9981",
  location: "Desa Tandun, Rohul",
  duplicateCount: 3,
  touchpoints: [
    {
      id: "TP-3",
      stepNumber: 3,
      stepTitle: "INPUT KE-3 • SPK DEAL DISETUJUI",
      date: "24 Okt 2024, 14:20",
      vehicle: "Innova Zenix 2.0 V CVT (Platinum White)",
      description:
        "Customer sepakat ambil Zenix V setelah test drive. Pengajuan leasing disetujui via Toyota Astra Finance (TAF). SPK resmi dicetak #SPK-UB-8821.",
      salesName: "Bagus Triyanto",
      salesNpk: "NPK 092",
      statusBadge: "SPK Terbit",
      statusColor: "green",
    },
    {
      id: "TP-2",
      stepNumber: 2,
      stepTitle: "INPUT KE-2 • WALK-IN SHOWROOM",
      date: "02 Okt 2024, 10:45",
      vehicle: "Hilux Rangga Cab Flatdeck → Beralih Minat Zenix",
      description:
        "Datang ke Showroom Agung Toyota UjungBatu untuk simulasi kredit Rangga. Namun istri tertarik ruang kabin Innova Zenix keluarga.",
      salesName: "Bagus Triyanto",
      salesNpk: "NPK 092",
      statusBadge: "Follow-up Aktif",
      statusColor: "amber",
    },
    {
      id: "TP-1",
      stepNumber: 1,
      stepTitle: "INPUT KE-1 • KANVASING KEBUN",
      date: "12 Sep 2024, 16:15",
      vehicle: "Hilux Single Cab 4×4 MT",
      description:
        "Interaksi perdana di kantor Koperasi Sawit Tandun. Customer minta rincian DP minim untuk armada langsir buah sawit.",
      salesName: "Hendra Wijaya",
      salesNpk: "NPK 084",
      statusBadge: "Inisiasi Pertama",
      statusColor: "slate",
    },
  ],
};

export interface LeaderboardItem {
  id: string;
  rank: number;
  name: string;
  npk: string;
  spk: number;
  conversionRate: number;
}

export const TOP_SALES_LEADERBOARD: LeaderboardItem[] = [
  {
    id: "lb-1",
    rank: 1,
    name: "Dedi Kurniawan",
    npk: "NPK-ATUB-202204",
    spk: 9,
    conversionRate: 22.5,
  },
  {
    id: "lb-2",
    rank: 2,
    name: "Bagus Triyanto",
    npk: "NPK-ATUB-202108",
    spk: 8,
    conversionRate: 19.0,
  },
  {
    id: "lb-3",
    rank: 3,
    name: "Rian Pratama",
    npk: "NPK-ATUB-202311",
    spk: 8,
    conversionRate: 18.2,
  },
  {
    id: "lb-4",
    rank: 4,
    name: "Siti Aminah",
    npk: "NPK-ATUB-202210",
    spk: 7,
    conversionRate: 17.5,
  },
  {
    id: "lb-5",
    rank: 5,
    name: "Hendra Wijaya",
    npk: "NPK-ATUB-201905",
    spk: 6,
    conversionRate: 16.0,
  },
];
