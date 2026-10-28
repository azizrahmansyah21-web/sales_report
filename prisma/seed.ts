import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

// Data Resmi 23 Karyawan & Pimpinan Cabang 220 — Agung Toyota UjungBatu
// Bersumber langsung dari DATA SALESMAN TO AZIS.xlsx & Struktur Pimpinan Cabang
const OFFICIAL_PERSONNEL = [
  // ─── 00. SUPERADMIN (LEAD ARCHITECT & SISTEM KONTROL PUSAT) ───────────────
  {
    nip: "999999A220",
    name: "AZIZ RAHMANSYAH",
    username: "superadmin",
    title: "Lead Architect & Superadmin",
    role: Role.SUPERADMIN,
    email: "aziz@planspk.com",
    phone: "081268000999",
  },
  // ─── 0. BRANCH MANAGER (PIMPINAN TERTINGGI CABANG 220) ────────────────────
  {
    nip: "010101A220",
    name: "BRANCH MANAGER",
    username: "branchmanager",
    title: "Branch Manager",
    role: Role.ADMIN,
    email: "branchmanager@atujungbatu.com",
    phone: "081268000100",
  },
  {
    nip: "154090A319",
    name: "INDRA",
    username: "indra",
    title: "Asisten Branch Manager",
    role: Role.ADMIN,
    email: "indra@atujungbatu.com",
    phone: "081268000108",
  },
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
  {
    nip: "154550A319",
    name: "PERTIWI",
    username: "tiwi",
    title: "Sales Administration",
    role: Role.ADMIN,
    email: "pertiwi@atujungbatu.com",
    phone: "081268000109",
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
  const defaultPasswordHash = "$2a$10$epYF.Gk9l7P6Wv5cZ.wKse21qA6TqGkJr9F9z5Kq9F9z5Kq9F9z5K";

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

  // 4. Data Plan SPK sengaja dikosongkan (Clean Slate) agar siap demo operasional baru
  console.log("\n✨ Tabel Plan SPK bersih (0 entri) — siap untuk input data demo nyata.");

  // ─── Summary ─────────────────────────────────────────────────────────────
  const totalUsers = await prisma.user.count();
  const totalSales = await prisma.user.count({ where: { role: Role.SALES } });
  const totalPlans = await prisma.planSPK.count();

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("✅ SEEDING SELESAI!");
  console.log(`   👥 Total Pengguna Cabang : ${totalUsers} akun (1 ADH + 1 Admin + 2 SPV + ${totalSales} Sales)`);
  console.log(`   📋 Total Rencana SPK     : ${totalPlans} entri (Bersih untuk Demo)`);
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
