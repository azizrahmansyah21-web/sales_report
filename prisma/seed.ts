import { PrismaClient, Role, SpkStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Data Resmi 22 Karyawan & Pimpinan Cabang 247 — Agung Toyota UjungBatu
// Bersumber langsung dari DATA SALESMAN TO AZIS.xlsx
const OFFICIAL_PERSONNEL = [
  // ─── 1. ADMINISTRATION HEAD ───────────────────────────────────────────────
  {
    nip: "050507A403",
    name: "IDHAM KHOLID",
    username: "adh",
    title: "Administration Head",
    role: Role.ADMIN,
    email: "idham.kholid@atujungbatu.com",
    phone: "081268000101",
  },
  // ─── 2. SALES ADMINISTRATION ─────────────────────────────────────────────
  {
    nip: "154549A319",
    name: "FUJI SAFARIYAN",
    username: "admin",
    title: "Sales Administration",
    role: Role.ADMIN,
    email: "fuji.safariyan@atujungbatu.com",
    phone: "081268000102",
  },
  // ─── 3. SALES SUPERVISOR (2 SPV) ─────────────────────────────────────────
  {
    nip: "101257A311",
    name: "AHMAD SOFIAN PANJAITAN",
    username: "spv",
    title: "Sales Supervisor",
    role: Role.SPV,
    email: "ahmad.sofian@atujungbatu.com",
    phone: "081268000103",
  },
  {
    nip: "030371A302",
    name: "DWI ARYANTO. SE",
    username: "spv2",
    title: "Sales Supervisor",
    role: Role.SPV,
    email: "dwi.aryanto@atujungbatu.com",
    phone: "081268000104",
  },
  // ─── 4. TIM SALES (18 PERSONEL) ──────────────────────────────────────────
  {
    nip: "246238A319",
    name: "ADRIANTO",
    username: "adrianto",
    title: "Junior Sales Executive",
    role: Role.SALES,
    email: "adrianto@atujungbatu.com",
    phone: "081270100001",
  },
  {
    nip: "25M899A319",
    name: "ARI SUGANDA",
    username: "ari.suganda",
    title: "Sales Trainee",
    role: Role.SALES,
    email: "ari.suganda@atujungbatu.com",
    phone: "081270100002",
  },
  {
    nip: "185398A319",
    name: "AULIA NOPRI",
    username: "aulia.nopri",
    title: "Junior Sales Executive",
    role: Role.SALES,
    email: "aulia.nopri@atujungbatu.com",
    phone: "081270100003",
  },
  {
    nip: "143438A302",
    name: "AZIS",
    username: "azis",
    title: "Junior Sales Executive",
    role: Role.SALES,
    email: "azis@atujungbatu.com",
    phone: "081270100004",
  },
  {
    nip: "205778A319",
    name: "DENI SAHPUTRA",
    username: "deni.sahputra",
    title: "Junior Sales Executive",
    role: Role.SALES,
    email: "deni.sahputra@atujungbatu.com",
    phone: "081270100005",
  },
  {
    nip: "26M002A319",
    name: "EKO SUFENDRI PUTRA",
    username: "eko.sufendri",
    title: "Sales Trainee",
    role: Role.SALES,
    email: "eko.sufendri@atujungbatu.com",
    phone: "081270100006",
  },
  {
    nip: "246412A319",
    name: "FAHRIZAN HUTASUHUT",
    username: "fahrizan",
    title: "Junior Sales Executive",
    role: Role.SALES,
    email: "fahrizan@atujungbatu.com",
    phone: "081270100007",
  },
  {
    nip: "185350A319",
    name: "JIMMY PRATAMA",
    username: "jimmy.pratama",
    title: "Junior Sales Executive",
    role: Role.SALES,
    email: "jimmy.pratama@atujungbatu.com",
    phone: "081270100008",
  },
  {
    nip: "236186A319",
    name: "MHD REZKI",
    username: "mhd.rezki",
    title: "Junior Sales Executive",
    role: Role.SALES,
    email: "mhd.rezki@atujungbatu.com",
    phone: "081270100009",
  },
  {
    nip: "185399A319",
    name: "MUHAMMAD FAJAR",
    username: "muhammad.fajar",
    title: "Junior Sales Executive",
    role: Role.SALES,
    email: "muhammad.fajar@atujungbatu.com",
    phone: "081270100010",
  },
  {
    nip: "246304A319",
    name: "MUHAMMAD NUR",
    username: "muhammad.nur",
    title: "Junior Sales Executive",
    role: Role.SALES,
    email: "muhammad.nur@atujungbatu.com",
    phone: "081270100011",
  },
  {
    nip: "25M819A319",
    name: "MUSLIM",
    username: "muslim",
    title: "Sales Trainee",
    role: Role.SALES,
    email: "muslim@atujungbatu.com",
    phone: "081270100012",
  },
  {
    nip: "23M364A319",
    name: "RANDI PERDANA NASUTION",
    username: "randi.perdana",
    title: "Sales Trainee",
    role: Role.SALES,
    email: "randi.perdana@atujungbatu.com",
    phone: "081270100013",
  },
  {
    nip: "236184A319",
    name: "RANDI SAPUTRA",
    username: "randi.saputra",
    title: "Junior Sales Executive",
    role: Role.SALES,
    email: "randi.saputra@atujungbatu.com",
    phone: "081270100014",
  },
  {
    nip: "133184A302",
    name: "RISKI ERISMA IHSAN",
    username: "riski.erisma",
    title: "Sales Executive",
    role: Role.SALES,
    email: "riski.erisma@atujungbatu.com",
    phone: "081270100015",
  },
  {
    nip: "164583A319",
    name: "RITA ATRIA",
    username: "rita.atria",
    title: "Sales Counter",
    role: Role.SALES,
    email: "rita.atria@atujungbatu.com",
    phone: "081270100016",
  },
  {
    nip: "154091A319",
    name: "RONAL EKA PUTRA",
    username: "ronal.eka",
    title: "Junior Sales Executive",
    role: Role.SALES,
    email: "ronal.eka@atujungbatu.com",
    phone: "081270100017",
  },
  {
    nip: "24M463A319",
    name: "WINDA FEBRIYENTI",
    username: "winda.febriyenti",
    title: "Sales Trainee",
    role: Role.SALES,
    email: "winda.febriyenti@atujungbatu.com",
    phone: "081270100018",
  },
];

async function main() {
  console.log("🌱 Laporan SPK H-1 — Mulai seeding database cabang 247...");

  // Dummy password hash untuk mematuhi schema User (auth login tetap passwordless via NIP/ADH)
  const defaultPasswordHash = await bcrypt.hash("atub247", 10);

  // 1. Bersihkan plan lama agar idempotent dan terhubung ke sales yang baru
  await prisma.planSPK.deleteMany({});
  console.log("🗑️  Data Plan SPK lama dibersihkan.");

  // 2. Bersihkan user lama yang bukan merupakan 22 anggota resmi
  const validNips = OFFICIAL_PERSONNEL.map((p) => p.nip);
  await prisma.user.deleteMany({
    where: {
      OR: [
        { nip: null },
        { NOT: { nip: { in: validNips } } },
      ],
    },
  });

  // 3. Upsert 22 Karyawan Resmi
  const userMap: Record<string, string> = {}; // key: username -> user.id

  for (const person of OFFICIAL_PERSONNEL) {
    const user = await prisma.user.upsert({
      where: { nip: person.nip },
      update: {
        name: person.name,
        username: person.username,
        email: person.email,
        title: person.title,
        role: person.role,
        phone: person.phone,
        isActive: true,
      },
      create: {
        nip: person.nip,
        name: person.name,
        username: person.username,
        email: person.email,
        password: defaultPasswordHash,
        title: person.title,
        role: person.role,
        phone: person.phone,
        isActive: true,
      },
    });

    userMap[person.username] = user.id;
    console.log(`✅ [${person.role.padEnd(5)}] NIP: ${person.nip} | ${person.name} (${person.title})`);
  }

  // 4. Seeding Contoh Rencana SPK untuk Pengujian & Analitik Operasional
  console.log("\n📋 Seeding Sampel Operasional Plan SPK...");

  function planDate(daysFromNow: number): Date {
    const d = new Date();
    d.setDate(d.getDate() + daysFromNow);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  const azisId = userMap["azis"];
  const adriantoId = userMap["adrianto"];
  const ritaId = userMap["rita.atria"];
  const riskiId = userMap["riski.erisma"];
  const fajarId = userMap["muhammad.fajar"];

  // ── Skenario 1: Bambang Sudiro (Azis) — Muncul 3x (2x BELUM_BERHASIL -> isRepeatFailed = true)
  await prisma.planSPK.create({
    data: {
      salesId: azisId,
      customerName: "Bambang Sudiro",
      unitName: "Hilux Single Cab 4x4 MT",
      planDate: planDate(-14),
      spkStatus: SpkStatus.BELUM_BERHASIL,
      keterangan: "Customer belum siap DP. Ditunda pengajuan bulan depan.",
      isDuplicate: false,
      isRepeatFailed: false,
    },
  });

  await prisma.planSPK.create({
    data: {
      salesId: azisId,
      customerName: "Bambang Sudiro",
      unitName: "Innova Zenix 2.0 V CVT",
      planDate: planDate(-7),
      spkStatus: SpkStatus.BELUM_BERHASIL,
      keterangan: "Kredit leasing BCA Finance reject. Ganti ke Mandiri Utama Finance.",
      isDuplicate: true,
      isRepeatFailed: false,
    },
  });

  await prisma.planSPK.create({
    data: {
      salesId: azisId,
      customerName: "Bambang Sudiro",
      unitName: "Innova Zenix 2.0 V CVT",
      planDate: planDate(1),
      spkStatus: SpkStatus.PENDING,
      keterangan: null,
      isDuplicate: true,
      isRepeatFailed: true,
    },
  });
  console.log("  ✓ Kasus Bambang Sudiro (Azis) — 3x riwayat (isRepeatFailed = true)");

  // ── Skenario 2: Kevin Sanjaya (Adrianto) — Muncul 2x
  await prisma.planSPK.create({
    data: {
      salesId: adriantoId,
      customerName: "Kevin Sanjaya",
      unitName: "Yaris Cross 1.5 S HEV GR",
      planDate: planDate(-3),
      spkStatus: SpkStatus.BELUM_BERHASIL,
      keterangan: "Customer masih bandingkan skema diskon.",
      isDuplicate: false,
      isRepeatFailed: false,
    },
  });

  await prisma.planSPK.create({
    data: {
      salesId: adriantoId,
      customerName: "Kevin Sanjaya",
      unitName: "Yaris Cross 1.5 S HEV GR",
      planDate: planDate(1),
      spkStatus: SpkStatus.PENDING,
      keterangan: null,
      isDuplicate: true,
      isRepeatFailed: true,
    },
  });
  console.log("  ✓ Kasus Kevin Sanjaya (Adrianto) — 2x riwayat (isRepeatFailed = true)");

  // ── Skenario 3: Kasus Lead Dispute (Hj. Nurlela diinput oleh Azis & Rita Atria)
  await prisma.planSPK.create({
    data: {
      salesId: azisId,
      customerName: "Hj. Nurlela",
      unitName: "All New Veloz 1.5 Q CVT",
      planDate: planDate(0),
      spkStatus: SpkStatus.PENDING,
      keterangan: "Follow-up dari pameran UjungBatu.",
      isDuplicate: true,
      isRepeatFailed: false,
    },
  });

  await prisma.planSPK.create({
    data: {
      salesId: ritaId,
      customerName: "Hj. Nurlela",
      unitName: "All New Veloz 1.5 Q CVT",
      planDate: planDate(0),
      spkStatus: SpkStatus.PENDING,
      keterangan: "Customer datang langsung ke counter showroom.",
      isDuplicate: true,
      isRepeatFailed: false,
    },
  });
  console.log("  ✓ Kasus Hj. Nurlela — Potensi Dispute Multi-Sales (Azis & Rita Atria)");

  // ── Skenario 4: Plan Hari Ini (H=0) — Closing & Realisasi Lapangan
  const todayPlans = [
    {
      salesId: azisId,
      customerName: "Hj. Endang Rahayu",
      unitName: "All New Avanza 1.5 G CVT",
      spkStatus: SpkStatus.BERHASIL,
      keterangan: "Customer siap, tanda jadi Rp 5.000.000 lunas diterima.",
    },
    {
      salesId: riskiId,
      customerName: "dr. Nurmala Sari, Sp.A",
      unitName: "Yaris Cross 1.5 S HEV GR",
      spkStatus: SpkStatus.BERHASIL,
      keterangan: "Pembelian tunai, faktur atas nama pribadi.",
    },
    {
      salesId: fajarId,
      customerName: "Haji Syahril Anwar",
      unitName: "New Fortuner 2.8 GR Sport 4x4",
      spkStatus: SpkStatus.BELUM_BERHASIL,
      keterangan: "Warna Attitude Black indent 2 bulan, customer belum mau ganti warna.",
    },
    {
      salesId: azisId,
      customerName: "H. Ruslan Effendi",
      unitName: "Hilux Double Cab 2.4 V 4x4 AT",
      spkStatus: SpkStatus.BERHASIL,
      keterangan: "Closing unit operasional kebun kelapa sawit.",
    },
    {
      salesId: ritaId,
      customerName: "Ibu Rismawati",
      unitName: "All New Rush 1.5 S GR Sport",
      spkStatus: SpkStatus.PENDING,
      keterangan: null,
    },
    {
      salesId: adriantoId,
      customerName: "CV Maju Sejahtera (Bpk. Arifin)",
      unitName: "Hilux Rangga Cab Flatdeck 2.4 DSL",
      spkStatus: SpkStatus.PENDING,
      keterangan: null,
    },
  ];

  for (const p of todayPlans) {
    await prisma.planSPK.create({
      data: { ...p, planDate: planDate(0), isDuplicate: false, isRepeatFailed: false },
    });
  }
  console.log(`  ✓ ${todayPlans.length} plan SPK hari ini (H=0)`);

  // ── Skenario 5: Target SPK Besok (H+1) — Status PENDING
  const tomorrowPlans = [
    {
      salesId: azisId,
      customerName: "Pak Sunaryo",
      unitName: "Kijang Innova Zenix 2.0 G CVT",
    },
    {
      salesId: adriantoId,
      customerName: "Deddy Gunawan",
      unitName: "All New Avanza 1.5 G CVT",
    },
    {
      salesId: riskiId,
      customerName: "Pak Johansyah",
      unitName: "New Calya 1.2 G MT",
    },
    {
      salesId: azisId,
      customerName: "PT Agro Rohul Lestari (Bpk. Edwin)",
      unitName: "Hilux Rangga Cab & Chassis 2.4 DSL",
    },
    {
      salesId: ritaId,
      customerName: "Hj. Maryati",
      unitName: "All New Veloz 1.5 Q CVT",
    },
  ];

  for (const p of tomorrowPlans) {
    await prisma.planSPK.create({
      data: {
        ...p,
        planDate: planDate(1),
        spkStatus: SpkStatus.PENDING,
        keterangan: null,
        isDuplicate: false,
        isRepeatFailed: false,
      },
    });
  }
  console.log(`  ✓ ${tomorrowPlans.length} target SPK besok (H+1) PENDING`);

  // ─── Summary ─────────────────────────────────────────────────────────────
  const totalUsers = await prisma.user.count();
  const totalSales = await prisma.user.count({ where: { role: Role.SALES } });
  const totalPlans = await prisma.planSPK.count();
  const totalDuplicates = await prisma.planSPK.count({ where: { isDuplicate: true } });
  const totalRepeatFailed = await prisma.planSPK.count({ where: { isRepeatFailed: true } });

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("✅ SEEDING SELESAI!");
  console.log(`   👥 Total Pengguna Cabang : ${totalUsers} akun (1 ADH + 1 Admin + 2 SPV + ${totalSales} Sales)`);
  console.log(`   📋 Total Rencana SPK     : ${totalPlans} entri`);
  console.log(`   🔄 Entri Duplikat        : ${totalDuplicates} entri`);
  console.log(`   ⚠️  SPK Belum Berhasil    : ${totalRepeatFailed} entri`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

main()
  .catch((e) => {
    console.error("❌ Seeding gagal:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
