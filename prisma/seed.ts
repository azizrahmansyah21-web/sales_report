import { PrismaClient, Role, SpkStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Laporan SPK H-1 — Starting database seed...");

  const salesPassword = await bcrypt.hash("Sales@2024", 12);
  const adminPassword = await bcrypt.hash("Admin@2024", 12);
  const spvPassword   = await bcrypt.hash("Spv@2024", 12);
  const guestPassword = await bcrypt.hash("Guest@2024", 12);

  // ─── 1. ADMIN ─────────────────────────────────────────────────────
  const admin = await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      name: "Budi Santoso",
      username: "admin",
      email: "admin@atujungbatu.com",
      password: adminPassword,
      role: Role.ADMIN,
      title: "Branch Admin",
      phone: "081234560001",
      isActive: true,
    },
  });
  console.log(`✅ Admin   : ${admin.username} | ${admin.name}`);

  // ─── 2. SPV ───────────────────────────────────────────────────────
  const spv = await prisma.user.upsert({
    where: { username: "spv" },
    update: {},
    create: {
      name: "Arief Wahyudi",
      username: "spv",
      email: "spv@atujungbatu.com",
      password: spvPassword,
      role: Role.SPV,
      title: "Kepala Cabang",
      phone: "081234560002",
      isActive: true,
    },
  });
  console.log(`✅ SPV     : ${spv.username} | ${spv.name}`);

  // ─── 3. SALES TEAM ────────────────────────────────────────────────
  const salesData = [
    {
      username: "bagus",
      name: "Bagus Triyanto",
      email: "bagus@atujungbatu.com",
      nip: "NIP-ATUB-202108",
      title: "Senior Sales Executive",
      phone: "081275649981",
    },
    {
      username: "rian",
      name: "Rian Pratama",
      email: "rian@atujungbatu.com",
      nip: "NIP-ATUB-202311",
      title: "Junior Sales",
      phone: "085290123341",
    },
    {
      username: "dedi",
      name: "Dedi Kurniawan",
      email: "dedi@atujungbatu.com",
      nip: "NIP-ATUB-202204",
      title: "Sales Advisor",
      phone: "082170334812",
    },
    {
      username: "siti",
      name: "Siti Aminah",
      email: "siti@atujungbatu.com",
      nip: "NIP-ATUB-202210",
      title: "Sales Counter",
      phone: "082388914421",
    },
    {
      username: "hendra",
      name: "Hendra Wijaya",
      email: "hendra@atujungbatu.com",
      nip: "NIP-ATUB-201905",
      title: "Commercial Specialist",
      phone: "081234908812",
    },
    {
      username: "dewi",
      name: "Dewi Lestari",
      email: "dewi@atujungbatu.com",
      nip: "NIP-ATUB-202302",
      title: "Account Exec Fleet",
      phone: "081176008120",
    },
    {
      username: "wahyu",
      name: "Wahyu Setiawan",
      email: "wahyu@atujungbatu.com",
      nip: "NIP-ATUB-202401",
      title: "Junior Sales",
      phone: "085265901233",
      isActive: false,
    },
    {
      username: "guest",
      name: "Demo Account",
      email: "guest@atujungbatu.com",
      nip: null,
      title: "Sales Advisor",
      phone: null,
    },
  ];

  const salesUsers: Record<string, string> = {};
  for (const s of salesData) {
    const user = await prisma.user.upsert({
      where: { username: s.username },
      update: {},
      create: {
        name: s.name,
        username: s.username,
        email: s.email,
        nip: s.nip ?? null,
        title: s.title,
        phone: s.phone ?? null,
        password: s.username === "guest" ? guestPassword : salesPassword,
        role: Role.SALES,
        isActive: (s as { isActive?: boolean }).isActive ?? true,
      },
    });
    salesUsers[s.username] = user.id;
    console.log(`👤 Sales   : ${user.username} | ${user.name} (${user.title})`);
  }

  // ─── 4. PLAN SPK — hapus lama agar idempotent ─────────────────────
  await prisma.planSPK.deleteMany({});
  console.log("\n📋 Seeding Plan SPK...");

  // Helper: tanggal plan (H) relatif dari hari ini
  function planDate(daysFromNow: number): Date {
    const d = new Date();
    d.setDate(d.getDate() + daysFromNow);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  // ── Bambang Sudiro dari Bagus — muncul 3x (2x BELUM_BERHASIL = isRepeatFailed) ──
  await prisma.planSPK.create({
    data: {
      salesId: salesUsers["bagus"],
      customerName: "Bambang Sudiro",
      unitName: "Hilux Single Cab 4x4 MT",
      planDate: planDate(-14),
      spkStatus: SpkStatus.BELUM_BERHASIL,
      keterangan: "Customer belum siap DP. Ditunda.",
      isDuplicate: false,
      isRepeatFailed: false,
    },
  });

  await prisma.planSPK.create({
    data: {
      salesId: salesUsers["bagus"],
      customerName: "Bambang Sudiro",
      unitName: "Innova Zenix 2.0 V CVT",
      planDate: planDate(-7),
      spkStatus: SpkStatus.BELUM_BERHASIL,
      keterangan: "Kredit tidak disetujui leasing.",
      isDuplicate: true,
      isRepeatFailed: false,
    },
  });

  await prisma.planSPK.create({
    data: {
      salesId: salesUsers["bagus"],
      customerName: "Bambang Sudiro",
      unitName: "Innova Zenix 2.0 V CVT",
      planDate: planDate(1),
      spkStatus: SpkStatus.PENDING,
      keterangan: null,
      isDuplicate: true,
      isRepeatFailed: true,
    },
  });
  console.log(`  ✓ Bambang Sudiro — 3x plan (2x BELUM_BERHASIL → isRepeatFailed)`);

  // ── Kevin Sanjaya dari Rian — muncul 2x (1x BELUM_BERHASIL) ────────
  await prisma.planSPK.create({
    data: {
      salesId: salesUsers["rian"],
      customerName: "Kevin Sanjaya",
      unitName: "Yaris Cross 1.5 S HEV GR",
      planDate: planDate(-3),
      spkStatus: SpkStatus.BELUM_BERHASIL,
      keterangan: "Customer masih compare harga.",
      isDuplicate: false,
      isRepeatFailed: false,
    },
  });

  await prisma.planSPK.create({
    data: {
      salesId: salesUsers["rian"],
      customerName: "Kevin Sanjaya",
      unitName: "Yaris Cross 1.5 S HEV GR",
      planDate: planDate(1),
      spkStatus: SpkStatus.PENDING,
      keterangan: null,
      isDuplicate: true,
      isRepeatFailed: true,
    },
  });
  console.log(`  ✓ Kevin Sanjaya — 2x plan (1x BELUM_BERHASIL → isRepeatFailed)`);

  // ── Plan hari ini (H=0) — BERHASIL & BELUM_BERHASIL ───────────────
  const todayPlans = [
    {
      salesId: salesUsers["bagus"],
      customerName: "Hj. Endang Rahayu",
      unitName: "All New Avanza 1.5 G CVT",
      spkStatus: SpkStatus.BERHASIL,
      keterangan: "Customer siap, booking fee diterima.",
    },
    {
      salesId: salesUsers["dedi"],
      customerName: "dr. Nurmala Sari, Sp.A",
      unitName: "Yaris Cross 1.5 S HEV GR",
      spkStatus: SpkStatus.BERHASIL,
      keterangan: "Bayar tunai, SPK sudah tanda tangan.",
    },
    {
      salesId: salesUsers["rian"],
      customerName: "Haji Syahril Anwar",
      unitName: "New Fortuner 2.8 GR Sport 4x4",
      spkStatus: SpkStatus.BELUM_BERHASIL,
      keterangan: "Unit tidak tersedia warna Attitude Black.",
    },
    {
      salesId: salesUsers["hendra"],
      customerName: "H. Ruslan Effendi",
      unitName: "Hilux Double Cab 2.4 V 4x4 AT",
      spkStatus: SpkStatus.BERHASIL,
      keterangan: "Closing SPK unit perkebunan.",
    },
    {
      salesId: salesUsers["siti"],
      customerName: "Ibu Rismawati",
      unitName: "All New Rush 1.5 S GR Sport",
      spkStatus: SpkStatus.PENDING,
      keterangan: null,
    },
    {
      salesId: salesUsers["dewi"],
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
  console.log(`  ✓ ${todayPlans.length} plan SPK hari ini`);

  // ── Plan besok (H+1) — semua PENDING (belum hari H) ───────────────
  const tomorrowPlans = [
    {
      salesId: salesUsers["bagus"],
      customerName: "Pak Sunaryo",
      unitName: "Kijang Innova Zenix 2.0 G CVT",
    },
    {
      salesId: salesUsers["rian"],
      customerName: "Deddy Gunawan",
      unitName: "All New Avanza 1.5 G CVT",
    },
    {
      salesId: salesUsers["dedi"],
      customerName: "Pak Johansyah",
      unitName: "New Calya 1.2 G MT",
    },
    {
      salesId: salesUsers["hendra"],
      customerName: "PT Agro Rohul Lestari (Bpk. Edwin)",
      unitName: "Hilux Rangga Cab & Chassis 2.4 DSL",
    },
    {
      salesId: salesUsers["siti"],
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
  console.log(`  ✓ ${tomorrowPlans.length} plan SPK besok (PENDING)`);

  // ─── Summary ──────────────────────────────────────────────────────
  const totalPlans = await prisma.planSPK.count();
  const totalDuplicates = await prisma.planSPK.count({ where: { isDuplicate: true } });
  const totalRepeatFailed = await prisma.planSPK.count({ where: { isRepeatFailed: true } });

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`✅ Seeding selesai!`);
  console.log(`   👥 Users          : ${Object.keys(salesUsers).length + 2} akun (1 admin + 1 spv + ${Object.keys(salesUsers).length} sales)`);
  console.log(`   📋 Plan SPK total : ${totalPlans}`);
  console.log(`   🔄 Duplikat       : ${totalDuplicates} entri`);
  console.log(`   ⚠️  Belum Berhasil berulang: ${totalRepeatFailed} entri`);
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
